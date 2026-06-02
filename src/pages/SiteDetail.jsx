import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../hooks/useComments';
import { RATING_DIMS, sourceLinks, round1 } from '../data/campsites';
import { cx, Icon, ContourBg, TickCorners, AccessChip, RatingBar, ScoreBadge, StarInput, AvatarIcon, SiteImg, Facilities } from '../components/primitives';

// ---- Photo gallery ---------------------------------------------------
function PhotoGallery({ photos = [], name }) {
  const [active, setActive] = useState(0);
  const [err, setErr] = useState({});
  if (!photos.length) return (
    <div className="gallery gallery--empty"><Icon name="mountain" size={36} /><span className="coord">No photos logged yet</span></div>
  );
  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={photos[active]} alt={name} onError={() => setErr(e => ({ ...e, [active]: true }))} />
        <TickCorners inset={10} len={14} color="#fff" opacity={0.7} />
        <span className="gallery__count font-mono">{active + 1} / {photos.length}</span>
      </div>
      {photos.length > 1 && (
        <div className="gallery__thumbs">
          {photos.map((p, i) => (
            <button key={i} className={cx('gallery__thumb', i === active && 'is-on')} onClick={() => setActive(i)}>
              <img src={p} alt="" onError={() => setErr(e => ({ ...e, [i]: true }))} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Field report card -----------------------------------------------
function ReviewCard({ r, siteId }) {
  const { user } = useAuth();
  const { deleteComment } = useComments(siteId);
  const [confirmDel, setConfirmDel] = useState(false);
  const isOwn = user?.uid === r.uid || r.mine;

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); return; }
    await deleteComment?.(r.id).catch(console.error);
  }

  return (
    <article className={cx('review', r.mine && 'review--mine')}>
      <div className="review__head">
        <AvatarIcon name={r.rider || r.displayName || 'Rider'} size={38} />
        <div className="review__who">
          <div className="review__name">
            {r.rider || r.displayName}
            {(r.mine || isOwn) && <span className="review__you-tag">You</span>}
          </div>
          <div className="review__bike font-mono"><Icon name="compass" size={11} /> {r.bike || 'Adventure bike'}</div>
        </div>
        <div className="review__overall">
          <div className="review__overall-n">{round1(r.overall || r.rating || 0).toFixed(1)}</div>
          <div className="review__date font-mono">{r.date || r.createdAt?.toDate?.()?.toISOString?.()?.slice?.(0,10) || '—'}</div>
        </div>
      </div>
      <p className="review__text">{r.text}</p>
      {r.photo && <div className="review__photo"><img src={r.photo} alt="" loading="lazy" /></div>}
      {r.dims && (
        <div className="review__dims">
          {RATING_DIMS.map(d => (
            <div key={d.key} className="review__dim">
              <span className="review__dim-l font-mono">{d.label}</span>
              <div className="review__dim-dots">
                {[1,2,3,4,5].map(n => <span key={n} className={cx('review__dot', r.dims[d.key] >= n - 0.25 && 'is-on')} />)}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="review__foot">
        {isOwn && (
          <button className={cx('review__helpful', confirmDel && 'is-on')} onClick={handleDelete}>
            <Icon name="trash" size={14} /> {confirmDel ? 'Confirm delete' : 'Delete'}
          </button>
        )}
      </div>
    </article>
  );
}

// ---- Review form -----------------------------------------------------
function ReviewForm({ site }) {
  const { user, signIn } = useAuth();
  const { addComment } = useComments(site.id);
  const [open, setOpen]   = useState(false);
  const [dims, setDims]   = useState({ road: 0, facilities: 0, scenery: 0, safety: 0 });
  const [text, setText]   = useState('');
  const [bike, setBike]   = useState('');
  const [done, setDone]   = useState(false);
  const ready = Object.values(dims).every(v => v > 0) && text.trim().length > 4;

  async function submit(e) {
    e.preventDefault();
    if (!ready || !user) return;
    const overall = (dims.road + dims.facilities + dims.scenery + dims.safety) / 4;
    await addComment({
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Rider',
      photoURL: user.photoURL || null,
      text: text.trim(),
      rating: Math.round(overall),
      // Also store structured dims and rider info
      dims: { ...dims },
      overall: Math.round(overall * 10) / 10,
      bike: bike.trim() || 'My bike',
    });
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); setDims({ road: 0, facilities: 0, scenery: 0, safety: 0 }); setText(''); setBike(''); }, 1600);
  }

  if (!user) return (
    <button className="btn btn--signal btn--block" onClick={signIn}>
      <Icon name="plus" size={16} /> Sign in to file a field report
    </button>
  );

  if (!open) return (
    <button className="btn btn--signal btn--block reviewform__open" onClick={() => setOpen(true)}>
      <Icon name="plus" size={16} /> File a field report
    </button>
  );

  return (
    <form className="reviewform card" onSubmit={submit}>
      <TickCorners inset={9} len={12} />
      <div className="reviewform__inner">
        {done ? (
          <div className="reviewform__done">
            <span className="reviewform__done-mark"><Icon name="check" size={26} /></span>
            <div className="display" style={{ fontSize: 20 }}>Report filed.</div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>Your scores now count toward the community average.</p>
          </div>
        ) : (
          <>
            <div className="reviewform__head">
              <span className="eyebrow">New field report</span>
              <button type="button" className="btn-icn btn-icn--sm" onClick={() => setOpen(false)}><Icon name="x" size={15} /></button>
            </div>
            <div className="reviewform__dims">
              {RATING_DIMS.map(d => (
                <div key={d.key} className="reviewform__dim">
                  <div className="reviewform__dim-head">
                    <span className="reviewform__dim-l">{d.label}</span>
                    <span className="reviewform__dim-hint">{d.hint}</span>
                  </div>
                  <StarInput value={dims[d.key]} onChange={v => setDims(s => ({ ...s, [d.key]: v }))} size={24} />
                </div>
              ))}
            </div>
            <div className="reviewform__field">
              <label className="field-label">Your bike (optional)</label>
              <input className="input" value={bike} onChange={e => setBike(e.target.value)} placeholder="e.g. KTM 790 Adventure" />
            </div>
            <div className="reviewform__field">
              <label className="field-label">Trip notes</label>
              <textarea className="textarea" rows={3} value={text} onChange={e => setText(e.target.value)}
                placeholder="How was the approach? Facilities? Anything riders should know?" />
            </div>
            <button className="btn btn--signal btn--block" disabled={!ready}>Publish report</button>
          </>
        )}
      </div>
    </form>
  );
}

// ---- Main SiteDetail page -------------------------------------------
export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campsites } = useCampsitesContext();
  const { getSiteData, toggleVisited, togglePlanned, setNotes } = useStore();
  const { comments, loading: commentsLoading } = useComments(id);

  const site = campsites.find(s => String(s.id) === String(id));
  const [localNotes, setLocalNotes] = useState('');
  const [saved, setSaved]           = useState(false);
  const [shared, setShared]         = useState(false);
  const [sortRev, setSortRev]       = useState('recent');
  const saveT = useRef(null);

  useEffect(() => {
    if (site) setLocalNotes(getSiteData(site.id).notes || '');
  }, [id]);

  if (!site) return (
    <div className="wrap section" style={{ textAlign: 'center', minHeight: '50vh' }}>
      <p className="muted">Campsite not found.</p>
      <button className="btn" onClick={() => navigate('/list')}>Back to campsites</button>
    </div>
  );

  const data = getSiteData(site.id);
  const comm = site.community;

  function changeNotes(v) {
    setLocalNotes(v); setSaved(false);
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => { setNotes(site.id, v); setSaved(true); setTimeout(() => setSaved(false), 1800); }, 700);
  }

  function share() {
    const url = `${location.origin}/site/${site.id}`;
    if (navigator.share) { navigator.share({ title: site.name, text: `${site.name} — motocamping in Kenya`, url }).catch(() => {}); return; }
    navigator.clipboard?.writeText(url).catch(() => {});
    setShared(true); setTimeout(() => setShared(false), 1800);
  }

  // Merge seeded reviews (from data) + real Firebase comments
  const allReviews = [
    ...comments.map(c => ({
      id: c.id, rider: c.displayName, bike: c.bike || 'My bike',
      overall: c.overall || c.rating || 0, date: c.createdAt?.toDate?.()?.toISOString?.()?.slice?.(0,10) || '—',
      text: c.text, dims: c.dims || null, photo: null, mine: true, uid: c.uid,
    })),
  ].sort((a, b) =>
    sortRev === 'recent' ? (a.date < b.date ? 1 : -1) :
    sortRev === 'high'   ? b.overall - a.overall : 0
  );

  return (
    <div className="detail">
      <div className="wrap detail__crumb">
        <button onClick={() => navigate('/map')}><Icon name="arrowLeft" size={15} /> Map</button>
        <span className="faint">/</span>
        <button onClick={() => navigate('/list')}>Campsites</button>
        <span className="faint">/</span>
        <span className="muted">{site.name}</span>
      </div>

      <div className="wrap detail__grid">
        {/* MAIN */}
        <div className="detail__main">
          <PhotoGallery photos={site.photos || []} name={site.name} />

          <div className="detail__titleblock">
            <div className="detail__title-row">
              <div>
                <span className="eyebrow">{site.region}</span>
                <h1 className="detail__title display">{site.name}</h1>
                <div className="detail__loc">
                  <Icon name="pin" size={14} /> {site.county} County
                  <span className="coord detail__gps">{site.lat.toFixed(4)}°, {site.lng.toFixed(4)}°</span>
                </div>
              </div>
              <AccessChip access={site.access} size="lg" />
            </div>

            <div className="detail__specs">
              {[
                { l: 'Elevation',    v: `${(site.elev||0).toLocaleString()} m`,      icon: 'mountain'   },
                { l: 'From Nairobi', v: `${site.distanceFromNairobi} km`,             icon: 'navigation' },
                { l: 'Camp fee',     v: site.fee,                                     icon: 'fuel'       },
                { l: 'Community',    v: `${round1(comm.overall).toFixed(1)} / 5`,     icon: 'star'       },
              ].map(sp => (
                <div key={sp.l} className="detail__spec">
                  <Icon name={sp.icon} size={15} className="detail__spec-icn" />
                  <div>
                    <div className="detail__spec-l font-mono">{sp.l}</div>
                    <div className="detail__spec-v">{sp.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <section className="detail__section">
            <h2 className="detail__h2">Field notes</h2>
            <p className="detail__about">{site.description}</p>
            <div className="detail__tags">
              {(site.tags||[]).map(t => <span key={t} className="tag-pill">{t.replace(/_/g,' ')}</span>)}
            </div>
          </section>

          {/* Facilities */}
          <section className="detail__section">
            <h2 className="detail__h2">On site</h2>
            <Facilities items={site.facilities} className="detail__facs" />
          </section>

          {/* Community scores */}
          <section className="detail__section detail__ratings">
            <div className="sec-head" style={{ marginBottom: 16 }}>
              <h2 className="detail__h2" style={{ margin: 0 }}>Community scores</h2>
              <span className="coord">{comm.count} field report{comm.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="detail__ratings-grid">
              <div className="detail__overall">
                <ScoreBadge value={comm.overall} size="lg" />
                <div className="detail__overall-stars">
                  {[1,2,3,4,5].map(n => (
                    <Icon key={n} name="star" size={16} strokeWidth={0}
                      style={{ fill: comm.overall >= n - 0.4 ? 'var(--signal)' : 'var(--line-2)' }} />
                  ))}
                </div>
                <div className="coord">from {comm.count} riders</div>
              </div>
              <div className="detail__dimbars">
                {RATING_DIMS.map(d => (
                  <RatingBar key={d.key} label={d.label} value={comm[d.key]} hint={d.hint} />
                ))}
              </div>
            </div>
          </section>

          {/* Field reports */}
          <section className="detail__section">
            <div className="sec-head" style={{ marginBottom: 14 }}>
              <h2 className="detail__h2" style={{ margin: 0 }}>Field reports</h2>
              <div className="detail__sort">
                <span className="coord">Sort</span>
                <select className="select select--mini" value={sortRev} onChange={e => setSortRev(e.target.value)}>
                  <option value="recent">Most recent</option>
                  <option value="high">Highest rated</option>
                </select>
              </div>
            </div>
            <div className="detail__reviews">
              {allReviews.map(r => <ReviewCard key={r.id} r={r} siteId={site.id} />)}
              {!commentsLoading && allReviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>
                  <Icon name="compass" size={28} style={{ opacity: .3 }} />
                  <p style={{ marginTop: 8, fontSize: 13 }}>No field reports yet. Be the first.</p>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16 }}><ReviewForm site={site} /></div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="detail__side">
          <div className="detail__actions card">
            <TickCorners inset={9} len={12} />
            <div className="detail__actions-inner">
              <button className={cx('btn','btn--block', data.visited ? 'btn--ink' : '')} onClick={() => toggleVisited(site.id)}>
                <Icon name="checkCircle" size={16} /> {data.visited ? `Logged · ${data.visitedDate || ''}` : 'Mark as visited'}
              </button>
              <button className={cx('btn','btn--block', data.planned ? 'btn--signal' : '')} onClick={() => togglePlanned(site.id)}>
                <Icon name="bookmark" size={16} /> {data.planned ? 'In My Trips' : 'Add to My Trips'}
              </button>
              <div className="detail__actions-row">
                <a className="btn" href={`https://www.google.com/maps?q=${site.lat},${site.lng}`} target="_blank" rel="noreferrer">
                  <Icon name="navigation" size={15} /> Navigate
                </a>
                <button className={cx('btn', shared && 'btn--ink')} onClick={share}>
                  <Icon name={shared ? 'check' : 'share'} size={15} /> {shared ? 'Copied' : 'Share'}
                </button>
              </div>
            </div>
          </div>

          {/* Private logbook */}
          <div className="detail__log card">
            <div className="detail__log-inner">
              <div className="sec-head" style={{ marginBottom: 10 }}>
                <span className="eyebrow">My logbook</span>
                {saved && <span className="detail__saved coord"><Icon name="check" size={12} /> saved</span>}
              </div>
              <textarea className="textarea detail__notes" rows={5} value={localNotes} onChange={e => changeNotes(e.target.value)}
                placeholder="Private notes — camp spots, where you got fuel, who you rode with…" />
            </div>
          </div>

          {/* Featured by */}
          {site.sources?.length > 0 && (
            <div className="detail__sources card">
              <div className="detail__sources-inner">
                <span className="eyebrow">Featured by</span>
                <div className="detail__source-list">
                  {site.sources.map(src => (
                    <a key={src} className="detail__source" href={sourceLinks[src] || '#'} target="_blank" rel="noreferrer">
                      <span className="detail__source-play"><Icon name="navigation" size={11} /></span>
                      <span>{src}</span>
                      <Icon name="externalLink" size={12} className="detail__source-ext" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
