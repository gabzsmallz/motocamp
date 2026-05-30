import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, Bookmark, ExternalLink, Navigation } from 'lucide-react';
import { campsites, accessLabels, facilityIcons } from '../data/campsites';
import { useStore } from '../store/useStore';
import StarRating from '../components/StarRating';

const sourceLinks = {
  '96Lost': 'https://www.youtube.com/@96Lost',
  'Murmet4x4': 'https://www.youtube.com/@Murmet4x4',
  'WANDERLYKE': 'https://www.youtube.com/@WANDERLYKE',
  'GeoPointAdventuresKe': 'https://www.youtube.com/@GeoPointAdventuresKe',
  'wondering_luminous': 'https://www.youtube.com/@wondering_luminous',
};

export default function SiteDetail() {
  const { id } = useParams();
  const site = campsites.find(s => s.id === Number(id));
  const { getSiteData, toggleVisited, togglePlanned, setRating, setNotes } = useStore();

  if (!site) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">
      Campsite not found. <Link to="/list" className="text-green-400 underline">Back to list</Link>
    </div>
  );

  const data = getSiteData(site.id);
  const access = accessLabels[site.access];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/list" className="flex items-center gap-1.5 text-gray-400 hover:text-green-300 text-sm mb-4 transition-colors">
        <ArrowLeft size={15} /> Back to list
      </Link>

      <div className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2d5a2e]/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-green-100 mb-1">{site.name}</h1>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <MapPin size={14} />
                <span>{site.region}, {site.county} County</span>
              </div>
            </div>
            <span className={`shrink-0 text-sm px-3 py-1 rounded-full border border-current ${access.color} ${access.bg}`}>
              {access.label}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => toggleVisited(site.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                data.visited
                  ? 'bg-green-700 text-white border border-green-600'
                  : 'bg-[#1e3320] text-gray-300 border border-[#2d5a2e] hover:border-green-600 hover:text-green-300'
              }`}
            >
              <CheckCircle size={16} />
              {data.visited ? `Visited${data.visitedDate ? ` · ${data.visitedDate}` : ''}` : 'Mark Visited'}
            </button>

            <button
              onClick={() => togglePlanned(site.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                data.planned
                  ? 'bg-yellow-800 text-yellow-200 border border-yellow-700'
                  : 'bg-[#1e3320] text-gray-300 border border-[#2d5a2e] hover:border-yellow-600 hover:text-yellow-300'
              }`}
            >
              <Bookmark size={16} />
              {data.planned ? 'In My Plan' : 'Add to Plan'}
            </button>

            <a
              href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-[#1e3320] text-gray-300 border border-[#2d5a2e] hover:border-blue-600 hover:text-blue-300 transition-all"
            >
              <Navigation size={16} />
              Navigate
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</h2>
            <p className="text-gray-300 leading-relaxed">{site.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {site.facilities.map(f => facilityIcons[f] && (
                  <span key={f} className="flex items-center gap-1.5 bg-[#1e3320] border border-[#2d5a2e]/60 rounded-lg px-3 py-1.5 text-sm">
                    <span>{facilityIcons[f].icon}</span>
                    <span className="text-gray-300">{facilityIcons[f].label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="text-gray-300">{site.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Access</span>
                  <span className={access.color}>{access.desc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GPS</span>
                  <span className="text-gray-300 font-mono text-xs">{site.lat.toFixed(4)}, {site.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</h2>
            <div className="flex flex-wrap gap-1.5">
              {site.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#1e3320] text-gray-400 border border-[#2d5a2e]/40">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Featured by</h2>
            <div className="flex flex-wrap gap-2">
              {site.sources.map(src => (
                <a
                  key={src}
                  href={sourceLinks[src]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-red-950/40 border border-red-900/40 text-red-300 hover:text-red-200 rounded-lg px-3 py-1.5 text-sm transition-colors"
                >
                  ▶ {src}
                  <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </div>

          {/* Personal notes */}
          <div className="border-t border-[#2d5a2e]/40 pt-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">My Rating & Notes</h2>
            <StarRating value={data.rating} onChange={r => setRating(site.id, r)} size={22} />
            <textarea
              value={data.notes}
              onChange={e => setNotes(site.id, e.target.value)}
              placeholder="Add your personal notes, tips, or memories about this campsite..."
              rows={4}
              className="mt-3 w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-green-600 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
