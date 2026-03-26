// Controls.jsx – Style chips, power bar slot, action buttons
import './Controls.css';

export default function Controls({
  style, phase, gameOver,
  onSelectStyle, onPlayShot, onRestart,
  children,
}) {
  const canShot  = !gameOver && phase === 'slider';
  const canStyle = !gameOver && (phase === 'idle' || phase === 'slider' || phase === 'result');

  return (
    <div className="controls">

      {/* Row 1: style selector */}
      <div className="ctrl-top-row">
        <div className="ctrl-style-group">
          <span className="ctrl-style-label">STYLE</span>
          <div className="style-chips">
            <button
              className={`style-chip style-chip--agg${style === 'aggressive' ? ' style-chip--on' : ''}`}
              onClick={() => onSelectStyle('aggressive')}
              disabled={!canStyle}
            >
              <span className="chip-icon">⚡</span> Aggressive
            </button>
            <button
              className={`style-chip style-chip--def${style === 'defensive' ? ' style-chip--on' : ''}`}
              onClick={() => onSelectStyle('defensive')}
              disabled={!canStyle}
            >
              <span className="chip-icon">🛡</span> Defensive
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: power bar */}
      <div className="ctrl-powerbar">
        {children}
      </div>

      {/* Row 3: shoot + restart + status */}
      <div className="ctrl-bottom-row">
        <div className="ctrl-actions">
          <button className="btn-shoot" onClick={onPlayShot} disabled={!canShot}>
            PLAY SHOT
          </button>
          <button className="btn-restart" onClick={onRestart}>
            NEW
          </button>
        </div>
        <div className="ctrl-status">
          <StatusText phase={phase} style={style} gameOver={gameOver} />
        </div>
      </div>

    </div>
  );
}

function StatusText({ phase, style, gameOver }) {
  if (gameOver)            return <span>Game over.</span>;
  if (!style)              return <span>Pick a style above.</span>;
  if (phase === 'idle')    return <span>Getting ready...</span>;
  if (phase === 'bowling') return <span>Ball incoming...</span>;
  if (phase === 'slider')  return <span className="status-active">Stop the slider!</span>;
  if (phase === 'batting') return <span>Shot played.</span>;
  if (phase === 'result')  return <span>Next ball...</span>;
  return null;
}