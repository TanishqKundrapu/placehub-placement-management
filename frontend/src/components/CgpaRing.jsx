// Radial gauge for a CGPA on a 10-point scale
export default function CgpaRing({ value = 0, size = 112 }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / 10));
  return (
    <div className="cgpa-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`CGPA ${value} out of 10`}>
        <circle cx="50" cy="50" r={r} className="ring-track" />
        <circle cx="50" cy="50" r={r} className="ring-value" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="ring-text">
        <strong>{value}</strong>
        <span>CGPA</span>
      </div>
    </div>
  );
}
