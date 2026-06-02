import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';
import { round1 } from '../data/campsites';
import { cx, Icon, ContourBg, WaypointPin, SiteImg, AccessChip, Facilities } from '../components/primitives';
import SiteCard from '../components/SiteCard';

function Selector({ label, value, onChange, options }) {
  return (
    <label className="browse__sel">
      <span className="browse__sel-l font-mono">{label}</span>
      <select className="select browse__sel-input" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function BrowseRow({ site }) {
  const navigate = useNavigate();
  const { getSiteData, toggleVisited, togglePlanned } = useStore();
  const d = getSiteData(site.id);
  const tone = d.visited ? 'terrain' : d.planned ? 'amber' : (site.access === 'good' ? 'terrain' : site.access === 'moderate' ? 'amber' : 'rust');
  return (
    <div className="brow" onClick={() => navigate(`/site/${site.id}`)}>
      <div><WaypointPin n={site.id} tone={tone} size={28} /></div>
      <SiteImg src={site.photos?.[0]} alt={site.name} className="brow__img" />
      <div className="brow__body">
        <div className="brow__name">{site.name}</div>
        <div className="brow__loc"><Icon name="pin" size={12} /> {site.region}, {site.county}</div>
        <p className="brow__desc">{site.description}</p>
      </div>
      <div className="brow__mid">
        <AccessChip access={site.access} />
        <Facilities items={site.facilities.slice(0, 4)} />
      </div>
      <div className="brow__stat">
        <div className="brow__score"><Icon name="star" size={13} strokeWidth={0} style={{ fill: 'var(--signal)' }} /> {round1(site.community.overall).toFixed(1)}</div>
        <div className="coord">{site.distanceFromNairobi} km · {site.elev} m</div>
      </div>
      <div className="brow__actions" onClick={e => e.stopPropagation()}>
        <button className={cx('btn-icn','btn-icn--sm', d.planned && 'is-on-amber')} onClick={() => togglePlanned(site.id)} title="Plan"><Icon name="bookmark" size={14} /></button>
        <button className={cx('btn-icn','btn-icn--sm', d.visited && 'is-on-terrain')} onClick={() => toggleVisited(site.id)} title="Visited"><Icon name="checkCircle" size={14} /></button>
      </div>
    </div>
  );
}

export default function ListView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { campsites } = useCampsitesContext();
  const { getSiteData } = useStore();

  // Parse URL params for pre-filters from Home
  const params = new URLSearchParams(location.search);
  const [search, setSearch] = useState(params.get('q') || '');
  const [access, setAccess] = useState(params.get('access') || 'all');
  const [status, setStatus] = useState('all');
  const [county, setCounty] = useState('all');
  const [sort, setSort]     = useState('rating');
  const [view, setView]     = useState('grid');

  const counties = useMemo(() => [...new Set(campsites.map(s => s.county))].sort(), [campsites]);

  const filtered = useMemo(() => {
    let arr = campsites.filter(s => {
      const d = getSiteData(s.id);
      const mS  = !search || (s.name + s.region + s.county + (s.tags||[]).join(' ') + s.description).toLowerCase().includes(search.toLowerCase());
      const mA  = access === 'all' || s.access === access;
      const mC  = county === 'all' || s.county === county;
      const mSt = status === 'all' ? true : status === 'visited' ? d.visited : status === 'planned' ? d.planned : !d.visited && !d.planned;
      return mS && mA && mC && mSt;
    });
    arr = [...arr].sort((a, b) =>
      sort === 'rating'   ? b.community.overall - a.community.overall :
      sort === 'name'     ? a.name.localeCompare(b.name) :
      sort === 'distance' ? a.distanceFromNairobi - b.distanceFromNairobi :
      sort === 'elev'     ? b.elev - a.elev : 0);
    return arr;
  }, [campsites, search, access, county, status, sort, getSiteData]);

  const vis = useMemo(() => campsites.filter(s => getSiteData(s.id).visited).length, [campsites, getSiteData]);
  const pln = useMemo(() => campsites.filter(s => getSiteData(s.id).planned).length, [campsites, getSiteData]);
  const activeFilters = [access !== 'all', status !== 'all', county !== 'all'].filter(Boolean).length;

  function reset() { setSearch(''); setAccess('all'); setStatus('all'); setCounty('all'); }

  return (
    <div className="browse">
      {/* header band */}
      <div className="browse__band">
        <ContourBg seeds={[[0.2,0.5,6],[0.8,0.4,7]]} color="var(--line)" opacity={0.6} />
        <div className="wrap browse__band-inner">
          <div>
            <span className="eyebrow">Directory · {campsites.length} sites on file</span>
            <h1 className="browse__title display">All campsites</h1>
          </div>
          <div className="browse__counts">
            {[['Total',campsites.length,'ink'],['Visited',vis,'terrain'],['Planned',pln,'amber'],['Remaining',campsites.length-vis,'signal']].map(([l,v,t]) => (
              <div key={l} className={cx('browse__count', `tone-${t}`)}>
                <div className="browse__count-v font-mono">{String(v).padStart(2,'0')}</div>
                <div className="browse__count-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap browse__body">
        <div className="browse__controls">
          <div className="browse__search">
            <Icon name="search" size={17} className="browse__search-icn" />
            <input className="browse__search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campsites, regions, terrain, tags…" />
            {search && <button className="explore__search-x" onClick={() => setSearch('')}><Icon name="x" size={14} /></button>}
          </div>
          <div className="browse__view">
            <button className={cx('browse__view-btn', view === 'grid' && 'is-on')} onClick={() => setView('grid')} title="Grid"><Icon name="layers" size={16} /></button>
            <button className={cx('browse__view-btn', view === 'list' && 'is-on')} onClick={() => setView('list')} title="List"><Icon name="list" size={16} /></button>
          </div>
        </div>

        <div className="browse__filterbar">
          <Selector label="Status" value={status} onChange={setStatus} options={[['all','All'],['visited','Visited'],['planned','Planned'],['unvisited','Not yet']]} />
          <Selector label="Access" value={access} onChange={setAccess} options={[['all','All'],['good','Good road'],['moderate','Moderate'],['rough','Rough / ADV']]} />
          <Selector label="County" value={county} onChange={setCounty} options={[['all','All'],...counties.map(c => [c,c])]} />
          <Selector label="Sort" value={sort} onChange={setSort} options={[['rating','Top rated'],['distance','Nearest Nairobi'],['elev','Highest'],['name','A–Z']]} />
          <div className="browse__filter-meta">
            <span className="coord">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            {(activeFilters > 0 || search) && <button className="browse__reset" onClick={reset}><Icon name="x" size={12} /> Clear</button>}
          </div>
        </div>

        {filtered.length ? (
          view === 'grid' ? (
            <div className="card-grid card-grid--3">
              {filtered.map(s => <SiteCard key={s.id} site={s} n={s.id} />)}
            </div>
          ) : (
            <div className="browse__list">
              {filtered.map(s => <BrowseRow key={s.id} site={s} />)}
            </div>
          )
        ) : (
          <div className="browse__empty card">
            <Icon name="compass" size={36} />
            <div className="display" style={{ fontSize: 20 }}>No sites match</div>
            <p className="muted" style={{ margin: 0 }}>Try widening your filters.</p>
            <button className="btn" onClick={reset}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
