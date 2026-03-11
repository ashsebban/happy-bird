import { CONFIG } from './config.js';

const W = CONFIG.WIDTH;
const H = CONFIG.HEIGHT;
const BG = CONFIG.BACKGROUND;

export class Background {
  constructor(p) {
    this.p = p;
    this.elapsed = 0;
    this.t = 0;

    this._keyframes = [
      { t: 0.00, zen: p.color(5,   5,  25), hor: p.color( 12,  12,  45) },
      { t: 0.10, zen: p.color(8,   8,  35), hor: p.color( 18,  15,  55) },
      { t: 0.18, zen: p.color(18, 15,  65), hor: p.color( 55,  30,  85) },
      { t: 0.24, zen: p.color(35, 45, 130), hor: p.color(255, 130,  55) },
      { t: 0.30, zen: p.color(80,140, 215), hor: p.color(200, 225, 255) },
      { t: 0.45, zen: p.color(100,175,255), hor: p.color(165, 215, 255) },
      { t: 0.58, zen: p.color(85, 155,235), hor: p.color(185, 225, 255) },
      { t: 0.68, zen: p.color(60,  90,180), hor: p.color(255, 175,  90) },
      { t: 0.74, zen: p.color(38,  28, 95), hor: p.color(255,  95,  38) },
      { t: 0.80, zen: p.color(18,  12, 65), hor: p.color(110,  50,  90) },
      { t: 0.88, zen: p.color(8,    8, 40), hor: p.color( 30,  20,  70) },
      { t: 1.00, zen: p.color(5,    5, 25), hor: p.color( 12,  12,  45) },
    ];

    this._stars = Array.from({ length: 80 }, () => ({
      x: p.random(W),
      y: p.random(H * 0.02, H * 0.55),
      r: p.random(0.5, 1.8),
    }));

    // ── Mountain layers (back → front), sharp vertex() peaks ──────────────────
    // Layer 1: Distant snow-capped alpine range — very tall, jagged
    this._snowPeaks = [
      [0.00, 0.72], [0.05, 0.52], [0.10, 0.63], [0.16, 0.41],
      [0.21, 0.55], [0.27, 0.44], [0.33, 0.59], [0.40, 0.37],
      [0.46, 0.51], [0.52, 0.43], [0.58, 0.55], [0.65, 0.45],
      [0.71, 0.57], [0.78, 0.47], [0.84, 0.61], [0.91, 0.49], [1.00, 0.70],
    ].map(([x, y]) => [x * W, y * H]);

    // Layer 2: Mid-range mountains — medium height, slightly less sharp
    this._midPeaks = [
      [0.00, 0.77], [0.08, 0.61], [0.15, 0.71], [0.23, 0.57],
      [0.31, 0.67], [0.39, 0.58], [0.47, 0.69], [0.55, 0.56],
      [0.63, 0.67], [0.71, 0.59], [0.79, 0.69], [0.87, 0.61],
      [0.94, 0.71], [1.00, 0.75],
    ].map(([x, y]) => [x * W, y * H]);

    // Layer 3: Dark forested hills — lower, rolling, tree line lives here
    this._nearHills = [
      [0.00, 0.81], [0.09, 0.71], [0.20, 0.77], [0.32, 0.67],
      [0.44, 0.75], [0.57, 0.69], [0.69, 0.77], [0.81, 0.71],
      [0.91, 0.79], [1.00, 0.81],
    ].map(([x, y]) => [x * W, y * H]);

    // Layer 4: Foreground rolling meadow — gently undulating just above ground
    this._fgHills = [
      [0.00, 0.88], [0.14, 0.83], [0.32, 0.87], [0.52, 0.82],
      [0.72, 0.86], [0.88, 0.83], [1.00, 0.87],
    ].map(([x, y]) => [x * W, y * H]);

    // Pine trees scattered along the near hill ridge
    this._trees = this._genTrees();

    this._clouds = Array.from({ length: BG.CLOUD_COUNT }, (_, i) => ({
      x:     (i / BG.CLOUD_COUNT) * W + p.random(W * 0.05),
      y:     p.random(H * 0.05, H * 0.38),
      size:  p.random(W * 0.08, W * 0.18),
      speed: p.random(0.8, 1.2),
    }));
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  update(dt) {
    this.elapsed = (this.elapsed + dt) % BG.CYCLE_DURATION_MS;
    this.t = this.elapsed / BG.CYCLE_DURATION_MS;
    for (const c of this._clouds) {
      c.x -= BG.CLOUD_SCROLL_SPEED * c.speed * dt;
      if (c.x + c.size * 2 < 0) c.x = W + c.size * 2;
    }
  }

  draw() {
    const { zenith, horizon } = this._getSkyColors();
    const w = this._warmth();
    const d = this._darkness();
    this._drawSkyGradient(zenith, horizon);
    this._drawStars();
    this._drawSun();
    this._drawLayer(this._snowPeaks, this._colSnow(w, d));
    this._drawSnowCaps(d);
    this._drawLayer(this._midPeaks,  this._colMid(w, d));
    this._drawLayer(this._nearHills, this._colNear(w, d));
    this._drawTrees(w, d);
    this._drawLayer(this._fgHills,   this._colFg(w, d));
    this._drawClouds(w, d);
  }

  // Called by Game after pipe.draw() so pipes appear planted in the ground.
  drawGround() { this._drawGround(); }

  // ── Sky ─────────────────────────────────────────────────────────────────────

  _getSkyColors() {
    const t = this.t;
    const kf = this._keyframes;
    let i = 0;
    while (i < kf.length - 2 && kf[i + 1].t <= t) i++;
    const a = kf[i], b = kf[i + 1];
    const u = (t - a.t) / (b.t - a.t);
    return {
      zenith:  this.p.lerpColor(a.zen, b.zen, u),
      horizon: this.p.lerpColor(a.hor, b.hor, u),
    };
  }

  _drawSkyGradient(zenith, horizon) {
    const p = this.p;
    const ctx = p.drawingContext;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgb(${p.red(zenith)},${p.green(zenith)},${p.blue(zenith)})`);
    grad.addColorStop(1, `rgb(${p.red(horizon)},${p.green(horizon)},${p.blue(horizon)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  _drawStars() {
    const p = this.p;
    const t = this.t;
    let alpha = 0;
    if (t >= 0.88 || t <= 0.18)        alpha = 255;
    else if (t > 0.80 && t < 0.88)     alpha = p.map(t, 0.80, 0.88, 0, 255);
    else if (t > 0.18 && t < 0.24)     alpha = p.map(t, 0.18, 0.24, 255, 0);
    if (alpha <= 0) return;
    p.noStroke();
    for (const s of this._stars) {
      p.fill(255, 255, 240, alpha * (0.5 + 0.5 * (s.r / 1.8)));
      p.circle(s.x, s.y, s.r * 2);
    }
  }

  _drawSun() {
    const p = this.p;
    const ctx = p.drawingContext;
    const t = this.t;
    if (t < 0.22 || t > 0.80) return;

    const u       = (t - 0.22) / 0.58;
    const sinArc  = Math.sin(u * Math.PI);
    const sunX    = p.lerp(-20, W + 20, u);
    const sunY    = p.lerp(H * 0.62, H * 0.07, sinArc);
    const sunR    = 8;

    const redCol    = p.color(255,  38,   5);
    const orangeCol = p.color(255, 140,  20);
    const yellowCol = p.color(255, 228,  60);
    const whiteCol  = p.color(255, 255, 238);

    let sunCol;
    if (sinArc < 0.10)      sunCol = p.lerpColor(redCol, orangeCol, sinArc / 0.10);
    else if (sinArc < 0.28) sunCol = p.lerpColor(orangeCol, yellowCol, (sinArc - 0.10) / 0.18);
    else                    sunCol = p.lerpColor(yellowCol, whiteCol, Math.min(1, (sinArc - 0.28) / 0.22));

    const sr = Math.round(p.red(sunCol));
    const sg = Math.round(p.green(sunCol));
    const sb = Math.round(p.blue(sunCol));

    const skyGlowR  = Math.max(W, H) * 1.1;
    const skyAlpha0 = p.lerp(0.28, 0.13, sinArc);
    const skyGrad   = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, skyGlowR);
    skyGrad.addColorStop(0,    `rgba(${sr},${sg},${sb},${skyAlpha0.toFixed(2)})`);
    skyGrad.addColorStop(0.25, `rgba(${sr},${sg},${sb},${(skyAlpha0 * 0.35).toFixed(2)})`);
    skyGrad.addColorStop(1,    `rgba(${sr},${sg},${sb},0)`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    const coronaGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 5);
    coronaGrad.addColorStop(0, `rgba(${sr},${sg},${sb},0.90)`);
    coronaGrad.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 5, 0, Math.PI * 2);
    ctx.fill();

    p.noStroke();
    p.fill(sunCol);
    p.circle(sunX, sunY, sunR * 2);
    p.fill(255, 255, 255, 210);
    p.circle(sunX - sunR * 0.18, sunY - sunR * 0.22, sunR * 0.75);
  }

  // ── Mountains ───────────────────────────────────────────────────────────────

  // Sharp angular silhouette using vertex() — no smooth curves
  _drawLayer(pts, col) {
    const p = this.p;
    p.fill(col);
    p.noStroke();
    p.beginShape();
    p.vertex(0, H);
    for (const [x, y] of pts) p.vertex(x, y);
    p.vertex(W, H);
    p.endShape(p.CLOSE);
  }

  // White snow caps drawn on the peaks of the snow mountain layer
  _drawSnowCaps(d) {
    const p = this.p;
    const snowAlpha = p.lerp(200, 40, d);
    p.noStroke();
    const pts = this._snowPeaks;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i];
      const prevY = pts[i - 1][1];
      const nextY = pts[i + 1][1];
      if (y < prevY && y < nextY) {
        // Peak — draw a snow triangle sized by how prominent the peak is
        const capH = (Math.min(prevY, nextY) - y) * 0.30;
        p.fill(225, 235, 255, snowAlpha);
        p.triangle(x, y, x - capH * 1.1, y + capH, x + capH * 1.1, y + capH);
        // Bright highlight at the very tip
        p.fill(255, 255, 255, snowAlpha * 0.7);
        p.triangle(x, y, x - capH * 0.45, y + capH * 0.45, x + capH * 0.45, y + capH * 0.45);
      }
    }
  }

