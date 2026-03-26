// Pitch.jsx – Side-view 2D pitch with clean stickman players, proper stadium (light theme)
import { useRef, useEffect } from 'react';
import './Pitch.css';

const CW = 820;
const CH = 260;

const BATSMAN_X  = 160;
const BOWLER_X   = 660;
const GROUND_Y   = 200;
const STUMP_Y    = GROUND_Y;

function lerp(a, b, t) { return a + (b - a) * t; }

function drawField(ctx) {
  // Sky — bright afternoon blue gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0,   '#87CEEB');
  skyGrad.addColorStop(0.5, '#b8e4f7');
  skyGrad.addColorStop(1,   '#ddf0fa');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CW, GROUND_Y);

  // Sun
  ctx.beginPath();
  ctx.arc(CW - 65, 35, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(255, 200, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Simple clean white clouds
  function drawCloud(cx, cy, scale) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    [[0,0,18],[22,-6,15],[42,0,17],[60,-3,13]].forEach(([dx,dy,r]) => {
      ctx.beginPath();
      ctx.arc(cx + dx * scale, cy + dy * scale, r * scale, 0, Math.PI*2);
      ctx.fill();
    });
  }
  drawCloud(90, 30, 0.9);
  drawCloud(360, 20, 0.7);
  drawCloud(570, 38, 0.75);

  // ── Stadium stands (left + right) ──
  function drawStand(x, w, standColor, roofColor) {
    // Stand body
    ctx.fillStyle = standColor;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x, GROUND_Y - 60);
    ctx.lineTo(x + w, GROUND_Y - 80);
    ctx.lineTo(x + w, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(x - 4, GROUND_Y - 60);
    ctx.lineTo(x + w + 4, GROUND_Y - 80);
    ctx.lineTo(x + w + 4, GROUND_Y - 70);
    ctx.lineTo(x - 4, GROUND_Y - 50);
    ctx.closePath();
    ctx.fill();

    // Crowd rows — colourful dots, orderly grid
    const rowCount = 3;
    const dotColors = ['#ef4444','#3b82f6','#f59e0b','#22c55e','#a855f7','#ec4899'];
    for (let row = 0; row < rowCount; row++) {
      const rowY = GROUND_Y - 15 - row * 17;
      const slope = (row / rowCount);
      const rowX  = x + slope * (w * 0.08);
      const rowW  = w - slope * (w * 0.08);
      const dots  = Math.floor(rowW / 9);
      for (let d = 0; d < dots; d++) {
        ctx.beginPath();
        ctx.arc(rowX + d * 9 + 4, rowY, 3, 0, Math.PI*2);
        ctx.fillStyle = dotColors[(row * 7 + d) % dotColors.length];
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  // Left stand
  drawStand(0, 110, '#e0e7ef', '#94a3b8');
  // Right stand
  drawStand(CW - 110, 110, '#e0e7ef', '#94a3b8');

  // Ground — lush green outfield
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CH);
  groundGrad.addColorStop(0, '#4ade80');
  groundGrad.addColorStop(0.4, '#22c55e');
  groundGrad.addColorStop(1, '#15803d');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y);

  // Mow stripes on outfield
  for (let i = 0; i < 12; i++) {
    const stripX = i * (CW / 12);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(stripX, GROUND_Y, CW / 12, CH - GROUND_Y);
  }

  // Ground boundary line (white)
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(CW, GROUND_Y); ctx.stroke();

  // Pitch strip — dry clay
  const pitchLeft  = BATSMAN_X - 12;
  const pitchRight = BOWLER_X  + 12;
  const pitchGrad  = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + 10);
  pitchGrad.addColorStop(0, '#d4a76a');
  pitchGrad.addColorStop(1, '#b8885a');
  ctx.fillStyle = pitchGrad;
  ctx.fillRect(pitchLeft, GROUND_Y, pitchRight - pitchLeft, 10);

  // Crease lines
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(BATSMAN_X - 26, GROUND_Y); ctx.lineTo(BATSMAN_X + 26, GROUND_Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(BOWLER_X  - 26, GROUND_Y); ctx.lineTo(BOWLER_X  + 26, GROUND_Y); ctx.stroke();
}

function drawStumps(ctx, cx, y) {
  ctx.shadowColor = 'rgba(180, 100, 30, 0.3)';
  ctx.shadowBlur  = 4;
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth   = 2.5;
  [-6, 0, 6].forEach(o => {
    ctx.beginPath();
    ctx.moveTo(cx + o, y);
    ctx.lineTo(cx + o, y - 36);
    ctx.stroke();
  });
  // Bails
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth   = 2;
  ctx.shadowColor = 'rgba(254,243,199,0.6)';
  ctx.shadowBlur  = 4;
  ctx.beginPath(); ctx.moveTo(cx - 9, y - 36); ctx.lineTo(cx + 9, y - 36); ctx.stroke();
  ctx.shadowBlur  = 0;
}

function drawBatsman(ctx, swingT) {
  const x = BATSMAN_X;
  const y = STUMP_Y;

  ctx.save();
  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';

  const swingAngle = swingT > 0
    ? lerp(Math.PI * 0.22, -Math.PI * 0.35, Math.sin(swingT * Math.PI))
    : Math.PI * 0.22;

  const headR = 9;
  const headY = y - 82;
  const torsoTop = headY + headR + 2;
  const torsoBot = y - 44;
  const hipY = torsoBot;

  // ── HEAD (plain circle, no jersey patch) ──
  ctx.strokeStyle = '#1e293b';
  ctx.fillStyle   = '#fcd5b0'; // skin tone
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(x, headY, headR, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Helmet outline (orange arc over top of head)
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth   = 3;
  ctx.beginPath(); ctx.arc(x, headY, headR + 1, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // ── TORSO (simple lines, no filled rect) ──
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, torsoTop);
  ctx.lineTo(x, torsoBot);
  ctx.stroke();

  // ── LEGS ──
  ctx.lineWidth = 2;
  // Left leg
  ctx.beginPath();
  ctx.moveTo(x, hipY);
  ctx.lineTo(x - 13, y - 18);
  ctx.lineTo(x - 15, y);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x, hipY);
  ctx.lineTo(x + 9, y - 18);
  ctx.lineTo(x + 7, y);
  ctx.stroke();

  // ── ARMS + BAT (pivot from shoulder) ──
  const shoulderY = torsoTop + 8;
  ctx.save();
  ctx.translate(x, shoulderY);
  ctx.rotate(swingAngle);

  // Upper arm
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 10); ctx.stroke();
  // Forearm
  ctx.beginPath(); ctx.moveTo(16, 10); ctx.lineTo(26, 22); ctx.stroke();

  // Bat handle + blade
  ctx.save();
  ctx.translate(26, 22);
  const isSwinging = swingT > 0.3;
  ctx.strokeStyle = isSwinging ? '#f97316' : '#92400e';
  ctx.lineWidth   = 2;
  // Handle
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 12); ctx.stroke();
  // Blade — just outline, no fill rectangle
  ctx.strokeStyle = isSwinging ? '#f97316' : '#b45309';
  ctx.lineWidth   = 7;
  ctx.lineCap     = 'round';
  if (isSwinging) {
    ctx.shadowColor = 'rgba(249,115,22,0.5)';
    ctx.shadowBlur  = 12;
  }
  ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(0, 38); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineCap    = 'round';
  ctx.restore();

  // Off arm (other side)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 8); ctx.lineTo(-20, 18); ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawBowler(ctx, phase, ballProg) {
  const x = BOWLER_X;
  const y = STUMP_Y;

  const isBowling = phase === 'bowling';
  const armAngle  = isBowling
    ? lerp(Math.PI * 0.45, -Math.PI * 0.55, ballProg)
    : -Math.PI * 0.1;

  ctx.save();
  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';

  const headR  = 9;
  const headY  = y - 82;
  const torsoTop = headY + headR + 2;
  const torsoBot = y - 44;
  const hipY   = torsoBot;

  // ── HEAD ──
  ctx.strokeStyle = '#1e293b';
  ctx.fillStyle   = '#fcd5b0';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(x, headY, headR, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Cap (green arc)
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth   = 3;
  ctx.beginPath(); ctx.arc(x, headY, headR + 1, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // ── TORSO ──
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, torsoTop);
  ctx.lineTo(x, torsoBot);
  ctx.stroke();

  // ── LEGS (stride animation) ──
  const strideT = isBowling ? Math.sin(ballProg * Math.PI) : 0;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, hipY);
  ctx.lineTo(x - 13 - strideT * 10, y - 16);
  ctx.lineTo(x - 17 - strideT * 12, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, hipY);
  ctx.lineTo(x + 9 + strideT * 8, y - 18);
  ctx.lineTo(x + 11 + strideT * 8, y);
  ctx.stroke();

  // ── BOWLING ARM ──
  const shoulderY = torsoTop + 8;
  ctx.save();
  ctx.translate(x, shoulderY);
  ctx.rotate(armAngle);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-16, 12); ctx.lineTo(-26, 26); ctx.stroke();
  ctx.restore();

  // Non-bowling arm
  ctx.save();
  ctx.translate(x, shoulderY);
  ctx.rotate(armAngle * -0.4);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 10); ctx.lineTo(18, 22); ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawBall(ctx, ballActive, ballProg) {
  if (!ballActive) return;

  const startX = BOWLER_X  - 30;
  const startY = GROUND_Y  - 88;
  const endX   = BATSMAN_X + 42;
  const endY   = GROUND_Y  - 36;

  const t  = ballProg;
  const bx = lerp(startX, endX, t);
  const by = lerp(startY, endY, t) - 28 * Math.sin(t * Math.PI);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(lerp(startX, endX, t), GROUND_Y + 3, 7, 2.5, 0, 0, Math.PI*2); ctx.fill();

  // Ball — red leather
  const ballGrad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 7);
  ballGrad.addColorStop(0, '#fca5a5');
  ballGrad.addColorStop(0.4, '#ef4444');
  ballGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle   = ballGrad;
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth   = 1;
  ctx.shadowColor = 'rgba(239,68,68,0.4)';
  ctx.shadowBlur  = 10;
  ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // Seam
  ctx.strokeStyle = 'rgba(255,220,200,0.8)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.arc(bx - 1, by - 1, 5, 0.4, 2.2); ctx.stroke();
}

