import { useMemo, useState } from 'react';

// ---- cx helper -------------------------------------------------------
export const cx = (...a) => a.filter(Boolean).join(' ');

// ---- SVG Icon --------------------------------------------------------
const ICONS = {
  map: "M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Zm0 0v15m6-12v15",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4.2-14.2-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z",
  plus: "M12 5v14M5 12h14",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 10a2 2 0 1 0 0 .01",
  navigation: "M3 11l19-9-9 19-2-8-8-2Z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-4-10 3 3 5-6",
  arrowLeft: "M19 12H5m7 7-7-7 7-7",
  arrowRight: "M5 12h14m-7-7 7 7-7 7",
  download: "M12 3v12m-5-5 5 5 5-5M5 21h14",
  x: "M18 6 6 18M6 6l12 12",
  image: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm5 4a1.5 1.5 0 1 0 0-.01M21 16l-5-5L5 21",
  upload: "M12 17V5m-5 5 5-5 5 5M5 21h14",
  link: "M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  tent: "M3.5 21 12 4l8.5 17M12 4v17M3.5 21h17",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
  flame: "M12 22c4 0 7-2.5 7-6.5 0-2-1-4-2.5-5.5C15 13 13.5 12 13.5 9 13.5 6 11 3 9 2c.5 3-1.5 5-3 7C4.7 10.7 4 13 4 15.5 4 19.5 8 22 12 22Z",
  droplet: "M12 22a7 7 0 0 0 7-7c0-3-3-7-7-12C8 8 5 12 5 15a7 7 0 0 0 7 7Z",
  mountain: "M8 3l4 8 5-5 5 15H2L8 3Z",
  star: "M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9 9l3-6Z",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  externalLink: "M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Zm-11-3a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  thumbsUp: "M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4.5-8a2.5 2.5 0 0 1 2.5 2.5V8h5a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 18 20H7",
  route: "M6 4a2 2 0 1 0 0 .01M18 20a2 2 0 1 0 0-.01M6 6v6a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4",
  fuel: "M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M3 22h12M3 10h10m3-2 3 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-9l-4-4",
  filter: "M3 4h18l-7 8v6l-4 2v-8L3 4Z",
  layers: "M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3.5 0L7 22l5-3 5 3-1.5-7",
  logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
  wifiOff: "M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  cloud: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
};
export function Icon({ name, size = 18, className = '', strokeWidth = 1.75, style }) {
  const d = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true">
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

// ---- Topographic contour background ----------------------------------
function contourField({ w, h, cx: ccx, cy: ccy, rings, step, seed, squish = 1 }) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const phase = Array.from({ length: 6 }, () => rnd() * Math.PI * 2);
  const amp   = Array.from({ length: 6 }, (_, i) => (0.12 / (i + 1)) * (0.6 + rnd() * 0.8));
  const paths = [];
  for (let r = 1; r <= rings; r++) {
    const rad = r * step;
    const pts = [];
    const N = 90;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      let k = 1;
      for (let o = 0; o < amp.length; o++) k += amp[o] * Math.sin((o + 2) * a + phase[o] + r * 0.4);
      const rr = rad * k;
      pts.push([ccx + Math.cos(a) * rr, ccy + Math.sin(a) * rr * squish]);
    }
    paths.push('M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ') + ' Z');
  }
  return paths;
}
export function ContourBg({ seeds = [[0.3, 0.4, 7], [0.85, 0.75, 9]], color = 'var(--line)', opacity = 0.5, strokeWidth = 1, className = '', style }) {
  const W = 1000, H = 700;
  const all = useMemo(() => seeds.map(([fx, fy, rings], i) =>
    contourField({ w: W, h: H, cx: fx * W, cy: fy * H, rings, step: 26, seed: 999 + i * 37, squish: 0.78 })
  ), [JSON.stringify(seeds)]);
  return (
    <svg className={cx('topo-bg', className)} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity, ...style }} aria-hidden="true">
      {all.flatMap((group, gi) => group.map((d, i) => (
        <path key={`${gi}-${i}`} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />
      )))}
    </svg>
  );
}

// ---- Registration tick corners ---------------------------------------
export function TickCorners({ inset = 8, len = 12, color = 'var(--ink)', opacity = 0.5 }) {
  const C = ({ x, y, sx, sy }) => (
    <g stroke={color} strokeWidth="1.25" opacity={opacity}>
      <line x1={x} y1={y} x2={`${typeof x === 'number' ? x + sx * len : `calc(${x} + ${sx * len}px)`}`} y2={y} />
      <line x1={x} y1={y} x2={x} y2={`${typeof y === 'number' ? y + sy * len : `calc(${y} + ${sy * len}px)`}`} />
    </g>
  );
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
      <C x={inset} y={inset} sx={1} sy={1} />
      <C x={`calc(100% - ${inset}px)`} y={inset} sx={-1} sy={1} />
      <C x={inset} y={`calc(100% - ${inset}px)`} sx={1} sy={-1} />
      <C x={`calc(100% - ${inset}px)`} y={`calc(100% - ${inset}px)`} sx={-1} sy={-1} />
    </svg>
  );
}

