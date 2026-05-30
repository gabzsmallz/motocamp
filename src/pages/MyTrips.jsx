import { Link } from 'react-router-dom';
import { CheckCircle, Bookmark, MapPin, Tent } from 'lucide-react';
import { campsites } from '../data/campsites';
import { useStore } from '../store/useStore';
import SiteCard from '../components/SiteCard';

export default function MyTrips() {
  const { getSiteData, getStats } = useStore();
  const { visited, planned } = getStats();

  const visitedSites = campsites.filter(s => getSiteData(s.id).visited);
  const plannedSites = campsites.filter(s => getSiteData(s.id).planned);
  const ratedSites = campsites.filter(s => getSiteData(s.id).rating > 0);

  const progress = Math.round((visited / campsites.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-green-100 mb-6">My Moto Trips</h1>

      {/* Progress */}
      <div className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Kenya Campsite Progress</span>
          <span className="text-green-400 font-bold">{visited} / {campsites.length}</span>
        </div>
        <div className="h-3 bg-[#1e3320] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="text-green-400">{progress}% explored</span>
          <span>100%</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{visited}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <CheckCircle size={11} /> Visited
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{planned}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Bookmark size={11} /> Planned
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{ratedSites.length}</div>
            <div className="text-xs text-gray-500">Rated</div>
          </div>
        </div>
      </div>

      {/* Planned */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-yellow-300 flex items-center gap-2 mb-4">
          <Bookmark size={18} /> Trip Plan ({planned})
        </h2>
        {plannedSites.length === 0 ? (
          <div className="text-center py-10 text-gray-600 border border-[#2d5a2e]/30 rounded-xl">
            <Tent size={32} className="mx-auto mb-2 opacity-30" />
            <p>No trips planned yet.</p>
            <Link to="/list" className="text-green-500 text-sm hover:underline">Browse campsites →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedSites.map(site => <SiteCard key={site.id} site={site} />)}
          </div>
        )}
      </section>

      {/* Visited */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-green-300 flex items-center gap-2 mb-4">
          <CheckCircle size={18} /> Visited ({visited})
        </h2>
        {visitedSites.length === 0 ? (
          <div className="text-center py-10 text-gray-600 border border-[#2d5a2e]/30 rounded-xl">
            <MapPin size={32} className="mx-auto mb-2 opacity-30" />
            <p>No campsites marked as visited yet.</p>
            <p className="text-xs mt-1">Mark sites as visited from the campsite detail page or list view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visitedSites.map(site => {
              const d = getSiteData(site.id);
              return (
                <div key={site.id}>
                  {d.visitedDate && (
                    <div className="text-xs text-gray-500 mb-1 ml-1">📅 {d.visitedDate}</div>
                  )}
                  <SiteCard site={site} />
                  {d.notes && (
                    <div className="mt-1 text-xs text-gray-500 italic px-1 line-clamp-2">💬 {d.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {visited === 0 && planned === 0 && (
        <div className="text-center py-6">
          <Link
            to="/"
            className="bg-green-700 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            Explore the map to get started
          </Link>
        </div>
      )}
    </div>
  );
}
