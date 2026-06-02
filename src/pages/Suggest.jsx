import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { cx, Icon, TickCorners, ContourBg } from '../components/primitives';

const FACILITIES = [
  { key: 'toilets',      label: 'Toilets'       },
  { key: 'water',        label: 'Water'         },
  { key: 'showers',      label: 'Showers'       },
  { key: 'campfire',     label: 'Campfire'      },
  { key: 'restaurant',   label: 'Food nearby'   },
  { key: 'water_nearby', label: 'Water nearby'  },
];

export default function Suggest() {
  const { user, signIn } = useAuth();
  const [form, setForm] = useState({
    name: '', region: '', county: '', lat: '', lng: '',
    description: '', access: 'good', facilities: [], fee: '', source: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function toggleFac(key) {
    setForm(f => ({
      ...f,
      facilities: f.facilities.includes(key)
        ? f.facilities.filter(x => x !== key)
        : [...f.facilities, key],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, submittedBy: user ? user.email : 'anonymous', submittedAt: serverTimestamp() };
    try {
      await addDoc(collection(db, 'suggestions'), payload);
    } catch {
      const local = JSON.parse(localStorage.getItem('motocamps_suggestions') || '[]');
      local.push({ ...form, submittedAt: new Date().toISOString(), id: Date.now() });
      localStorage.setItem('motocamps_suggestions', JSON.stringify(local));
    }
    setSubmitted(true);
  }

  if (submitted) return (
    <div className="suggest__done-wrap">
      <div className="suggest__done card">
        <TickCorners inset={12} len={16} />
        <ContourBg seeds={[[0.5,0.5,6]]} color="var(--line)" opacity={0.5} />
        <span className="suggest__done-seal"><Icon name="check" size={30} /></span>
        <div className="display" style={{ fontSize: 28, position: 'relative', zIndex: 1 }}>Submitted.</div>
        <p className="muted" style={{ margin: 0, position: 'relative', zIndex: 1, lineHeight: 1.6 }}>
          Your suggestion has been added to the moderation queue. Once approved it will appear live on the map.
        </p>
        <button className="btn btn--signal" style={{ position: 'relative', zIndex: 1 }}
          onClick={() => { setSubmitted(false); setForm({ name:'',region:'',county:'',lat:'',lng:'',description:'',access:'good',facilities:[],fee:'',source:'' }); }}>
          Suggest another site
        </button>
      </div>
    </div>
  );

  return (
    <div className="wrap section">
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow">Community contribution</span>
        <h1 className="display sec-title" style={{ marginTop: 8 }}>Suggest a campsite</h1>
        <p className="muted" style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>
          Know a campsite that should be on this map? Submit it here. Your suggestion goes into a moderation queue — once approved it appears live for all riders.
        </p>
      </div>

      <form className="suggest__form" onSubmit={handleSubmit}>
        <div className="suggest__cols">
          {/* Left column */}
          <div>
            <div className="suggest__field">
              <label className="field-label">Campsite name *</label>
              <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Suswa Crater Camp" />
            </div>
            <div className="suggest__row2">
              <div className="suggest__field">
                <label className="field-label">Region</label>
                <input className="input" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="e.g. Naivasha" />
              </div>
              <div className="suggest__field">
                <label className="field-label">County</label>
                <input className="input" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} placeholder="e.g. Nakuru" />
              </div>
            </div>
            <div className="suggest__row2">
              <div className="suggest__field">
                <label className="field-label">Latitude</label>
                <input className="input font-mono" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="-0.9167" />
              </div>
              <div className="suggest__field">
                <label className="field-label">Longitude</label>
                <input className="input font-mono" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="36.3167" />
              </div>
            </div>
            <div className="suggest__field">
              <label className="field-label">Description *</label>
              <textarea required className="textarea" rows={5} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the campsite — approach, highlights, tips for motocampers…" />
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="suggest__field">
              <label className="field-label">Road access</label>
              <div className="suggest__access">
                {[['good','Good Road','terrain'],['moderate','Moderate','amber'],['rough','Rough / ADV','rust']].map(([k,l,t]) => (
                  <button key={k} type="button"
                    className={cx('suggest__access-btn', `tone-${t}`, form.access === k && 'is-on')}
                    onClick={() => setForm(f => ({ ...f, access: k }))}>
                    <span className="access-chip__dot" style={{ background: 'currentColor', width: 8, height: 8, borderRadius: '50%' }} />
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="suggest__field">
              <label className="field-label">Facilities</label>
              <div className="suggest__facs">
                {FACILITIES.map(({ key, label }) => (
                  <button key={key} type="button"
                    className={cx('suggest__fac', form.facilities.includes(key) && 'is-on')}
                    onClick={() => toggleFac(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="suggest__row2">
              <div className="suggest__field">
                <label className="field-label">Camp fee</label>
                <input className="input" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="e.g. KES 500" />
              </div>
              <div className="suggest__field">
                <label className="field-label">Source (YouTuber/URL)</label>
                <input className="input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. @96Lost" />
              </div>
            </div>

            {!user && (
              <div style={{ background: 'var(--paper-3)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginTop: 8 }}>
                <p className="coord" style={{ margin: '0 0 10px', color: 'var(--ink-2)' }}>Sign in to track your submission and get credit.</p>
                <button type="button" className="btn btn--sm" onClick={signIn}><Icon name="logOut" size={14} style={{ transform: 'scaleX(-1)' }} /> Sign in with Google</button>
              </div>
            )}
          </div>
        </div>

        <div className="suggest__submit">
          <button type="submit" className="btn btn--signal">
            <Icon name="navigation" size={16} /> Submit campsite
          </button>
          <p className="suggest__note coord">Submissions are reviewed before going live. We'll preserve your notes exactly as written.</p>
        </div>
      </form>
    </div>
  );
}
