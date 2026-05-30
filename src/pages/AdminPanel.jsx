import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle, XCircle, Users, MapPin, Tent, Clock, Trash2 } from 'lucide-react';
import { campsites } from '../data/campsites';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({ users: 0, totalVisited: 0, totalPlanned: 0 });
  const [tab, setTab] = useState('suggestions');
  const [loadingSugg, setLoadingSugg] = useState(true);

  // Guard — redirect non-admins
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  // Load suggestions from Firestore
  useEffect(() => {
    if (!isAdmin) return;
    const ref = collection(db, 'suggestions');
    const unsub = onSnapshot(ref, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
      setSuggestions(items);
      setLoadingSugg(false);
    });
    return unsub;
  }, [isAdmin]);

  // Load aggregate user stats
  useEffect(() => {
    if (!isAdmin) return;
    const ref = collection(db, 'users');
    const unsub = onSnapshot(ref, (snap) => {
      let totalVisited = 0, totalPlanned = 0;
      snap.docs.forEach(d => {
        const data = d.data();
        // data structure: { uid: { sites: {...} } } or subcollection
        // We stored under users/{uid}/data/sites — count via subcollection is async,
        // so just count users for now
      });
      setStats(s => ({ ...s, users: snap.docs.length }));
    });
    return unsub;
  }, [isAdmin]);

  async function approveSuggestion(suggestion) {
    // Move to a 'pending_campsites' collection for manual code addition
    await setDoc(doc(db, 'approved_suggestions', suggestion.id), {
      ...suggestion,
      approvedAt: serverTimestamp(),
      approvedBy: user.email,
    });
    await deleteDoc(doc(db, 'suggestions', suggestion.id));
  }

  async function rejectSuggestion(id) {
    await deleteDoc(doc(db, 'suggestions', id));
  }

  if (loading || !isAdmin) return null;

  const tabs = [
    { key: 'suggestions', label: 'Suggestions', count: suggestions.length },
    { key: 'stats', label: 'Stats' },
    { key: 'campsites', label: 'Campsites' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-900/40 border border-yellow-700/50 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-yellow-200">Admin Panel</h1>
          <p className="text-xs text-gray-500">Signed in as {user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2d5a2e]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-yellow-500 text-yellow-300'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 bg-yellow-800 text-yellow-200 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Suggestions tab */}
      {tab === 'suggestions' && (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            Review community-submitted campsites. Approve to save for code addition, or reject to discard.
          </p>
          {loadingSugg ? (
            <div className="text-center py-12 text-gray-500">Loading suggestions…</div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-gray-600 border border-[#2d5a2e]/30 rounded-xl">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p>No pending suggestions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map(s => (
                <div key={s.id} className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-green-100">{s.name || 'Unnamed'}</h3>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {s.region && `${s.region}, `}{s.county}
                        {s.submittedAt && ` · ${new Date(s.submittedAt.seconds * 1000).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveSuggestion(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/50 hover:bg-green-800 border border-green-700 text-green-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => rejectSuggestion(s.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 leading-relaxed">{s.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {s.lat && s.lng && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {s.lat}, {s.lng}
                      </span>
                    )}
                    {s.access && (
                      <span className="capitalize">🛣️ {s.access}</span>
                    )}
                    {s.fee && <span>💰 {s.fee}</span>}
                    {s.source && <span>▶ {s.source}</span>}
                    {s.facilities?.length > 0 && (
                      <span>🏕️ {s.facilities.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Registered Users', value: stats.users, icon: Users, color: 'text-blue-400' },
              { label: 'Total Campsites', value: campsites.length, icon: Tent, color: 'text-green-400' },
              { label: 'Pending Suggestions', value: suggestions.length, icon: Clock, color: 'text-yellow-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-xl p-5 text-center">
                <Icon size={24} className={`mx-auto mb-2 ${color}`} />
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Campsite Coverage</h3>
            <div className="space-y-2">
              {['Nairobi', 'Nakuru', 'Laikipia', 'Narok', 'Samburu', 'Marsabit', 'Kilifi', 'Makueni'].map(county => {
                const count = campsites.filter(s => s.county === county).length;
                return count > 0 ? (
                  <div key={county} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-28">{county}</span>
                    <div className="flex-1 h-2 bg-[#1e3320] rounded-full overflow-hidden">
                      <div className="h-full bg-green-700 rounded-full" style={{ width: `${(count / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Campsites tab */}
      {tab === 'campsites' && (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            All {campsites.length} campsites in the database. Edit them by updating <code className="bg-[#1e3320] px-1 rounded text-xs">src/data/campsites.js</code>.
          </p>
          <div className="space-y-2">
            {campsites.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-[#141f14] border border-[#2d5a2e]/40 rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm text-green-100 font-medium">{s.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{s.region}, {s.county}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.access === 'good' ? 'bg-green-900/40 text-green-400' :
                    s.access === 'moderate' ? 'bg-yellow-900/40 text-yellow-400' :
                    'bg-red-900/40 text-red-400'
                  }`}>{s.access}</span>
                  <span className="text-xs text-gray-600">#{s.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
