import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { cx, Icon } from './primitives';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getStats, synced } = useStore();
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const { visited, planned } = getStats();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on  = () => setIsOffline(true);
    const off = () => setIsOffline(false);
    window.addEventListener('offline', on);
    window.addEventListener('online', off);
    return () => { window.removeEventListener('offline', on); window.removeEventListener('online', off); };
  }, []);

  const links = [
    { to: '/',       icon: 'compass', label: 'Home'       },
    { to: '/map',    icon: 'map',     label: 'Map'        },
    { to: '/list',   icon: 'list',    label: 'Campsites'  },
    { to: '/trips',  icon: 'bookmark', label: `My Trips${planned > 0 ? ` · ${planned}` : ''}` },
    { to: '/suggest', icon: 'plus',   label: 'Suggest'    },
  ];

  return (
    <nav className="nav">
      <div className="nav__inner">
        {/* Brand */}
        <div className="brand" onClick={() => navigate('/')}>
          <span className="brand__mark"><Icon name="tent" size={17} /></span>
          <span className="brand__txt">
            <div className="brand__name">Motocamp</div>
            <div className="brand__sub">Kenya Field Guide</div>
          </span>
        </div>

        {/* Nav links */}
        <div className="nav__links">
          {links.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <a key={to} href={to}
                onClick={e => { e.preventDefault(); navigate(to); }}
                className={cx('nav__link', active && 'is-active')}>
                <Icon name={icon} size={16} />
                <span className="lbl">{label}</span>
              </a>
            );
          })}
          {isAdmin && (
            <a href="/admin" onClick={e => { e.preventDefault(); navigate('/admin'); }}
              className={cx('nav__link', 'is-admin', location.pathname === '/admin' && 'is-active')}>
              <Icon name="shield" size={16} />
              <span className="lbl">Admin</span>
            </a>
          )}
        </div>

        <div className="nav__spacer" />

        {/* Stats */}
        <span className="nav__stat">
          <b>{visited}</b> visited · <b>{planned}</b> planned
        </span>

        {/* Offline badge */}
        {isOffline && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.35)', borderRadius: 100, padding: '3px 9px' }}>
            <Icon name="wifiOff" size={11} /> Offline
          </span>
        )}

        {/* Auth */}
        <div className="nav__user">
          {!loading && (
            user ? (
              <>
                {synced && <Icon name="cloud" size={14} style={{ color: 'var(--terrain)', opacity: .8 }} />}
                {user.photoURL
                  ? <img src={user.photoURL} alt={user.displayName} title={user.displayName} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }} />
                  : <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--signal)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>{(user.displayName || user.email)?.[0]?.toUpperCase()}</span>
                }
                <button className="btn-icn" title="Sign out" onClick={signOut}
                  style={{ width: 32, height: 32, background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: 'var(--paper-on-ink)' }}>
                  <Icon name="logOut" size={15} />
                </button>
              </>
            ) : (
              <button className="btn btn--signal btn--sm" onClick={signIn}>Sign in</button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
