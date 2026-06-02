import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cx, Icon, WaypointPin, SiteImg, AccessChip, Stamp, Facilities } from './primitives';
import { round1 } from '../data/campsites';

export default function SiteCard({ site, n, variant = 'grid' }) {
  const navigate = useNavigate();
  const { getSiteData, toggleVisited, togglePlanned } = useStore();
  const data = getSiteData(site.id);
  const [shared, setShared] = useState(false);

  const statusTone = data.visited ? 'terrain' : data.planned ? 'amber' : 'signal';

  async function share(e) {
    e.stopPropagation();
    const url = `${location.origin}/site/${site.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: site.name, text: `${site.name} — motocamping in Kenya 🏕️🏍️`, url }); return; } catch {}
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    setShared(true); setTimeout(() => setShared(false), 1600);
  }

  return (
    <article
      className={cx('sitecard', `sitecard--${variant}`, data.visited && 'is-visited', data.planned && 'is-planned')}
      onClick={() => navigate(`/site/${site.id}`)}>
      <div className="sitecard__media">
        <SiteImg src={site.photos?.[0]} alt={site.name} className="sitecard__img">
          <div className="sitecard__waypoint"><WaypointPin n={n ?? site.id} tone={statusTone} size={28} /></div>
          {site.photos?.length > 1 && (
            <span className="sitecard__photos"><Icon name="camera" size={11} /> {site.photos.length}</span>
          )}
          {(data.visited || data.planned) && (
            <Stamp tone={data.visited ? 'terrain' : 'ink'} className="sitecard__status">
              {data.visited ? '✓ Logged' : 'Planned'}
            </Stamp>
          )}
          <div className="sitecard__access"><AccessChip access={site.access} /></div>
        </SiteImg>
      </div>

      <div className="sitecard__body">
        <div className="sitecard__head">
          <h3 className="sitecard__name">{site.name}</h3>
          <div className="sitecard__score">
            <Icon name="star" size={12} strokeWidth={0} style={{ fill: 'var(--signal)' }} />
            <b>{round1(site.community.overall).toFixed(1)}</b>
            <span>({site.community.count})</span>
          </div>
        </div>
        <div className="sitecard__loc">
          <Icon name="pin" size={12} />
          <span>{site.region}, {site.county}</span>
        </div>
        {variant !== 'row' && <p className="sitecard__desc">{site.description}</p>}

        <div className="sitecard__meta">
          <span className="coord">{site.lat.toFixed(3)}, {site.lng.toFixed(3)}</span>
          <span className="sitecard__dot">·</span>
          <span className="coord">{site.distanceFromNairobi} km</span>
        </div>

        <div className="sitecard__foot">
          <Facilities items={site.facilities.slice(0, variant === 'row' ? 3 : 6)} />
          <div className="sitecard__actions" onClick={e => e.stopPropagation()}>
            <button className={cx('btn-icn', 'btn-icn--sm', shared && 'is-on-terrain')} title="Share" onClick={share}>
              <Icon name={shared ? 'check' : 'share'} size={14} />
            </button>
            <button className={cx('btn-icn', 'btn-icn--sm', data.planned && 'is-on-amber')} title="Add to plan" onClick={e => { e.stopPropagation(); togglePlanned(site.id); }}>
              <Icon name="bookmark" size={14} />
            </button>
            <button className={cx('btn-icn', 'btn-icn--sm', data.visited && 'is-on-terrain')} title="Mark visited" onClick={e => { e.stopPropagation(); toggleVisited(site.id); }}>
              <Icon name="checkCircle" size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
