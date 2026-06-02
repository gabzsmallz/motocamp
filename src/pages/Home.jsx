import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampsitesContext } from '../context/CampsitesContext';
import { useStore } from '../store/useStore';
import { accessLabels } from '../data/campsites';
import { ContourBg, TickCorners, Icon } from '../components/primitives';
import SiteCard from '../components/SiteCard';

export default function Home() {
  const navigate = useNavigate();
  const { campsites } = useCampsitesContext();
  const { getStats } = useStore();
  const { visited } = getStats();
  const [q, setQ] = useState('');

  const counties = new Set(campsites.map(s => s.county)).size;
  const topRated = [...campsites].sort((a, b) => b.community.overall - a.community.overall).slice(0, 3);
  const byAccess = ['good', 'moderate', 'rough'].map(k => ({
    k, ...accessLabels[k], count: campsites.filter(s => s.access === k).length,
  }));
  const heroShots = [campsites[10]?.photos[0], campsites[13]?.photos[0], campsites[7]?.photos[0]].filter(Boolean);

  function submitSearch(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/list?q=${encodeURIComponent(q.trim())}`);
    else navigate('/list');
  }

  const accessIcons = { good: 'navigation', moderate: 'route', rough: 'mountain' };

  return (
    <div className="home">
      {/* HERO */}
      <header className="hero">
        <ContourBg seeds={[[0.22, 0.5, 9],[0.78, 0.35, 11],[0.6, 0.9, 6]]} color="rgba(210,67,23,.16)" opacity={1} strokeWidth={1} />
        <ContourBg seeds={[[0.5, 0.55, 13]]} color="rgba(236,226,204,.05)" opacity={1} strokeWidth={1} />

        <div className="wrap hero__inner">
          <div className="hero__copy">
            <div className="hero__eyebrow">
              <span className="hero__grid-ref">02°N – 04°S / 34–41°E</span>
              <span className="hero__div">·</span>
              <span>Adventure motorcycle camping</span>
            </div>
            <h1 className="hero__title display">
              Find your<br /><span className="hero__title-em">next camp</span><br />in Kenya.
            </h1>
            <p className="hero__lede">
              A rider-built field guide to {campsites.length} wild and managed campsites — from Rift Valley
              craters to the Jade Sea. Mapped, rated on what matters, and ready to ride.
            </p>

            <form className="hero__search" onSubmit={submitSearch}>
              <Icon name="search" size={18} className="hero__search-icn" />
              <input className="hero__search-input" value={q} onChange={e => setQ(e.target.value)}
                placeholder={'Search sites, regions, terrain — “crater”, “coast”, “Laikipia”…'} />
              <button type="submit" className="btn btn--signal">Search</button>
            </form>

            <div className="hero__cta">
              <button className="btn btn--ink" onClick={() => navigate('/map')}>
                <Icon name="map" size={16} /> Open the map
              </button>
              <button className="btn btn--ghost" onClick={() => navigate('/list')}>
                Browse all campsites <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>

          {heroShots.length >= 3 && (
            <div className="hero__plate">
              <TickCorners inset={6} len={14} color="var(--paper-on-ink)" opacity={0.55} />
              <div className="hero__shots">
                <div className="hero__shot hero__shot--lg"><img src={heroShots[0]} alt="" loading="lazy" /></div>
                <div className="hero__shot"><img src={heroShots[1]} alt="" loading="lazy" /></div>
                <div className="hero__shot"><img src={heroShots[2]} alt="" loading="lazy" /></div>
              </div>
              <div className="hero__plate-cap">
                <span>FIG.1 — TURKANA · COAST · SAMBURU</span>
                <span>SHEET 1 / 1</span>
              </div>
            </div>
          )}
        </div>

        {/* stat strip */}
        <div className="hero__stats">
          <div className="wrap hero__stats-inner">
            {[
              { v: campsites.length, l: 'Campsites mapped'  },
              { v: counties,         l: 'Counties covered'  },
              { v: campsites.filter(s => s.access === 'rough').length, l: 'ADV-only camps' },
              { v: visited,          l: 'Logged by you'     },
            ].map((s, i) => (
              <div key={i} className="hero__stat">
                <div className="hero__stat-v font-mono">{String(s.v).padStart(2, '0')}</div>
                <div className="hero__stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* BY TERRAIN */}
      <section className="wrap section">
        <div className="sec-head">
          <div className="sec-head__title">
            <span className="eyebrow">Pick your difficulty</span>
            <h2 className="display sec-title">Browse by road access</h2>
          </div>
        </div>
        <div className="terrain-grid">
          {byAccess.map(a => (
            <button key={a.k}
              className={`terrain-tile tone-${a.token}`}
              onClick={() => navigate(`/list?access=${a.k}`)}>
              <TickCorners inset={7} len={11} color="currentColor" opacity={0.3} />
              <div className="terrain-tile__top">
                <Icon name={accessIcons[a.k]} size={22} />
                <span className="terrain-tile__count font-mono">{a.count}</span>
              </div>
              <div className="terrain-tile__name display">{a.label}</div>
              <div className="terrain-tile__desc">{a.desc}</div>
              <div className="terrain-tile__go">View sites <Icon name="arrowRight" size={14} /></div>
            </button>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="wrap section">
        <div className="sec-head">
          <div className="sec-head__title">
            <span className="eyebrow">Highest community scores</span>
            <h2 className="display sec-title">Rider favourites</h2>
          </div>
          <button className="btn btn--sm" onClick={() => navigate('/list')}>All sites <Icon name="arrowRight" size={14} /></button>
        </div>
        <div className="card-grid card-grid--3">
          {topRated.map(s => <SiteCard key={s.id} site={s} n={s.id} />)}
        </div>
      </section>

      {/* PLAN CTA */}
      <section className="wrap section">
        <div className="plan-cta card">
          <ContourBg seeds={[[0.3, 0.5, 7],[0.85, 0.6, 8]]} color="var(--line)" opacity={0.7} />
          <TickCorners inset={10} len={14} />
          <div className="plan-cta__inner">
            <div>
              <span className="eyebrow">Plan the route</span>
              <h2 className="display plan-cta__title">String camps into a run, then export the GPX.</h2>
              <p className="muted plan-cta__lede">Save campsites to My Trips, see total distance and terrain mix, and drop the waypoints straight onto your GPS before you leave signal behind.</p>
              <div className="row gap-3" style={{ marginTop: 18 }}>
                <button className="btn btn--signal" onClick={() => navigate('/map')}><Icon name="map" size={16} /> Open the map</button>
                <button className="btn" onClick={() => navigate('/trips')}><Icon name="bookmark" size={15} /> My Trips</button>
              </div>
            </div>
            <div className="plan-cta__badge">
              <Icon name="compass" size={30} />
              <div className="font-mono plan-cta__badge-t">GPX<br />READY</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap footer__inner">
          <div className="footer__brand">
            <span className="brand__mark" style={{ width: 30, height: 30 }}><Icon name="tent" size={15} /></span>
            <div>
              <div className="footer__name display">Kenya Motocamp</div>
              <div className="coord">Field guide · v2 · built by riders</div>
            </div>
          </div>
          <div className="footer__links">
            <button onClick={() => navigate('/map')}>Map</button>
            <button onClick={() => navigate('/list')}>Campsites</button>
            <button onClick={() => navigate('/trips')}>My Trips</button>
            <button onClick={() => navigate('/suggest')}>Suggest a site</button>
          </div>
          <div className="footer__note coord">Data compiled from rider trip reports. Always check current park fees & conditions.</div>
        </div>
      </footer>
    </div>
  );
}
