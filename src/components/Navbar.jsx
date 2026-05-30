import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Map, List, Bookmark, PlusCircle, Shield, LogIn, LogOut, Cloud, WifiOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { getStats, synced } = useStore();
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const { visited, planned } = getStats();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  const links = [
    { to: '/', icon: Map, label: 'Map' },
    { to: '/list', icon: List, label: 'Campsites' },
    { to: '/trips', icon: Bookmark, label: `My Trips${planned > 0 ? ` (${planned})` : ''}` },
    { to: '/suggest', icon: PlusCircle, label: 'Suggest' },
  ];

  return (
    <nav className="bg-[#0a1409] border-b border-[#2d5a2e] sticky top-0 z-[1000]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-green-400 font-bold text-lg tracking-tight shrink-0">
          <span className="text-2xl">🏕️</span>
          <span className="hidden sm:block">KenyaMotocamp</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-green-900/50 text-green-300'
                    : 'text-gray-400 hover:text-green-300 hover:bg-green-900/30'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:block">{label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === '/admin'
                  ? 'bg-yellow-900/50 text-yellow-300'
                  : 'text-yellow-600 hover:text-yellow-400 hover:bg-yellow-900/20'
              }`}
            >
              <Shield size={15} />
              <span className="hidden sm:block">Admin</span>
            </Link>
          )}
        </div>

        {/* Right side: offline badge + sync + auth */}
        <div className="flex items-center gap-2 shrink-0">
          {isOffline && (
            <span className="flex items-center gap-1 text-xs bg-orange-900/60 text-orange-300 border border-orange-700/50 px-2 py-0.5 rounded-full" title="You are offline — cached data is available">
              <WifiOff size={11} /> Offline
            </span>
          )}
          <span className="text-xs text-gray-500 hidden sm:block">
            <span className="text-green-400 font-semibold">{visited}</span> visited
          </span>

          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                {synced && (
                  <span title="Synced to cloud" className="text-green-500">
                    <Cloud size={14} />
                  </span>
                )}
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  title={user.displayName}
                  className="w-7 h-7 rounded-full border border-green-700"
                />
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-100 text-xs font-medium transition-colors"
              >
                <LogIn size={14} />
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