// ---- Stamp -----------------------------------------------------------
export function Stamp({ children, tone = 'ink', className = '', ...rest }) {
  return <span className={cx('stamp', `stamp--${tone}`, className)} {...rest}>{children}</span>;
}

// ---- Access chip -----------------------------------------------------
export function AccessChip({ access, size = 'sm' }) {
  const LABELS = { good: { label: 'Good Road', token: 'terrain' }, moderate: { label: 'Moderate', token: 'amber' }, rough: { label: 'Rough / ADV', token: 'rust' } };
  const a = LABELS[access] || LABELS.good;
  return (
    <span className={cx('access-chip', `tone-${a.token}`, size === 'lg' && 'access-chip--lg')}>
      <span className="access-chip__dot" />
      {a.label}
    </span>
  );
}

// ---- Waypoint pin ----------------------------------------------------
export function WaypointPin({ n, tone = 'signal', size = 30, active }) {
  return (
    <span className={cx('waypoint', `tone-${tone}`, active && 'is-active')} style={{ width: size, height: size }}>
      <span className="waypoint__num">{n}</span>
    </span>
  );
}

// ---- Rating bar ------------------------------------------------------
export function RatingBar({ label, value, hint, showVal = true, compact }) {
  const pct = (value / 5) * 100;
  return (
    <div className={cx('ratebar', compact && 'ratebar--compact')}>
      <div className="ratebar__head">
        <span className="ratebar__label">{label}</span>
        {showVal && <span className="ratebar__val">{Math.round(value * 10) / 10}</span>}
      </div>
      <div className="ratebar__track" title={hint}>
        <div className="ratebar__fill" style={{ width: `${pct}%` }} />
        {[1,2,3,4].map(t => <span key={t} className="ratebar__tick" style={{ left: `${t * 20}%` }} />)}
      </div>
    </div>
  );
}

// ---- Score badge -----------------------------------------------------
export function ScoreBadge({ value, count, size = 'md' }) {
  return (
    <div className={cx('scorebadge', `scorebadge--${size}`)}>
      <div className="scorebadge__num">{(Math.round(value * 10) / 10).toFixed(1)}</div>
      <div className="scorebadge__meta">
        <div className="scorebadge__out">/ 5.0</div>
        {count != null && <div className="scorebadge__count">{count} log{count !== 1 ? 's' : ''}</div>}
      </div>
    </div>
  );
}

// ---- Star input ------------------------------------------------------
export function StarInput({ value, onChange, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="starinput" onMouseLeave={() => setHover(0)}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" className={cx('starinput__btn', (hover || value) >= n && 'is-on')}
          onMouseEnter={() => setHover(n)} onClick={() => onChange(n)} aria-label={`${n} star`}>
          <Icon name="star" size={size} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

// ---- Avatar ----------------------------------------------------------
export function AvatarIcon({ name = '?', size = 34 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = useMemo(() => { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360; return h; }, [name]);
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: `oklch(0.62 0.09 ${hue})` }}>
      {initials}
    </span>
  );
}

// ---- Site image with fallback ----------------------------------------
export function SiteImg({ src, alt, className, children }) {
  const [err, setErr] = useState(false);
  return (
    <div className={cx('siteimg', className)}>
      {src && !err
        ? <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} />
        : <div className="siteimg__ph"><Icon name="mountain" size={28} /></div>}
      {children}
    </div>
  );
}

// ---- Facilities row --------------------------------------------------
const FAC_ICON = { toilets: 'tent', water: 'droplet', water_nearby: 'droplet', showers: 'droplet', campfire: 'flame', restaurant: 'fuel' };
const FAC_LABELS = { toilets: 'Toilets', water: 'Water', water_nearby: 'Water nearby', showers: 'Showers', campfire: 'Campfire', restaurant: 'Food' };
export function Facilities({ items = [], className }) {
  return (
    <div className={cx('facrow', className)}>
      {items.map(f => FAC_LABELS[f] && (
        <span key={f} className="facrow__item" title={FAC_LABELS[f]}>
          <Icon name={FAC_ICON[f] || 'check'} size={13} strokeWidth={1.75} />
          <span>{FAC_LABELS[f]}</span>
        </span>
      ))}
    </div>
  );
}