  // Pine trees as 2-tier triangle silhouettes along the near hill ridge
  _drawTrees(w, d) {
    const p = this.p;
    const base = this._colNear(w, d);
    // Slightly darker than the hill they sit on
    const cr = Math.max(0, p.red(base)   - 14);
    const cg = Math.max(0, p.green(base) - 20);
    const cb = Math.max(0, p.blue(base)  - 6);
    p.noStroke();
    p.fill(cr, cg, cb);
    for (const { x, y, h, tw } of this._trees) {
      // Upper (narrower) tier
      p.triangle(x, y - h,        x - tw * 0.40, y - h * 0.35, x + tw * 0.40, y - h * 0.35);
      // Lower (wider) tier
      p.triangle(x, y - h * 0.55, x - tw * 0.58, y,            x + tw * 0.58, y);
    }
  }

  // Pre-generate randomised tree positions along the near hill ridge
  _genTrees() {
    const p = this.p;
    const trees = [];
    let x = p.random(6, 16);
    while (x < W - 6) {
      const y = this._hillY(this._nearHills, x);
      trees.push({ x, y, h: p.random(13, 23), tw: p.random(7, 11) });
      x += p.random(10, 22);
    }
    return trees;
  }

  // Linear interpolation of y along a layer's ridge at a given x
  _hillY(pts, x) {
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i][0] && x <= pts[i + 1][0]) {
        const u = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + u * (pts[i + 1][1] - pts[i][1]);
      }
    }
    return pts[pts.length - 1][1];
  }

  // ── Time helpers ─────────────────────────────────────────────────────────────

  _warmth() {
    const t = this.t;
    return Math.min(1, Math.max(0, Math.max(
      1 - Math.abs(t - 0.24) / 0.10,
      1 - Math.abs(t - 0.74) / 0.10,
    )));
  }

  _darkness() {
    const t = this.t;
    if (t >= 0.88 || t <= 0.10)  return 1;
    if (t > 0.80)                return this.p.map(t, 0.80, 0.88, 0, 1);
    if (t < 0.18)                return this.p.map(t, 0.10, 0.18, 1, 0);
    return 0;
  }

  // ── Layer colors (atmospheric perspective: far = pale/hazy, near = saturated) ─

  _colSnow(w, d) {
    const p = this.p;
    // Day: pale steel-blue haze. Warm: dusty mauve. Night: near-invisible dark.
    return p.lerpColor(
      p.lerpColor(p.color(150, 172, 202), p.color(185, 142, 115), w),
      p.color(13, 12, 28), d,
    );
  }

  _colMid(w, d) {
    const p = this.p;
    // Day: muted slate-blue. Warm: warm umber. Night: dark navy.
    return p.lerpColor(
      p.lerpColor(p.color(62, 85, 116), p.color(92, 62, 48), w),
      p.color(8, 8, 19), d,
    );
  }

  _colNear(w, d) {
    const p = this.p;
    // Day: dark forest green. Warm: deep russet. Night: near-black.
    return p.lerpColor(
      p.lerpColor(p.color(30, 60, 38), p.color(50, 33, 20), w),
      p.color(4, 6, 10), d,
    );
  }

  _colFg(w, d) {
    const p = this.p;
    // Slightly lighter/warmer than near hills to separate the layers
    return p.lerpColor(
      p.lerpColor(p.color(44, 78, 44), p.color(62, 40, 22), w),
      p.color(6, 8, 13), d,
    );
  }

  // ── Clouds ───────────────────────────────────────────────────────────────────

  _drawClouds(w, d) {
    const p = this.p;
    const tint = p.lerpColor(
      p.lerpColor(p.color(255, 255, 255, 230), p.color(255, 175, 110, 210), w),
      p.color(55, 55, 75, 180), d,
    );
    for (const c of this._clouds) this._drawCloud(c.x, c.y, c.size, tint);
  }

  _drawCloud(cx, cy, size, col) {
    const p = this.p;
    p.noStroke();
    p.fill(col);
    p.ellipse(cx,                cy,               size,       size);
    p.ellipse(cx + 0.5 * size,   cy + 0.1 * size,  0.8 * size, 0.8 * size);
    p.ellipse(cx - 0.5 * size,   cy + 0.1 * size,  0.8 * size, 0.8 * size);
    p.ellipse(cx + 0.9 * size,   cy + 0.15 * size, 0.5 * size, 0.5 * size);
    p.ellipse(cx - 0.9 * size,   cy + 0.15 * size, 0.5 * size, 0.5 * size);
  }

  // ── Ground ───────────────────────────────────────────────────────────────────

  _drawGround() {
    const p = this.p;
    const gh = CONFIG.GROUND_HEIGHT;
    p.noStroke();
    p.rectMode(p.CORNER);
    p.fill(101, 72, 42);
    p.rect(0, H - gh, W, gh);
    p.fill(86, 175, 60);
    p.rect(0, H - gh, W, Math.ceil(gh * 0.38));
    p.rectMode(p.CENTER);
  }
}
