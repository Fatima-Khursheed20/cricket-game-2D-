// PowerBar.jsx – Probability power bar with moving slider
import { BATTING_STYLES, buildCumulatives } from '../App';
import './PowerBar.css';

export default function PowerBar({ styleKey, sliderPos, active }) {
  if (!styleKey) {
    return (
      <div className="pb-wrap">
        <div className="pb-header">
          <span className="pb-title">POWER BAR</span>
        </div>
        <div className="pb-track pb-empty">
          <span className="pb-empty-text">choose a style to activate</span>
        </div>
      </div>
    );
  }

  const segs = buildCumulatives(BATTING_STYLES[styleKey].segments);

  return (
    <div className="pb-wrap">
      <div className="pb-header">
        <span className="pb-title">POWER BAR</span>
        <span className="pb-hint">stop the slider at the right zone</span>
      </div>

      {/* Bar */}
      <div className="pb-track">
        {/* Segments */}
        <div className="pb-segments">
          {segs.map(s => (
            <div
              key={s.key}
              className="pb-seg"
              style={{ flex: s.prob, background: s.color }}
              title={`${s.label} – ${Math.round(s.prob*100)}%`}
            >
              {s.prob >= 0.08 && <span className="pb-seg-text">{s.label}</span>}
            </div>
          ))}
        </div>
        {/* Needle */}
        <div
          className={`pb-needle${active ? ' pb-needle--on' : ''}`}
          style={{ left: `${sliderPos * 100}%` }}
        />
      </div>

      {/* Percentage labels */}
      <div className="pb-labels">
        {segs.map(s => (
          <div key={s.key} className="pb-lbl" style={{ flex: s.prob }}>
            <span style={{ color: s.color }}>{s.label}</span>
            <span className="pb-pct">{Math.round(s.prob*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}