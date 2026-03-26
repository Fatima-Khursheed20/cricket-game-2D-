// Scoreboard.jsx
import { BATTING_STYLES } from '../App';
import './Scoreboard.css';

export default function Scoreboard({ runs, wickets, maxWickets, overs, ballsLeft, strikeRate, style }) {
  const styleLabel = style ? BATTING_STYLES[style].label : '—';
  const styleClass = style === 'aggressive'
    ? 'stat-value stat-value--style-agg'
    : style === 'defensive'
      ? 'stat-value stat-value--style-def'
      : 'stat-value';

  return (
    <div className="scoreboard">
      <div className="sb-score-block">
        <span className="sb-runs">{runs}</span>
        <span className="sb-slash">/</span>
        <span className="sb-wkts">{wickets}</span>
      </div>
      <div className="sb-grid">
        <StatCell label="OVERS"  value={overs}      />
        <StatCell label="BALLS"  value={ballsLeft}  />
        <StatCell label="S/R"    value={strikeRate} />
        <div className="stat-cell">
          <span className="stat-label">STYLE</span>
          <span className={styleClass}>{styleLabel}</span>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="stat-cell">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}