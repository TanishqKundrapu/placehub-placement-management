import { Link } from 'react-router-dom';

// Placement funnel: how many applications reached each stage of the hiring pipeline.
// "Reached" is cumulative – a selected candidate has also been shortlisted and interviewed.
export default function PipelineFunnel({ counts }) {
  const { Applied = 0, Shortlisted = 0, Interview = 0, Selected = 0, Rejected = 0 } = counts;
  const total = Applied + Shortlisted + Interview + Selected + Rejected;
  const stages = [
    { key: 'Applied', label: 'Applied', reached: total, tone: 'applied' },
    { key: 'Shortlisted', label: 'Shortlisted', reached: Shortlisted + Interview + Selected, tone: 'shortlisted' },
    { key: 'Interview', label: 'Interview', reached: Interview + Selected, tone: 'interview' },
    { key: 'Selected', label: 'Offers', reached: Selected, tone: 'selected' },
  ];
  const max = Math.max(1, total);

  // SVG geometry: one band per stage, joined by tapering connectors
  const W = 1000, H = 220, gap = 60, colW = (W - gap * 3) / 4, mid = H / 2;
  const h = (n) => Math.max(10, (n / max) * (H - 30));

  return (
    <div className="funnel">
      <svg viewBox={`0 0 ${W} ${H}`} className="funnel-svg" role="img" aria-label={stages.map((s) => `${s.label} ${s.reached}`).join(', ')}>
        <defs>
          {stages.map((s) => (
            <linearGradient key={s.key} id={`fg-${s.tone}`} x1="0" x2="1">
              <stop offset="0" stopColor={`var(--s-${s.tone})`} stopOpacity="0.95" />
              <stop offset="1" stopColor={`var(--s-${s.tone})`} stopOpacity="0.75" />
            </linearGradient>
          ))}
        </defs>
        {stages.map((s, i) => {
          const x = i * (colW + gap);
          const hh = h(s.reached);
          const next = stages[i + 1];
          return (
            <g key={s.key} className="funnel-stage" style={{ '--d': `${i * 140}ms` }}>
              {next && (
                <path
                  className="funnel-flow"
                  d={`M${x + colW} ${mid - hh / 2} C${x + colW + gap / 2} ${mid - hh / 2}, ${x + colW + gap / 2} ${mid - h(next.reached) / 2}, ${x + colW + gap} ${mid - h(next.reached) / 2}
                      L${x + colW + gap} ${mid + h(next.reached) / 2} C${x + colW + gap / 2} ${mid + h(next.reached) / 2}, ${x + colW + gap / 2} ${mid + hh / 2}, ${x + colW} ${mid + hh / 2} Z`}
                  fill={`var(--s-${next.tone})`}
                />
              )}
              <rect className="funnel-bar" x={x} y={mid - hh / 2} width={colW} height={hh} rx="10" fill={`url(#fg-${s.tone})`} />
            </g>
          );
        })}
      </svg>
      <div className="funnel-legend">
        {stages.map((s) => (
          <Link key={s.key} to={`/applications?status=${s.key}`} className="funnel-col">
            <span className={`dot dot-${s.tone}`} />
            <span className="funnel-num">{s.reached}</span>
            <span className="funnel-label">{s.label}</span>
            <span className="funnel-pct">{total ? Math.round((s.reached / total) * 100) : 0}%</span>
          </Link>
        ))}
      </div>
      <p className="funnel-note">
        <span className="dot dot-rejected" /> {Rejected} application{Rejected === 1 ? '' : 's'} closed as rejected · counts show how far each application has progressed
      </p>
    </div>
  );
}
