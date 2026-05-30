import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { accessLabels } from '../data/campsites';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color) {
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid #0f1a10;
      transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
    className: '',
  });
}

const icons = {
  visited: makeIcon('#22c55e'),
  planned: makeIcon('#eab308'),
  default: makeIcon('#16a34a'),
};

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 11, { duration: 1.2 });
  }, [target, map]);
  return null;
}

export default function MapView() {
  const navigate = useNavigate();
  const { getSiteData } = useStore();
  const { campsites } = useCampsitesContext();
  const [flyTarget, setFlyTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = campsites.filter(s => {
    const d = getSiteData(s.id);
    if (filter === 'visited') return d.visited;
    if (filter === 'planned') return d.planned;
    if (filter === 'unvisited') return !d.visited;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Filter bar */}
      <div className="flex gap-2 px-4 py-2 bg-[#0a1409] border-b border-[#2d5a2e] overflow-x-auto">
        {[
          { key: 'all', label: `All (${campsites.length})` },
          { key: 'visited', label: '✓ Visited' },
          { key: 'planned', label: '📌 Planned' },
          { key: 'unvisited', label: '🗺️ Not yet' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-green-700 text-white'
                : 'bg-[#1e3320] text-gray-400 hover:text-green-300 border border-[#2d5a2e]'
            }`}
          >
            {label}
          </button>
        ))}

        <div className="ml-auto flex gap-1 text-xs items-center shrink-0">
          <span className="text-gray-500">Jump to:</span>
          <select
            onChange={e => {
              const site = campsites.find(s => s.id === Number(e.target.value));
              if (site) setFlyTarget([site.lat, site.lng]);
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-[#1e3320] border border-[#2d5a2e] text-gray-300 rounded px-2 py-1 text-xs"
          >
            <option value="" disabled>Select site...</option>
            {campsites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <MapContainer
        center={[0.5, 37.5]}
        zoom={6}
        style={{ flex: 1 }}
        className="campsite-popup"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <FlyTo target={flyTarget} />

        {filtered.map(site => {
          const d = getSiteData(site.id);
          const icon = d.visited ? icons.visited : d.planned ? icons.planned : icons.default;
          const access = accessLabels[site.access];

          return (
            <Marker key={site.id} position={[site.lat, site.lng]} icon={icon}>
              <Popup className="campsite-popup">
                <div>
                  <div className="font-semibold text-green-200 text-sm mb-1">{site.name}</div>
                  <div className="text-xs text-gray-400 mb-1">{site.region}, {site.county}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${access.bg} ${access.color}`}>
                    {access.label}
                  </span>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed line-clamp-3">{site.description}</p>
                  <div className="mt-2 text-xs text-gray-500">{site.fee}</div>
                  <button
                    onClick={() => navigate(`/site/${site.id}`)}
                    className="mt-2 w-full text-xs bg-green-800 hover:bg-green-700 text-green-100 py-1.5 rounded-lg transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[999] bg-[#0a1409]/90 border border-[#2d5a2e] rounded-xl p-3 text-xs space-y-1">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Visited</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Planned</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-700 inline-block"></span> Not yet</div>
      </div>
    </div>
  );
}
