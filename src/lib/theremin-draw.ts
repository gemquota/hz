import {
  SEMITONES,
  hueForX,
  isBlackKey,
  noteLabel,
} from "@/lib/pitch";

export type FieldDraw = {
  nx: number;
  ny: number;
  amp: number;
  hue: number;
  present: boolean;
};

function hsl(hue: number, sat: number, light: number, alpha = 1) {
  return `hsl(${hue} ${sat}% ${light}% / ${alpha})`;
}

export function drawField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: FieldDraw,
) {
  const { nx, ny, amp, hue, present } = state;
  ctx.clearRect(0, 0, w, h);

  const keyH = Math.max(36, Math.min(68, h * 0.15));
  const keyTop = h - keyH;
  const step = w / SEMITONES;

  ctx.lineWidth = 1;
  for (const p of [0.25, 0.5, 0.75]) {
    const y = Math.round(keyTop * p) + 0.5;
    ctx.strokeStyle = hsl(hue, 50, 60, 0.06 + amp * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  for (let i = 0; i <= SEMITONES; i++) {
    const x = Math.round((i / SEMITONES) * w) + 0.5;
    const pc = i % 12;
    const isC = pc === 0;
    const natural = pc === 0 || pc === 2 || pc === 4 || pc === 5 || pc === 7 || pc === 9 || pc === 11;
    ctx.strokeStyle = hsl(
      hueForX(i / SEMITONES),
      70,
      62,
      (isC ? 0.28 : natural ? 0.1 : 0.04) + amp * (isC ? 0.25 : 0.08),
    );
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, keyTop);
    ctx.stroke();
  }

  if (present && amp > 0.01) {
    const gx = nx * w;
    const gy = ny * h;
    const radius = 70 + amp * 240;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
    glow.addColorStop(0, hsl(hue, 100, 62, 0.16 + amp * 0.28));
    glow.addColorStop(1, hsl(hue, 100, 50, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  for (let i = 0; i < SEMITONES; i++) {
    const x = i * step;
    const keyHue = hueForX((i + 0.5) / SEMITONES);
    ctx.fillStyle = hsl(keyHue, 85, 58, 0.05 + amp * 0.05);
    ctx.fillRect(x + 0.5, keyTop, step - 1, keyH);
    ctx.strokeStyle = hsl(keyHue, 80, 64, 0.28 + amp * 0.25);
    ctx.strokeRect(x + 1, keyTop + 0.5, step - 2, keyH - 1);
  }

  for (let i = 0; i < SEMITONES; i++) {
    if (!isBlackKey(i)) continue;
    const x = i * step;
    const keyHue = hueForX((i + 0.5) / SEMITONES);
    const kh = keyH * 0.62;
    ctx.fillStyle = hsl(keyHue, 90, 46, 0.38 + amp * 0.28);
    ctx.fillRect(x + 0.5, keyTop, step - 1, kh);
  }

  if (present) {
    const i = Math.min(SEMITONES - 1, Math.max(0, Math.floor(nx * SEMITONES)));
    const x = i * step;
    const keyHue = hueForX((i + 0.5) / SEMITONES);
    ctx.fillStyle = hsl(keyHue, 100, 62, 0.18 + amp * 0.55);
    ctx.fillRect(x + 0.5, keyTop, step - 1, keyH);

    const handY = Math.min(ny * h, keyTop);
    const columnTop = handY;
    const columnH = keyTop - columnTop;
    if (columnH > 1) {
      const col = ctx.createLinearGradient(0, columnTop, 0, keyTop);
      col.addColorStop(0, hsl(hue, 100, 64, 0.05 + amp * 0.45));
      col.addColorStop(1, hsl(hue, 100, 55, 0.02 + amp * 0.16));
      ctx.fillStyle = col;
      ctx.fillRect(x + 0.5, columnTop, step - 1, columnH);
    }
  }

  ctx.beginPath();
  ctx.moveTo(0, keyTop + 0.5);
  ctx.lineTo(w, keyTop + 0.5);
  ctx.strokeStyle = hsl(hue, 70, 70, 0.35 + amp * 0.4);
  ctx.stroke();

  ctx.font = "500 10px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const labelAll = step >= 20;
  for (let i = 0; i < SEMITONES; i++) {
    const pc = (48 + i) % 12;
    const isC = pc === 0;
    const natural = !isBlackKey(i);
    if (!isC && !(labelAll && natural)) continue;
    ctx.fillStyle = hsl(hueForX((i + 0.5) / SEMITONES), 70, 72, isC ? 0.9 : 0.55);
    const text = isC || step >= 28 ? noteLabel(i) : noteLabel(i).replace(/[0-9]/g, "");
    ctx.fillText(text, i * step + step / 2, keyTop - 4);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = hsl(hueForX(1), 70, 72, 0.9);
  ctx.fillText("C6", w - 4, keyTop - 4);

  if (!present) return;

  const px = nx * w;
  const py = ny * h;
  ctx.strokeStyle = hsl(hue, 100, 70, 0.35 + amp * 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(Math.round(px) + 0.5, 0);
  ctx.lineTo(Math.round(px) + 0.5, h);
  ctx.moveTo(0, Math.round(py) + 0.5);
  ctx.lineTo(w, Math.round(py) + 0.5);
  ctx.stroke();

  const r = 4 + amp * 11;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = hsl(hue, 100, 74, 0.95);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px, py, r + 6 + amp * 8, 0, Math.PI * 2);
  ctx.strokeStyle = hsl(hue, 100, 70, 0.35 + amp * 0.4);
  ctx.stroke();
}

export function drawScope(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: Uint8Array | null,
  hue: number,
  amp: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  const mid = h / 2;
  if (!data) {
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
  } else {
    const n = data.length;
    const stride = Math.max(1, Math.floor(n / w));
    for (let x = 0; x < w; x++) {
      const i = Math.min(n - 1, x * stride);
      const sample = (data[i] - 128) / 128;
      const y = mid - sample * (h * 0.42);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = hsl(hue, 90, 64, 0.45 + amp * 0.55);
  ctx.lineWidth = 1.25;
  ctx.stroke();
}
