import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Bookmark, MapPin, Tent, Download, FileDown } from 'lucide-react';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';
import { downloadGpx } from '../utils/exportGpx';
import SiteCard from '../components/SiteCard';

function ExportButton({ sites, filename, label, disabled }) {
  const [exported, setExported] = useState(false);

  function handleExport() {
    if (!sites.length) return;
    downloadGpx(sites, filename, { name: label, description: `${label} — exported from KenyaMotocamp` });
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !sites.length}
      title={sites.length === 0 ? 'No sites to export' : `Export ${sites.length} sites as GPX`}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
        exported
          ? 'bg-green-900/50 border-green-600 text-green-300'
          : 'bg-[#1e3320] border-[#2d5a2e] text-gray-400 hover:border-green-600 hover:text-green-300'
      }`}
    >
      {exported ? <><CheckCircle size={12} /> Exported!</> : <><Download size={12} /> Export GPX</>}
    </button>
  );
}

export default function MyTrips() {
  const { campsites } = useCampsitesContext();
  const { getSiteData, getStats } = useStore();
  const { visited, planned } = getStats();

  const visitedSites = campsites.filter(s => getSiteData(s.id).visited);
  const plannedSites = campsites.filter(s => getSiteData(s.id).planned);
  const ratedSites   = campsites.filter(s => getSiteData(s.id).rating > 0);

  const progress = Math.round((visited / campsites.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-100">My Moto Trips</h1>
        {/* Export all (planned + visited) */}
        {(plannedSites.length > 0 || visitedSites.length > 0) && (
          <button
            onClick={() => {
              const all = [...new Map([...plannedSites, ...visitedSites].map(s => [s.id, s])).values()];
              downloadGpx(all, 'all-motocamp-sites.gpx', {
                name: 'All My KenyaMotocamp Sites',
                description: 'All planned and visited campsites',
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-800/50 border border-green-700 text-green-300 hover:bg-green-700/60 transition-colors"
          >
            <FileDown size={13} /> Export all ({plannedSites.length + visitedSites.length})
          </button>
        )}
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
            <Bookmark size={18} /> Trip Plan ({planned})
          </h2>
          <ExportButton
            sites={plannedSites}
            filename="motocamp-trip-plan.gpx"
            label="My KenyaMotocamp Trip Plan"
          />
        </div>

        {plannedSites.length === 0 ? (
          <div className="text-center py-10 text-gray-600 border border-[#2d5a2e]/30 rounded-xl">
            <Tent size={32} className="mx-auto mb-2 opacity-30" />
            <p>No trips planned yet.</p>
            <Link to="/list" className="text-green-500 text-sm hover:underline">Browse campsites →</Link>
          </div>
        ) : (
          <>
            <div className="bg-[#1a2e1a] border border-[#2d5a2e]/30 rounded-xl px-4 py-3 mb-4 text-xs text-gray-400 flex items-center gap-2">
              <Download size={12} className="text-green-500 shrink-0" />
              Export this plan to use in <strong className="text-gray-300">OsmAnd, Garmin, Google Maps,</strong> or any GPS app that supports GPX.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedSites.map(site => <SiteCard key={site.id} site={site} />)}
            </div>
          </>
        )}
      </section>

      {/* Visited */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-green-300 flex items-center gap-2">
            <CheckCircle size={18} /> Visited ({visited})
          </h2>
          <ExportButton
            sites={visitedSites}
            filename="motocamp-visited.gpx"
            label="My KenyaMotocamp Visited Sites"
          />
        </div>

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
