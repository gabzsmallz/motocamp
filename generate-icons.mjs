// Run once: node generate-icons.mjs
// Generates PWA icons into public/
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.12; // corner radius

  // Background — deep forest green
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0a1409');
  grad.addColorStop(1, '#1a3320');
  ctx.fillStyle = grad;
  ctx.fill();

  const cx = size / 2;
  const cy = size / 2;
  const unit = size / 10;

  // ---- Draw tent ----
  // Tent body (triangle)
  ctx.beginPath();
  ctx.moveTo(cx, cy - unit * 2.8);          // apex
  ctx.lineTo(cx + unit * 3.2, cy + unit * 1.6); // right base
  ctx.lineTo(cx - unit * 3.2, cy + unit * 1.6); // left base
  ctx.closePath();
  ctx.fillStyle = '#22c55e';
  ctx.fill();

  // Tent door (dark triangle cutout)
  ctx.beginPath();
  ctx.moveTo(cx, cy - unit * 0.4);
  ctx.lineTo(cx + unit * 0.9, cy + unit * 1.6);
  ctx.lineTo(cx - unit * 0.9, cy + unit * 1.6);
  ctx.closePath();
  ctx.fillStyle = '#0a1409';
  ctx.fill();

  // Ground line
  ctx.beginPath();
  ctx.moveTo(cx - unit * 3.8, cy + unit * 1.6);
  ctx.lineTo(cx + unit * 3.8, cy + unit * 1.6);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = size * 0.03;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Stars above tent
  const stars = [
    [cx - unit * 2.5, cy - unit * 3.2],
    [cx + unit * 2.2, cy - unit * 3.5],
    [cx - unit * 0.5, cy - unit * 3.8],
  ];
  ctx.fillStyle = '#86efac';
  stars.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas.toBuffer('image/png');
}

writeFileSync('public/pwa-192.png', drawIcon(192));
writeFileSync('public/pwa-512.png', drawIcon(512));
console.log('Icons generated: public/pwa-192.png, public/pwa-512.png');
