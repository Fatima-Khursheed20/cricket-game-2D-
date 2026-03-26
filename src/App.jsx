// App.jsx – Root component, all game state & logic
import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Scoreboard from './components/Scoreboard';
import Pitch      from './components/Pitch';
import PowerBar   from './components/PowerBar';
import Controls   from './components/Controls';

// ── CONSTANTS ──────────────────────────────────────────────
export const TOTAL_BALLS = 12;
export const MAX_WICKETS = 2;

export const BATTING_STYLES = {
  aggressive: {
    label: 'AGGRESSIVE',
    segments: [
      { key: 'wicket', label: 'W', prob: 0.30, color: '#ef5350' },
      { key: '0',      label: '0', prob: 0.08, color: '#546e7a' },
      { key: '1',      label: '1', prob: 0.10, color: '#4fc3f7' },
      { key: '2',      label: '2', prob: 0.10, color: '#81c784' },
      { key: '3',      label: '3', prob: 0.07, color: '#ffb74d' },
      { key: '4',      label: '4', prob: 0.15, color: '#ce93d8' },
      { key: '6',      label: '6', prob: 0.20, color: '#ffd54f' },
    ],
  },
  defensive: {
    label: 'DEFENSIVE',
    segments: [
      { key: 'wicket', label: 'W', prob: 0.12, color: '#ef5350' },
      { key: '0',      label: '0', prob: 0.25, color: '#546e7a' },
      { key: '1',      label: '1', prob: 0.28, color: '#4fc3f7' },
      { key: '2',      label: '2', prob: 0.18, color: '#81c784' },
      { key: '3',      label: '3', prob: 0.07, color: '#ffb74d' },
      { key: '4',      label: '4', prob: 0.07, color: '#ce93d8' },
      { key: '6',      label: '6', prob: 0.03, color: '#ffd54f' },
    ],
  },
};

export function buildCumulatives(segments) {
  let cum = 0;
  return segments.map(s => { cum += s.prob; return { ...s, end: parseFloat(cum.toFixed(10)) }; });
}

export function getOutcome(styleKey, pos) {
  const segs = buildCumulatives(BATTING_STYLES[styleKey].segments);
  for (const s of segs) if (pos <= s.end) return s.key;
  return segs[segs.length - 1].key;
}

// ── COMMENTARY ─────────────────────────────────────────────
const LINES = {
  wicket: ['OUT! Back to the pavilion.','Bowled him! Timber!','Caught at slip – that\'s out!','Clean bowled, stumps flying!'],
  '0':    ['Dot ball. No run.','Beaten outside off.','Defended solidly, no run.'],
  '1':    ['Quick single taken.','One run, strike rotates.','Pushed to mid-on, single.'],
  '2':    ['Two runs, good running!','Driven for a couple.','They come back for two.'],
  '3':    ['Three! Great hustling!','Pushed wide, three runs.','Hard-run three!'],
  '4':    ['FOUR! Cracking shot!','BOUNDARY! Through the covers!','That races to the fence – FOUR!'],
  '6':    ['SIX! Massive hit!','SIX! Into the stands!','MAXIMUM! Crowd loves it!'],
};
const pick = key => { const p = LINES[key]??['...']; return p[Math.floor(Math.random()*p.length)]; };

// ── INITIAL STATE ──────────────────────────────────────────
const init = () => ({
  runs:0, wickets:0, ballsPlayed:0,
  style:null,
  phase:'idle', // idle|bowling|slider|batting|result
  lastResult:null,
  gameOver:false, gameOverReason:null,
  commentary:'Select a batting style to start.',
});

