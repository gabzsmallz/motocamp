import { Link } from 'react-router-dom';
import { CheckCircle, Bookmark, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { accessLabels, facilityIcons } from '../data/campsites';
import StarRating from './StarRating';

export default function SiteCard({ site }) {
  const { getSiteData, toggleVisited, togglePlanned, setRating } = useStore();
  const data = getSiteData(site.id);
  const access = accessLabels[site.access];

  return (
    <div className={`bg-[#141f14] border rounded-xl overflow-hidden transition-all hover:border-green-600/60 ${
      data.visited ? 'border-green-700/60' : data.planned ? 'border-yellow-700/60' : 'border-[#2d5a2e]/60'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <Link to={`/site/${site.id}`} className="font-semibold text-green-100 hover:text-green-300 transition-colors">
              {site.name}
            </Link>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <MapPin size={11} />
              <span>{site.region}, {site.county}</span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {data.visited && (
              <span className="text-xs bg-green-900/60 text-green-300 px-2 py-0.5 rounded-full border border-green-700/50">
                ✓ Visited
              </span>
            )}
            {data.planned && !data.visited && (
              <span className="text-xs bg-yellow-900/60 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-700/50">
                📌 Planned
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{site.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border border-current ${access.color} ${access.bg}`}>
            {access.label}
          </span>
          {site.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#1e3320] text-gray-400 border border-[#2d5a2e]/40">
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {site.facilities.map(f => facilityIcons[f] && (
            <span key={f} title={facilityIcons[f].label} className="text-sm">{facilityIcons[f].icon}</span>
          ))}
          <span className="text-xs text-gray-500 ml-1">{site.fee}</span>
        </div>

        <div className="flex items-center justify-between">
          <StarRating value={data.rating} onChange={r => setRating(site.id, r)} size={15} />
          <div className="flex gap-2">
            <button
              onClick={() => togglePlanned(site.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                data.planned ? 'text-yellow-400 bg-yellow-900/30' : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20'
              }`}
              title="Add to plan"
            >
              <Bookmark size={15} />
            </button>
            <button
              onClick={() => toggleVisited(site.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                data.visited ? 'text-green-400 bg-green-900/30' : 'text-gray-500 hover:text-green-400 hover:bg-green-900/20'
              }`}
              title="Mark as visited"
            >
              <CheckCircle size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
