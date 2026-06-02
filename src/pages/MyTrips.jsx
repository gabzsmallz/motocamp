import { useNavigate } from 'react-router-dom';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';
import { accessLabels, haversineKm } from '../data/campsites';
import { downloadGpx } from '../utils/exportGpx';
import { cx, Icon, ContourBg, TickCorners, WaypointPin, SiteImg, AccessChip } from '../components/primitives';

function EmptyTrips({ kind, go }) {
  return (
    <div className="trips__empty card">
      <TickCorners inset={10} len={14} />
      <Icon name={kind === 'planned' ? 'bookmark' : 'award'} size={34} />
      <div className="display" style={{ fontSize: 21 }}>{kind === 'planned' ? 'No camps planned yet' : 'Logbook is empty'}</div>
      <p className="muted" style={{ margin: 0, maxWidth: 380 }}>
        {kind === 'planned'
          ? 'Save campsites to build a route, see total distance and terrain mix, then export the GPX.'
          : 'Mark campsites as visited to stamp them into your logbook.'}
      </p>
      <button className="btn btn--signal" onClick={() => go(kind === 'planned' ? '/map' : '/list')}>
        <Icon name={kind === 'planned' ? 'map' : 'list'} size={15} />
        {kind === 'planned' ? 'Open the map' : 'Browse campsites'}
      </button>
    </div>
  );
}

export default function MyTrips() {
  const navigate = useNavigate();
  const { campsites } = useCampsitesContext();
  const { getSiteData, togglePlanned } = useStore();

  const planned = campsites.filter(s => getSiteData(s.id).planned);
  const visited = campsites.filter(s => getSiteData(s.id).visited);

  // Route stats
  const order = [...planned].sort((a, b) => a.lat - b.lat);
  let routeKm = 0;
  for (let i = 1; i < order.length; i++) {
    routeKm += haversineKm({ lat: order[i-1].lat, lng: order[i-1].lng }, { lat: order[i].lat, lng: order[i].lng });
  }
  const terrainMix = ['good','moderate','rough'].map(k => ({
    k, ...accessLabels[k], n: planned.filter(s => s.access === k).length,
  }));

  return (
    <div className="trips">
      {/* Header band */}
      <div className="browse__band">
        <ContourBg seeds={[[0.25,0.5,7],[0.82,0.45,6]]} color="var(--line)" opacity={0.6} />
        <div className="wrap browse__band-inner">
          <div>
            <span className="eyebrow">Your routebook</span>
            <h1 className="browse__title display">My Trips</h1>
          </div>
          <div className="browse__counts">
            {[['Planned',planned.length,'amber'],['Visited',visited.length,'terrain'],['Route',routeKm,'signal']].map(([l,v,t]) => (
              <div key={l} className={cx('browse__count', `tone-${t}`)}>
                <div className="browse__count-v font-mono">{l === 'Route' ? v : String(v).padStart(2,'0')}</div>
                <div className="browse__count-l">{l === 'Route' ? 'Route km' : l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap browse__body trips__body">

        {/* PLANNED ROUTE */}
        <section>
          <div className="sec-head">
            <div className="sec-head__title">
              <span className="eyebrow">Next run · {planned.length} camps</span>
              <h2 className="display sec-title">The plan</h2>
            </div>
            {planned.length > 0 && (
              <button className="btn btn--sm" onClick={() => downloadGpx(planned, 'my-trip.gpx', { name: 'My KenyaMotocamp Trip' })}>
                <Icon name="download" size={14} /> Export route GPX
              </button>
            )}
          </div>

          {planned.length === 0 ? (
            <EmptyTrips kind="planned" go={navigate} />
          ) : (
            <div className="trips__route">
              <div className="trips__route-meta panel">
                <div className="trips__rm">
                  <span className="coord">Total route</span>
                  <span className="trips__rm-v">{routeKm} <small>km</small></span>
                </div>
                <div className="trips__terrain">
                  {terrainMix.filter(t => t.n > 0).map(t => (
                    <div key={t.k} className="trips__terrain-row">
                      <span className={cx('access-chip', `tone-${t.token}`)} style={{ minWidth: 110 }}>
                        <span className="access-chip__dot" />{t.label}
                      </span>
                      <div className="trips__terrain-bar">
                        <div className={cx('trips__terrain-fill', `bg-${t.token}`)} style={{ width: `${(t.n / planned.length) * 100}%` }} />
                      </div>
                      <span className="coord">{t.n}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ol className="trips__timeline">
                {order.map((s, i) => (
                  <li key={s.id} className="trips__stop" onClick={() => navigate(`/site/${s.id}`)}>
                    <div className="trips__stop-marker">
                      <WaypointPin n={i + 1} tone="amber" size={30} />
                      {i < order.length - 1 && <span className="trips__stop-line" />}
                    </div>
                    <SiteImg src={s.photos?.[0]} alt={s.name} className="trips__stop-img" />
                    <div className="trips__stop-body">
                      <div className="trips__stop-name">{s.name}</div>
                      <div className="trips__stop-loc">{s.region}, {s.county}</div>
                      <div className="trips__stop-meta">
                        <AccessChip access={s.access} />
                        <span className="coord">{s.elev ? `${s.elev} m · ` : ''}{s.fee}</span>
                      </div>
                    </div>
                    <button className="btn-icn btn-icn--sm"
                      onClick={e => { e.stopPropagation(); togglePlanned(s.id); }} title="Remove from plan">
                      <Icon name="x" size={14} />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* VISITED LOGBOOK */}
        <section style={{ marginTop: 44 }}>
          <div className="sec-head">
            <div className="sec-head__title">
              <span className="eyebrow">Stamped · {visited.length} logged</span>
              <h2 className="display sec-title">Logbook</h2>
            </div>
            {visited.length > 0 && (
              <button className="btn btn--sm" onClick={() => downloadGpx(visited, 'motocamp-visited.gpx', { name: 'My Visited KenyaMotocamp Sites' })}>
                <Icon name="download" size={14} /> Export GPX
              </button>
            )}
          </div>

          {visited.length === 0 ? (
            <EmptyTrips kind="visited" go={navigate} />
          ) : (
            <div className="trips__logbook">
              {visited.map(s => {
                const d = getSiteData(s.id);
                return (
                  <div key={s.id} className="logstamp" onClick={() => navigate(`/site/${s.id}`)}>
                    <SiteImg src={s.photos?.[0]} alt={s.name} className="logstamp__img">
                      <span className="logstamp__seal"><Icon name="check" size={14} /></span>
                    </SiteImg>
                    <div className="logstamp__body">
                      <div className="logstamp__name">{s.name}</div>
                      <div className="coord logstamp__date">Logged {d.visitedDate || '—'}</div>
                      {d.rating > 0 && (
                        <div className="logstamp__stars">
                          {[1,2,3,4,5].map(n => <Icon key={n} name="star" size={12} strokeWidth={0} style={{ fill: d.rating >= n ? 'var(--signal)' : 'var(--line-2)' }} />)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