function drawResult(ctx, result) {
  if (!result) return;
  let label = '';
  let color = '#1e293b';
  let bgColor = 'rgba(255,255,255,0.92)';

  if      (result === 'wicket') { label = 'OUT!';       color = '#ef4444'; bgColor = 'rgba(254,226,226,0.92)'; }
  else if (result === '6')      { label = 'SIX!';       color = '#7c3aed'; bgColor = 'rgba(237,233,254,0.92)'; }
  else if (result === '4')      { label = 'FOUR!';      color = '#f97316'; bgColor = 'rgba(255,247,237,0.92)'; }
  else if (result === '0')      { label = 'DOT';        color = '#64748b'; bgColor = 'rgba(241,245,249,0.92)'; }
  else                          { label = `${result}!`; color = '#16a34a'; bgColor = 'rgba(220,252,231,0.92)'; }

  const textW = 140;
  const textH = 52;
  const tx = CW / 2 - textW / 2;
  const ty = CH / 2 - 10 - textH / 2;

  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur  = 20;
  ctx.beginPath(); ctx.roundRect(tx, ty, textW, textH, 12); ctx.fill();
  ctx.shadowBlur  = 0;

  ctx.font         = 'bold 30px "Share Tech Mono", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = color;
  ctx.fillText(label, CW / 2, CH / 2 - 10);
  ctx.restore();
}

export default function Pitch({ ballActive, ballProg, swingProg, phase, lastResult }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CW, CH);

    drawField(ctx);
    drawStumps(ctx, BATSMAN_X, STUMP_Y);
    drawStumps(ctx, BOWLER_X,  STUMP_Y);
    drawBall(ctx, ballActive, ballProg);
    drawBatsman(ctx, swingProg);
    drawBowler(ctx, phase, ballProg);
    if (phase === 'result') drawResult(ctx, lastResult);

  }, [ballActive, ballProg, swingProg, phase, lastResult]);

  return (
    <div className="pitch-wrap">
      <canvas ref={ref} width={CW} height={CH} className="pitch-canvas" />
    </div>
  );
}