import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Suggest() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', region: '', county: '', lat: '', lng: '',
    description: '', access: 'good', facilities: [],
    fee: '', source: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const facilityOptions = [
    { key: 'toilets', label: '🚻 Toilets' },
    { key: 'water', label: '💧 Water' },
    { key: 'showers', label: '🚿 Showers' },
    { key: 'campfire', label: '🔥 Campfire' },
    { key: 'restaurant', label: '🍽️ Food nearby' },
    { key: 'water_nearby', label: '🏞️ Water nearby' },
  ];

  function toggle(key) {
    setForm(f => ({
      ...f,
      facilities: f.facilities.includes(key)
        ? f.facilities.filter(x => x !== key)
        : [...f.facilities, key],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      submittedBy: user ? user.email : 'anonymous',
      submittedAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'suggestions'), payload);
    } catch (err) {
      // Fallback to localStorage if Firestore fails (e.g. not logged in + rules)
      const local = JSON.parse(localStorage.getItem('motocamps_suggestions') || '[]');
      local.push({ ...form, submittedAt: new Date().toISOString(), id: Date.now() });
      localStorage.setItem('motocamps_suggestions', JSON.stringify(local));
    }
    setSubmitted(true);
  }

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-green-100 mb-2">Campsite Suggested!</h2>
      <p className="text-gray-400 mb-6">Your suggestion has been saved locally. In a future update, this will be submitted to the community database for review.</p>
      <button
        onClick={() => { setSubmitted(false); setForm({ name: '', region: '', county: '', lat: '', lng: '', description: '', access: 'good', facilities: [], fee: '', source: '', notes: '' }); }}
        className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-xl text-sm transition-colors"
      >
        Suggest Another
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-green-100 mb-2">Suggest a Campsite</h1>
      <p className="text-gray-400 text-sm mb-6">Know a campsite that should be on this list? Submit it here. Suggestions are saved locally and will be reviewed for addition to the community database.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Campsite Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Suswa Crater Camp"
              className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Region</label>
              <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                placeholder="e.g. Naivasha"
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">County</label>
              <input value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}
                placeholder="e.g. Nakuru"
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
              <input value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                placeholder="-0.9167"
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600 font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
              <input value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                placeholder="36.3167"
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600 font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-[#141f14] border border-[#2d5a2e]/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Details</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description *</label>
            <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the campsite — what to expect, highlights, any important tips for motocampers..."
              rows={4}
              className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600 resize-none" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Road Access</label>
            <select value={form.access} onChange={e => setForm(f => ({ ...f, access: e.target.value }))}
              className="w-full bg-[#1e3320] border border-[#2d5a2e] text-gray-300 rounded-xl px-3 py-2 text-sm">
              <option value="good">Good Road (tarmac or well-maintained murram)</option>
              <option value="moderate">Moderate (rough murram or sandy)</option>
              <option value="rough">Rough/ADV (technical off-road)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Facilities</label>
            <div className="flex flex-wrap gap-2">
              {facilityOptions.map(({ key, label }) => (
                <button type="button" key={key} onClick={() => toggle(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.facilities.includes(key)
                      ? 'bg-green-900/50 border-green-600 text-green-300'
                      : 'bg-[#1e3320] border-[#2d5a2e] text-gray-400 hover:border-green-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Camping Fee</label>
              <input value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
                placeholder="e.g. KES 500"
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Source (YouTuber / website)</label>
              <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder="e.g. @96Lost"
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600" />
            </div>
          </div>
        </div>

        <button type="submit"
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-colors">
          <Send size={16} /> Submit Suggestion
        </button>
      </form>
    </div>
  );
}
