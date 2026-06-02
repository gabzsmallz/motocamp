import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';
import { accessLabels, round1 } from '../data/campsites';
import { downloadGpx } from '../utils/exportGpx';
import { cx, Icon, WaypointPin, SiteImg, AccessChip } from '../components/primitives';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ACCESS_HEX = { good: '#4c6a3c', moderate: '#b27a14', rough: '#a8341c' };
const STATUS_HEX = { visited: '#4c6a3c', planned: '#b27a14' };

function markerHTML(n, color, active) {
  return `<span class="lf-pin${active ? ' is-active' : ''}" style="--pc:${color}"><span class="lf-pin__n">${n}</span></span>`;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 11, { duration: 1.2 }); }, [target]);
  return null;
}

export default function MapView() {
  const navigate = useNavigate();
  const { campsites } = useCampsitesContext();
  const { getSiteData } = useStore();
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [hoverId, setHoverId] = useState(null);
  const [colorBy, setColorBy] = useState('access');
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef  = useRef(null);
  const mapEl   = useRef(null);
  const markers = useRef({});

  const filtered = useMemo(() => campsites.filter(s => {
    const d = getSiteData(s.id);
    const mS = !search || (s.name + s.region + s.county + (s.tags || []).join(' ')).toLowerCase().includes(search.toLowerCase());
    const mF = filter === 'all' ? true : filter === 'visited' ? d.visited : filter === 'planned' ? d.planned : filter === 'unvisited' ? !d.visited && !d.planned : true;
    return mS && mF;
  }), [campsites, search, filter, getSiteData]);

  // init Leaflet map
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const map = L.map(mapEl.current, { center: [0.6, 37.6], zoom: 6, zoomControl: false, attributionControl: false });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 17 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution('Tiles © Esri').addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // rebuild markers
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    Object.values(markers.current).forEach(m => m.remove());
    markers.current = {};
    filtered.forEach(s => {
      const d = getSiteData(s.id);
      const color = colorBy === 'status'
        ? (d.visited ? STATUS_HEX.visited : d.planned ? STATUS_HEX.planned : '#9a8e76')
        : ACCESS_HEX[s.access];
      const icon = L.divIcon({ html: markerHTML(s.id, color, false), className: 'lf-divicon', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(map);
      const acc = accessLabels[s.access];
      m.bindPopup(
        `<div class="lf-pop">
           <div class="lf-pop__name">${s.name}</div>
           <div class="lf-pop__loc">${s.region}, ${s.county}</div>
           <div class="lf-pop__row">
             <span class="lf-pop__chip" style="--c:${ACCESS_HEX[s.access]}">${acc.label}</span>
             <span class="lf-pop__score">★ ${round1(s.community.overall).toFixed(1)}</span>
           </div>
           <div class="lf-pop__meta">${s.fee} · ${s.distanceFromNairobi} km from Nairobi</div>
           <button class="lf-pop__btn" data-go="${s.id}">View field report →</button>
         </div>`,
        { className: 'lf-pop-wrap', maxWidth: 240 }
      );
      m.on('mouseover', () => setHoverId(s.id));
      m.on('mouseout',  () => setHoverId(null));
      m.on('popupopen', e => {
        const btn = e.popup.getElement()?.querySelector('[data-go]');
        if (btn) btn.onclick = () => navigate(`/site/${s.id}`);
      });
      markers.current[s.id] = m;
    });
  }, [filtered, colorBy, getSiteData]);

  // hover highlight
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, m]) => {
      const el = m.getElement()?.querySelector('.lf-pin');
      if (el) el.classList.toggle('is-active', String(id) === String(hoverId));
      m.setZIndexOffset(String(id) === String(hoverId) ? 1000 : 0);
    });
  }, [hoverId]);

  function flyTo(s) { mapRef.current?.flyTo([s.lat, s.lng], 11, { duration: 1.1 }); }

  return (
    <div className="explore">
      {/* LEFT PANEL */}
      <aside className="explore__panel">
        <div className="explore__panel-head">
          <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
            <span className="eyebrow">Sheet 1 · {filtered.length} of {campsites.length} sites</span>
            <button className="explore__gpx" disabled={!filtered.length}
              onClick={() => downloadGpx(filtered, `motocamp-${filter}.gpx`)}>
              <Icon name="download" size={13} /> GPX
            </button>
          </div>
          <div className="explore__search">
            <Icon name="search" size={16} className="explore__search-icn" />
            <input className="explore__search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter sites…" />
            {search && <button className="explore__search-x" onClick={() => setSearch('')}><Icon name="x" size={14} /></button>}
          </div>
          <div className="explore__filters scry">
            {[['all','All'],['planned','Planned'],['visited','Visited'],['unvisited','Not yet']].map(([k,l]) => (
              <button key={k} className={cx('chip', filter === k && 'is-on')} onClick={() => setFilter(k)}>{l}</button>
            ))}
            <span className="explore__sep" />
            <button className={cx('chip', colorBy === 'access' && 'is-on')} onClick={() => setColorBy('access')}>By access</button>
            <button className={cx('chip', colorBy === 'status' && 'is-on')} onClick={() => setColorBy('status')}>By status</button>
          </div>
        </div>

        <div className="explore__list scry">
          {filtered.map(s => {
            const d = getSiteData(s.id);
            const tone = colorBy === 'status' ? (d.visited ? 'terrain' : d.planned ? 'amber' : 'signal') : accessLabels[s.access].token;
            return (
              <div key={s.id}
                className={cx('ex-item', String(s.id) === String(hoverId) && 'is-hover')}
                onMouseEnter={() => setHoverId(s.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => flyTo(s)}>
                <div className="ex-item__pin"><WaypointPin n={s.id} tone={tone} size={26} active={String(s.id) === String(hoverId)} /></div>
                <SiteImg src={s.photos?.[0]} alt={s.name} className="ex-item__img" />
                <div className="ex-item__body">
                  <div className="ex-item__name">{s.name}</div>
                  <div className="ex-item__loc">{s.region}, {s.county}</div>
                  <div className="ex-item__meta">
                    <AccessChip access={s.access} />
                    <span className="ex-item__score">★ {round1(s.community.overall).toFixed(1)}</span>
                  </div>
                  <div className="coord ex-item__coord">{s.distanceFromNairobi} km · {s.fee}</div>
                </div>
                <button className="ex-item__open" onClick={e => { e.stopPropagation(); navigate(`/site/${s.id}`); }}>
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>
            );
          })}
          {!filtered.length && <div className="ex-empty">No sites match.<br />Try clearing filters.</div>}
        </div>
      </aside>

      {/* MAP */}
      <div className="explore__map-wrap">
        <div ref={mapEl} className="explore__map" />
        <div className="explore__legend">
          <div className="explore__legend-title font-mono">LEGEND · {colorBy === 'access' ? 'ROAD ACCESS' : 'MY STATUS'}</div>
          {colorBy === 'access'
            ? [['good','Good road'],['moderate','Moderate'],['rough','Rough / ADV']].map(([k,l]) => (
                <div key={k} className="explore__legend-row"><span className="explore__legend-dot" style={{ background: ACCESS_HEX[k] }} />{l}</div>))
            : [['visited','Visited'],['planned','Planned'],['none','Not yet']].map(([k,l]) => (
                <div key={k} className="explore__legend-row"><span className="explore__legend-dot" style={{ background: STATUS_HEX[k] || '#9a8e76' }} />{l}</div>))}
        </div>
      </div>
    </div>
  );
}
