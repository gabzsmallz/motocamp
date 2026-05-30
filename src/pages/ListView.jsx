import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { campsites } from '../data/campsites';
import { useStore } from '../store/useStore';
import SiteCard from '../components/SiteCard';

const counties = [...new Set(campsites.map(s => s.county))].sort();
const allTags = [...new Set(campsites.flatMap(s => s.tags))].sort();

export default function ListView() {
  const { getSiteData } = useStore();
  const [search, setSearch] = useState('');
  const [filterAccess, setFilterAccess] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCounty, setFilterCounty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let sites = campsites.filter(s => {
      const d = getSiteData(s.id);
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.region.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some(t => t.includes(search.toLowerCase()));
      const matchAccess = filterAccess === 'all' || s.access === filterAccess;
      const matchCounty = filterCounty === 'all' || s.county === filterCounty;
      const matchStatus =
        filterStatus === 'all' ? true :
        filterStatus === 'visited' ? d.visited :
        filterStatus === 'planned' ? d.planned :
        filterStatus === 'unvisited' ? !d.visited && !d.planned : true;
      return matchSearch && matchAccess && matchCounty && matchStatus;
    });

    if (sortBy === 'name') sites = sites.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'region') sites = sites.sort((a, b) => a.region.localeCompare(b.region));
    if (sortBy === 'rating') {
      sites = sites.sort((a, b) => (getSiteData(b.id).rating || 0) - (getSiteData(a.id).rating || 0));
    }
    return sites;
  }, [search, filterAccess, filterStatus, filterCounty, sortBy, getSiteData]);

  const { visited, planned } = useMemo(() => {
    const visited = campsites.filter(s => getSiteData(s.id).visited).length;
    const planned = campsites.filter(s => getSiteData(s.id).planned).length;
    return { visited, planned };
  }, [getSiteData]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Total Sites', value: campsites.length, color: 'text-green-400' },
          { label: 'Visited', value: visited, color: 'text-green-300' },
          { label: 'Planned', value: planned, color: 'text-yellow-300' },
          { label: 'Remaining', value: campsites.length - visited, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-[#141f14] border border-[#2d5a2e]/60 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campsites, regions, tags..."
            className="w-full bg-[#141f14] border border-[#2d5a2e] rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors ${
            showFilters ? 'bg-green-900/40 border-green-600 text-green-300' : 'bg-[#141f14] border-[#2d5a2e] text-gray-400 hover:text-green-300'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:block">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-[#1e3320] border border-[#2d5a2e] text-gray-300 rounded-lg px-2 py-1.5 text-xs">
              <option value="all">All</option>
              <option value="visited">Visited</option>
              <option value="planned">Planned</option>
              <option value="unvisited">Not yet</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Access</label>
            <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)}
              className="w-full bg-[#1e3320] border border-[#2d5a2e] text-gray-300 rounded-lg px-2 py-1.5 text-xs">
              <option value="all">All</option>
              <option value="good">Good Road</option>
              <option value="moderate">Moderate</option>
              <option value="rough">Rough/ADV</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">County</label>
            <select value={filterCounty} onChange={e => setFilterCounty(e.target.value)}
              className="w-full bg-[#1e3320] border border-[#2d5a2e] text-gray-300 rounded-lg px-2 py-1.5 text-xs">
              <option value="all">All</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Sort by</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="w-full bg-[#1e3320] border border-[#2d5a2e] text-gray-300 rounded-lg px-2 py-1.5 text-xs">
              <option value="name">Name</option>
              <option value="region">Region</option>
              <option value="rating">My Rating</option>
            </select>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mb-3">{filtered.length} site{filtered.length !== 1 ? 's' : ''} shown</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(site => <SiteCard key={site.id} site={site} />)}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No campsites match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