// ── APP ────────────────────────────────────────────────────
export default function App() {
  const [game, setGame]           = useState(init);
  const [sliderPos, setSliderPos] = useState(0);
  const [ballProg, setBallProg]   = useState(0);   // 0-1 ball travel
  const [swingProg, setSwingProg] = useState(0);   // 0-1 bat swing
  const [ballActive, setBallActive] = useState(false);

  const sliderRef = useRef({ pos:0, dir:1, running:false, rafId:null });
  const gameRef   = useRef(game);
  useEffect(() => { gameRef.current = game; }, [game]);

  // ── SLIDER ──
  const startSlider = useCallback(() => {
    const s = sliderRef.current;
    if (s.running) return;
    s.running = true;
    let last = null;
    function loop(ts) {
      if (!sliderRef.current.running) return;
      if (!last) last = ts;
      const dt = ts - last; last = ts;
      s.pos += 0.007 * dt * s.dir;
      if (s.pos >= 1) { s.pos = 1; s.dir = -1; }
      if (s.pos <= 0) { s.pos = 0; s.dir =  1; }
      setSliderPos(s.pos);
      s.rafId = requestAnimationFrame(loop);
    }
    s.rafId = requestAnimationFrame(loop);
  }, []);

  const stopSlider = useCallback(() => {
    sliderRef.current.running = false;
    if (sliderRef.current.rafId) cancelAnimationFrame(sliderRef.current.rafId);
  }, []);

  // ── BOWLING ANIM ──
  const doBowl = useCallback(() => {
    setGame(g => ({ ...g, phase:'bowling' }));
    setBallActive(true); setBallProg(0);
    let last=null, prog=0;
    function loop(ts) {
      if (!last) last=ts;
      prog += (ts-last)/650; last=ts;
      if (prog>=1) {
        setBallProg(1); setBallActive(false);
        setGame(g => ({ ...g, phase:'slider' }));
        startSlider(); return;
      }
      setBallProg(prog);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }, [startSlider]);

  // style select → start bowl if idle
  const selectStyle = useCallback(styleKey => {
    setGame(g => { if (g.gameOver) return g; return { ...g, style:styleKey }; });
  }, []);

  useEffect(() => {
    if (game.style && game.phase === 'idle' && !game.gameOver) doBowl();
  // eslint-disable-next-line
  }, [game.style, game.phase]);

  // ── PLAY SHOT ──
  const playShot = useCallback(() => {
    const g = gameRef.current;
    if (!g.style || g.gameOver || g.phase !== 'slider') return;
    stopSlider();
    const pos    = sliderRef.current.pos;
    const result = getOutcome(g.style, pos);

    setGame(g2 => ({ ...g2, phase:'batting' }));
    setBallActive(false);
    setSwingProg(0);
    let last=null, p=0;
    function loop(ts) {
      if (!last) last=ts;
      p += (ts-last)/380; last=ts;
      if (p>=1) {
        setSwingProg(0);
        // apply result
        setGame(prev => {
          const wkts   = result==='wicket' ? prev.wickets+1 : prev.wickets;
          const runs   = result!=='wicket' ? prev.runs+parseInt(result) : prev.runs;
          const balls  = prev.ballsPlayed+1;
          const over   = wkts>=MAX_WICKETS;
          const overB  = balls>=TOTAL_BALLS;
          const go     = over||overB;
          return {
            ...prev, runs, wickets:wkts, ballsPlayed:balls,
            lastResult:result, phase:'result',
            commentary: pick(result),
            gameOver:go, gameOverReason: over?'wickets':overB?'overs':null,
          };
        });
        return;
      }
      setSwingProg(p);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }, [stopSlider]);

  // ── AFTER RESULT ──
  useEffect(() => {
    if (game.phase !== 'result' || game.gameOver) return;
    const t = setTimeout(() => {
      setGame(g => ({ ...g, lastResult:null, phase:'idle' }));
    }, 1200);
    return () => clearTimeout(t);
  }, [game.phase, game.gameOver]);

  // ── RESTART ──
  const restart = useCallback(() => {
    stopSlider();
    sliderRef.current = { pos:0, dir:1, running:false, rafId:null };
    setSliderPos(0); setBallProg(0); setBallActive(false); setSwingProg(0);
    setGame(init());
  }, [stopSlider]);

  const overs = `${Math.floor(game.ballsPlayed/6)}.${game.ballsPlayed%6}`;
  const sr    = game.ballsPlayed > 0 ? ((game.runs/game.ballsPlayed)*100).toFixed(1) : '0.0';

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">CRICKET</span>
      </header>

      <Scoreboard
        runs={game.runs} wickets={game.wickets} maxWickets={MAX_WICKETS}
        overs={overs} ballsLeft={TOTAL_BALLS - game.ballsPlayed}
        strikeRate={sr} style={game.style}
      />

      <Pitch
        ballActive={ballActive} ballProg={ballProg}
        swingProg={swingProg}   phase={game.phase}
        lastResult={game.lastResult}
      />

      <div className="commentary">{game.commentary}</div>

      <Controls
        style={game.style} phase={game.phase} gameOver={game.gameOver}
        onSelectStyle={selectStyle} onPlayShot={playShot} onRestart={restart}
      >
        <PowerBar styleKey={game.style} sliderPos={sliderPos} active={game.phase==='slider'} />
      </Controls>

      {game.gameOver && (
        <div className="overlay">
          <div className="overlay-box">
            <div className="overlay-title">INNINGS OVER</div>
            <div className="overlay-score">{game.runs}/{game.wickets}</div>
            <div className="overlay-sub">
              {game.gameOverReason==='wickets' ? 'All wickets lost' : 'Overs completed'} · {overs} overs
            </div>
            <button className="btn-play-again" onClick={restart}>PLAY AGAIN</button>
          </div>
        </div>
      )}
    </div>
  );
}