import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCampsitesContext } from '../context/CampsitesContext';
import { cx, Icon, TickCorners, AccessChip, WaypointPin } from '../components/primitives';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const { campsites } = useCampsitesContext();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [tab, setTab] = useState('queue');
  const [loadingSugg, setLoadingSugg] = useState(true);

  useEffect(() => { if (!loading && (!user || !isAdmin)) navigate('/'); }, [user, isAdmin, loading]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'suggestions'), snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
      setSuggestions(items); setLoadingSugg(false);
    });
    return unsub;
  }, [isAdmin]);

  if (loading || !isAdmin) return null;

  const tabs = [
    { k: 'queue',     label: 'Moderation', count: suggestions.length },
    { k: 'photos',    label: 'Photos'      },
    { k: 'stats',     label: 'Stats'       },
    { k: 'directory', label: 'Directory'   },
  ];

  return (
    <div className="admin">
      <div className="admin__band">
        <div className="admin__band-inner">
          <span className="admin__shield"><Icon name="shield" size={20} /></span>
          <div>
            <h1 className="admin__title display">Editor console</h1>
            <div className="coord" style={{ color: 'rgba(236,226,204,.55)', marginTop: 4 }}>
              Signed in as {user?.email}
            </div>
          </div>
          <div className="admin__band-stat">
            <div className="admin__band-stat-v font-mono">{suggestions.length}</div>
            <div className="admin__band-stat-l">pending</div>
          </div>
        </div>
      </div>

      <div className="admin__body">
        <div className="admin__tabs">
          {tabs.map(t => (
            <button key={t.k} className={cx('admin__tab', tab === t.k && 'is-on')} onClick={() => setTab(t.k)}>
              {t.label}
              {t.count > 0 && <span className="admin__tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {tab === 'queue'     && <QueueTab suggestions={suggestions} loading={loadingSugg} user={user} />}
        {tab === 'photos'    && <PhotosTab campsites={campsites} />}
        {tab === 'stats'     && <StatsTab campsites={campsites} suggestions={suggestions} />}
        {tab === 'directory' && <DirectoryTab campsites={campsites} />}
      </div>
    </div>
  );
}

// ---- Moderation queue -----------------------------------------------
function QueueTab({ suggestions, loading, user }) {
  const { campsites } = useCampsitesContext();
  const [acted, setActed] = useState({});

  async function approveSuggestion(s) {
    setActed(a => ({ ...a, [s.id]: 'approve' }));
    const campsite = {
      name: s.name || 'Unnamed', region: s.region || '', county: s.county || '',
      lat: parseFloat(s.lat) || 0, lng: parseFloat(s.lng) || 0,
      description: s.description || '', access: s.access || 'moderate',
      facilities: s.facilities || [], fee: s.fee || 'Unknown',
      sources: s.source ? [s.source] : ['Community'],
      youtubeLinks: [], tags: [], photos: [],
      approvedAt: serverTimestamp(), approvedBy: user?.email,
    };
    setTimeout(async () => {
      await addDoc(collection(db, 'campsites'), campsite);
      await deleteDoc(doc(db, 'suggestions', s.id));
    }, 420);
  }

  async function rejectSuggestion(id) {
    setActed(a => ({ ...a, [id]: 'reject' }));
    setTimeout(() => deleteDoc(doc(db, 'suggestions', id)), 420);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)' }}>Loading…</div>;

  if (!suggestions.length) return (
    <div className="admin__empty card">
      <TickCorners inset={10} len={14} />
      <Icon name="checkCircle" size={34} />
      <div className="display" style={{ fontSize: 21 }}>Queue clear</div>
      <p className="muted" style={{ margin: 0 }}>No campsites waiting for review.</p>
    </div>
  );

  return (
    <div>
      <p className="admin__lead">Review rider-submitted campsites. Approving publishes them live; rejecting discards the submission.</p>
      <div className="admin__queue">
        {suggestions.map(s => (
          <article key={s.id} className={cx('subm card', acted[s.id] && `is-${acted[s.id]}`)}>
            <div className="subm__inner">
              <div className="subm__head">
                <div>
                  <h3 className="subm__name">{s.name || 'Unnamed'}</h3>
                  <div className="subm__loc">
                    <Icon name="pin" size={12} /> {s.region && `${s.region}, `}{s.county}
                    {s.submittedAt && ` · ${new Date(s.submittedAt.seconds * 1000).toLocaleDateString()}`}
                  </div>
                </div>
                {s.access && <AccessChip access={s.access} />}
              </div>
              <p className="subm__desc">{s.description}</p>
              <div className="subm__meta">
                {s.lat && s.lng && <span className="coord"><Icon name="pin" size={11} /> {s.lat}, {s.lng}</span>}
                {s.fee && <span className="coord">{s.fee}</span>}
                {s.facilities?.length > 0 && <span className="coord">{s.facilities.length} facilities</span>}
                {s.source && <span className="coord">▶ {s.source}</span>}
                <span className="coord subm__by">{s.submittedBy || s.submittedBy}</span>
              </div>
              <div className="subm__actions">
                <button className="btn btn--signal btn--sm" onClick={() => approveSuggestion(s)}>
                  <Icon name="check" size={15} /> Approve &amp; publish
                </button>
                <button className="btn btn--sm" onClick={() => rejectSuggestion(s.id)}>
                  <Icon name="x" size={15} /> Reject
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ---- Photos tab -----------------------------------------------------
function PhotosTab({ campsites }) {
  const [siteId, setSiteId] = useState('');
  const [url, setUrl]       = useState('');
  const [msg, setMsg]       = useState('');
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const fileRef = useRef();
  const site = campsites.find(s => String(s.id) === String(siteId));

  function getCampsiteRef(id) { return doc(db, 'campsites', String(id)); }

  async function addUrl() {
    if (!url.trim() || !site) return;
    try {
      await updateDoc(getCampsiteRef(siteId), { photos: arrayUnion(url.trim()) });
    } catch {
      await addDoc(collection(db, 'campsites'), { ...site, photos: [url.trim()] });
    }
    setUrl(''); setMsg('Photo URL added!'); setTimeout(() => setMsg(''), 3000);
  }

  async function removePhoto(p) {
    await updateDoc(getCampsiteRef(siteId), { photos: arrayRemove(p) }).catch(console.error);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]; if (!file || !site) return;
    setUploading(true); setProgress(0);
    const sRef = storageRef(storage, `campsite-photos/${siteId}/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(sRef, file);
    task.on('state_changed',
      snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      err => { console.error(err); setUploading(false); },
      async () => {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        try { await updateDoc(getCampsiteRef(siteId), { photos: arrayUnion(downloadUrl) }); }
        catch { await addDoc(collection(db, 'campsites'), { ...site, photos: [downloadUrl] }); }
        setUploading(false); setProgress(0); setMsg('Photo uploaded!'); setTimeout(() => setMsg(''), 3000);
      }
    );
  }

  const currentPhotos = site?.photos || [];

  return (
    <div>
      <p className="admin__lead">Manage photos for any campsite. The first photo is the cover image shown on cards.</p>
      <div className="photos__select">
        <label className="field-label">Select campsite</label>
        <select className="select" value={siteId} onChange={e => { setSiteId(e.target.value); setMsg(''); }} style={{ maxWidth: 420 }}>
          <option value="">— Choose a campsite —</option>
          {campsites.map(s => <option key={s.id} value={s.id}>{s.name} ({(s.photos||[]).length} photos)</option>)}
        </select>
      </div>

      {site && (
        <div className="photos__panel card">
          <div className="photos__panel-inner">
            <h3 className="photos__h"><Icon name="image" size={16} /> {site.name}</h3>
            <div className="photos__add">
              <div>
                <label className="field-label"><Icon name="link" size={11} /> Paste photo URL</label>
                <div className="row gap-2">
                  <input className="input" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUrl()} placeholder="https://images.unsplash.com/…" />
                  <button className="btn btn--signal" type="button" onClick={addUrl} disabled={!url.trim()}>Add</button>
                </div>
              </div>
              <div>
                <label className="field-label"><Icon name="upload" size={11} /> Or upload</label>
                <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} />
                <button className="btn" type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Icon name="upload" size={15} /> {uploading ? `Uploading ${progress}%` : 'Choose image'}
                </button>
                {uploading && <div style={{ height: 4, background: 'var(--paper-2)', borderRadius: 100, marginTop: 8, overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'var(--terrain)', transition: 'width .2s' }} /></div>}
              </div>
            </div>
            {msg && <div className="photos__msg coord"><Icon name="check" size={12} /> {msg}</div>}
            <div className="photos__grid">
              {currentPhotos.map((p, i) => (
                <div key={p+i} className="photos__cell">
                  <img src={p} alt="" loading="lazy" />
                  <button className="photos__cell-del" onClick={() => removePhoto(p)} title="Remove"><Icon name="trash" size={13} /></button>
                  {i === 0 && <span className="photos__cell-cover">Cover</span>}
                </div>
              ))}
              {!currentPhotos.length && <div className="photos__none coord">No photos yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Stats tab ------------------------------------------------------
function StatsTab({ campsites, suggestions }) {
  const totalReports = campsites.reduce((a, s) => a + s.community.count, 0);
  const avg = campsites.reduce((a, s) => a + s.community.overall, 0) / campsites.length;
  const counties = [...new Set(campsites.map(s => s.county))].map(c => ({ c, n: campsites.filter(s => s.county === c).length })).sort((a, b) => b.n - a.n);
  const maxC = Math.max(...counties.map(c => c.n));
  const access = ['good','moderate','rough'].map(k => ({ k, n: campsites.filter(s => s.access === k).length }));
  const tokenMap = { good: 'terrain', moderate: 'amber', rough: 'rust' };
  const labelMap = { good: 'Good Road', moderate: 'Moderate', rough: 'Rough / ADV' };

  return (
    <div className="stats">
      <div className="stats__cards">
        {[
          { l: 'Campsites live',  v: campsites.length,      icon: 'tent'  },
          { l: 'Field reports',   v: totalReports,           icon: 'users' },
          { l: 'Avg score',       v: avg.toFixed(1),         icon: 'star'  },
          { l: 'Pending review',  v: suggestions.length,     icon: 'clock' },
        ].map(s => (
          <div key={s.l} className="stats__card card">
            <Icon name={s.icon} size={20} className="stats__card-icn" />
            <div className="stats__card-v font-mono">{s.v}</div>
            <div className="stats__card-l">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="stats__cols">
        <div className="stats__panel card">
          <div className="stats__panel-inner">
            <h3 className="stats__h">Coverage by county</h3>
            <div className="stats__bars">
              {counties.map(c => (
                <div key={c.c} className="stats__bar-row">
                  <span className="stats__bar-l">{c.c}</span>
                  <div className="stats__bar-track"><div className="stats__bar-fill" style={{ width: `${(c.n/maxC)*100}%` }} /></div>
                  <span className="coord">{c.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="stats__panel card">
          <div className="stats__panel-inner">
            <h3 className="stats__h">Terrain distribution</h3>
            <div className="stats__access">
              {access.map(a => (
                <div key={a.k} className="stats__access-row">
                  <span className={cx('stats__access-dot', `bg-${tokenMap[a.k]}`)} />
                  <span className="stats__access-l">{labelMap[a.k]}</span>
                  <div className="stats__bar-track"><div className={cx('stats__bar-fill', `bg-${tokenMap[a.k]}`)} style={{ width: `${(a.n/campsites.length)*100}%` }} /></div>
                  <span className="coord">{a.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Directory tab --------------------------------------------------
function DirectoryTab({ campsites }) {
  const navigate = useNavigate();
  return (
    <div>
      <p className="admin__lead">All {campsites.length} campsites on file. Click any row to open its field report.</p>
      <div className="dir card">
        <div className="dir__head">
          <span>#</span><span>Campsite</span><span>County</span><span>Access</span><span>Reports</span><span>Score</span>
        </div>
        {campsites.map(s => (
          <div key={s.id} className="dir__row" onClick={() => navigate(`/site/${s.id}`)}>
            <span className="coord">{String(s.id).padStart ? String(s.id).substring(0,4) : s.id}</span>
            <span className="dir__name">{s.name}</span>
            <span className="dir__county">{s.county}</span>
            <span><AccessChip access={s.access} /></span>
            <span className="coord">{s.community?.count || 0}</span>
            <span className="dir__score">★ {(Math.round((s.community?.overall||0) * 10) / 10).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
