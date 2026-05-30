import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Bookmark, MapPin, Camera, Share2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRatings } from '../context/RatingsContext';
import { accessLabels, facilityIcons } from '../data/campsites';
import StarRating from './StarRating';
import CommunityRating from './CommunityRating';

export default function SiteCard({ site }) {
  const { getSiteData, toggleVisited, togglePlanned, setRating } = useStore();
  const communityRatings = useRatings();
  const data = getSiteData(site.id);
  const access = accessLabels[site.access];
  const community = communityRatings[String(site.id)];
  const [imgErr, setImgErr] = useState(false);
  const [shared, setShared] = useState(false);
  const thumb = !imgErr && site.photos?.[0];

  async function handleShare(e) {
    e.preventDefault();
    const url = `${window.location.origin}/site/${site.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: site.name, text: `${site.name} — motocamping in Kenya 🏕️🏍️`, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className={`bg-[#141f14] border rounded-xl overflow-hidden transition-all hover:border-green-600/60 ${
      data.visited ? 'border-green-700/60' : data.planned ? 'border-yellow-700/60' : 'border-[#2d5a2e]/60'
    }`}>
      {/* Thumbnail */}
      <Link to={`/site/${site.id}`} className="block relative h-36 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={site.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#1a2e1a] flex items-center justify-center">
            <Camera size={24} className="text-green-900" />
          </div>
        )}
        {/* Status overlay badge */}
        {(data.visited || data.planned) && (
          <div className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full border backdrop-blur-sm ${
            data.visited
              ? 'bg-green-900/80 text-green-300 border-green-700/50'
              : 'bg-yellow-900/80 text-yellow-300 border-yellow-700/50'
          }`}>
            {data.visited ? '✓ Visited' : '📌 Planned'}
          </div>
        )}
        {/* Photo count */}
        {site.photos?.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
            <Camera size={10} /> {site.photos.length}
          </div>
        )}
      </Link>

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
          <div />
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

        {/* Ratings row: personal stars + community average */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <StarRating value={data.rating} onChange={r => setRating(site.id, r)} size={15} />
            <CommunityRating communityData={community} />
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleShare}
              className={`p-1.5 rounded-lg transition-colors ${
                shared ? 'text-green-400 bg-green-900/30' : 'text-gray-500 hover:text-green-400 hover:bg-green-900/20'
              }`}
              title="Share"
            >
              {shared ? <Check size={15} /> : <Share2 size={15} />}
            </button>
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
