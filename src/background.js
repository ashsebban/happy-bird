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

    // ── Mountain layers — smooth curveVertex, fewer & bigger peaks ─────────────

    // Layer 1: Distant snow mountains — 3 graceful peaks, very pale/hazy
    this._farPeaks = [
      [0.00, 0.68], [0.15, 0.46], [0.32, 0.60], [0.50, 0.42],
      [0.68, 0.56], [0.84, 0.45], [1.00, 0.66],
    ].map(([x, y]) => [x * W, y * H]);

    // Layer 2: Mid mountains — 4 peaks, medium height
    this._midPeaks = [
      [0.00, 0.76], [0.11, 0.63], [0.25, 0.71], [0.40, 0.59],
      [0.55, 0.69], [0.70, 0.60], [0.85, 0.70], [1.00, 0.75],
    ].map(([x, y]) => [x * W, y * H]);

    // Layer 3: Near forested hills — smooth rolling, pine trees along ridge
    this._nearHills = [
      [0.00, 0.82], [0.18, 0.72], [0.38, 0.79], [0.58, 0.70],
      [0.78, 0.78], [1.00, 0.82],
    ].map(([x, y]) => [x * W, y * H]);

    // Layer 4: Foreground meadow — very gentle undulation
    this._fgHills = [
      [0.00, 0.88], [0.24, 0.83], [0.52, 0.87], [0.78, 0.83], [1.00, 0.88],
    ].map(([x, y]) => [x * W, y * H]);

    // Pine trees sparsely placed along near-hill ridge
    this._trees = this._genTrees();

    this._clouds = Array.from({ length: BG.CLOUD_COUNT }, (_, i) => ({
      x:     (i / BG.CLOUD_COUNT) * W + p.random(W * 0.05),
      y:     p.random(H * 0.05, H * 0.38),
      size:  p.random(W * 0.08, W * 0.18),
      speed: p.random(0.8, 1.2),
    }));
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

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
    this._drawMoon(d);
    this._drawSun();
    this._drawLayer(this._farPeaks,  this._colFar(w, d));
    this._drawSnowCaps(d);
    this._drawLayer(this._midPeaks,  this._colMid(w, d));
    this._drawLayer(this._nearHills, this._colNear(w, d));
    this._drawTrees(w, d);
    this._drawLayer(this._fgHills,   this._colFg(w, d));
    this._drawClouds(w, d);
  }

  drawGround() { this._drawGround(); }

  // ── Sky ──────────────────────────────────────────────────────────────────────

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
    if (t >= 0.88 || t <= 0.18)      alpha = 255;
    else if (t > 0.80 && t < 0.88)   alpha = p.map(t, 0.80, 0.88, 0, 255);
    else if (t > 0.18 && t < 0.24)   alpha = p.map(t, 0.18, 0.24, 255, 0);
    if (alpha <= 0) return;
    p.noStroke();
    for (const s of this._stars) {
      p.fill(255, 255, 240, alpha * (0.5 + 0.5 * (s.r / 1.8)));
      p.circle(s.x, s.y, s.r * 2);
    }
  }

  _drawMoon(d) {
    if (d < 0.3) return;
    const p = this.p;
    const ctx = p.drawingContext;
    const alpha = p.map(d, 0.3, 1.0, 0, 1);
    const mx = W * 0.80;
    const my = H * 0.14;
    const mr = 11;

    // Soft glow
    const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 4);
    glow.addColorStop(0, `rgba(220,230,255,${(alpha * 0.18).toFixed(2)})`);
    glow.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx, my, mr * 4, 0, Math.PI * 2);
    ctx.fill();

    // Moon disc
    p.noStroke();
    p.fill(235, 242, 255, alpha * 240);
    p.circle(mx, my, mr * 2);
    // Subtle shadow to give it a crescent feel
    p.fill(18, 16, 45, alpha * 120);
    p.circle(mx + mr * 0.35, my - mr * 0.2, mr * 1.55);
  }

  _drawSun() {
    const p = this.p;
    const ctx = p.drawingContext;
    const t = this.t;
    if (t < 0.22 || t > 0.80) return;

    const u      = (t - 0.22) / 0.58;
    const sinArc = Math.sin(u * Math.PI);
    const sunX   = p.lerp(-20, W + 20, u);
    const sunY   = p.lerp(H * 0.62, H * 0.07, sinArc);
    const sunR   = 8;

    const redCol    = p.color(255,  38,   5);
    const orangeCol = p.color(255, 140,  20);
    const yellowCol = p.color(255, 228,  60);
    const whiteCol  = p.color(255, 255, 238);

    let sunCol;
    if (sinArc < 0.10)      sunCol = p.lerpColor(redCol,    orangeCol, sinArc / 0.10);
    else if (sinArc < 0.28) sunCol = p.lerpColor(orangeCol, yellowCol, (sinArc - 0.10) / 0.18);
    else                    sunCol = p.lerpColor(yellowCol,  whiteCol,  Math.min(1, (sinArc - 0.28) / 0.22));

    const sr = Math.round(p.red(sunCol));
    const sg = Math.round(p.green(sunCol));
    const sb = Math.round(p.blue(sunCol));

    const skyAlpha0 = p.lerp(0.28, 0.13, sinArc);
    const skyGrad   = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, Math.max(W, H) * 1.1);
    skyGrad.addColorStop(0,    `rgba(${sr},${sg},${sb},${skyAlpha0.toFixed(2)})`);
    skyGrad.addColorStop(0.25, `rgba(${sr},${sg},${sb},${(skyAlpha0 * 0.35).toFixed(2)})`);
    skyGrad.addColorStop(1,    `rgba(${sr},${sg},${sb},0)`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    const corona = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 5);
    corona.addColorStop(0, `rgba(${sr},${sg},${sb},0.90)`);
    corona.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 5, 0, Math.PI * 2);
    ctx.fill();

    p.noStroke();
    p.fill(sunCol);
    p.circle(sunX, sunY, sunR * 2);
    p.fill(255, 255, 255, 210);
    p.circle(sunX - sunR * 0.18, sunY - sunR * 0.22, sunR * 0.75);
  }

  // ── Mountains ────────────────────────────────────────────────────────────────

  // Smooth organic silhouette using curveVertex
  _drawLayer(pts, col) {
    const p = this.p;
    p.fill(col);
    p.noStroke();
    p.beginShape();
    p.curveVertex(pts[0][0], H);          // anchor bottom-left
    p.curveVertex(pts[0][0], pts[0][1]);  // first real point (doubled as anchor)
    for (const [x, y] of pts) p.curveVertex(x, y);
    p.curveVertex(pts[pts.length - 1][0], pts[pts.length - 1][1]); // last point doubled
    p.curveVertex(pts[pts.length - 1][0], H); // anchor bottom-right
    p.endShape(p.CLOSE);
  }

  // Narrow snow caps — only on the tallest peaks, no flying saucers
  _drawSnowCaps(d) {
    const p = this.p;
    const snowAlpha = p.lerp(220, 170, d); // stays bright at night — needs contrast
    p.noStroke();
    const pts = this._farPeaks;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y]  = pts[i];
      const prevY   = pts[i - 1][1];
      const nextY   = pts[i + 1][1];
      if (y < prevY && y < nextY) {
        const capH = (Math.min(prevY, nextY) - y) * 0.26; // slightly taller
        if (capH < 8) continue;
        p.fill(238, 245, 255, snowAlpha);
        // Half-width = 0.36 × height → tall pointed triangle, not a saucer
        p.triangle(x, y, x - capH * 0.36, y + capH, x + capH * 0.36, y + capH);
      }
    }
  }

  // Sparse pine trees along near-hill ridge — taller, thinner, elegant
  _genTrees() {
    const p = this.p;
    const trees = [];
    let x = p.random(12, 24);
    while (x < W - 10) {
      const y = this._hillY(this._nearHills, x);
      trees.push({ x, y, h: p.random(18, 28), tw: p.random(5, 8) });
      x += p.random(18, 32);
    }
    return trees;
  }

  _drawTrees(w, d) {
    const p = this.p;
    const base = this._colNear(w, d);
    const cr = Math.max(0, p.red(base)   - 12);
    const cg = Math.max(0, p.green(base) - 18);
    const cb = Math.max(0, p.blue(base)  - 5);
    p.noStroke();
    p.fill(cr, cg, cb);
    for (const { x, y, h, tw } of this._trees) {
      p.triangle(x, y - h,        x - tw * 0.38, y - h * 0.38, x + tw * 0.38, y - h * 0.38);
      p.triangle(x, y - h * 0.52, x - tw * 0.55, y,            x + tw * 0.55, y);
    }
  }

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
    if (t >= 0.88 || t <= 0.10) return 1;
    if (t > 0.80) return this.p.map(t, 0.80, 0.88, 0, 1);
    if (t < 0.18) return this.p.map(t, 0.10, 0.18, 1, 0);
    return 0;
  }

  // ── Layer colors — distinct at every time of day ──────────────────────────────

  _colFar(w, d) {
    const p = this.p;
    // Day: pale steel-blue haze  Warm: dusty rose  Night: soft indigo (brighter than mid)
    return p.lerpColor(
      p.lerpColor(p.color(158, 180, 210), p.color(192, 148, 118), w),
      p.color(24, 20, 45), d,
    );
  }

  _colMid(w, d) {
    const p = this.p;
    // Day: medium slate-blue  Warm: warm umber  Night: dark navy
    return p.lerpColor(
      p.lerpColor(p.color(68, 92, 125), p.color(98, 65, 50), w),
      p.color(12, 12, 26), d,
    );
  }

  _colNear(w, d) {
    const p = this.p;
    // Day: dark forest green  Warm: deep russet  Night: near-black green-tinted
    return p.lerpColor(
      p.lerpColor(p.color(32, 62, 40), p.color(52, 34, 22), w),
      p.color(5, 7, 12), d,
    );
  }

  _colFg(w, d) {
    const p = this.p;
    // Slightly lighter/warmer than near to separate the foreground plane
    return p.lerpColor(
      p.lerpColor(p.color(50, 88, 48), p.color(68, 44, 24), w),
      p.color(7, 9, 14), d,
    );
  }

  // ── Clouds ────────────────────────────────────────────────────────────────────

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
    p.ellipse(cx,              cy,               size,       size);
    p.ellipse(cx + 0.5 * size, cy + 0.1 * size,  0.8 * size, 0.8 * size);
    p.ellipse(cx - 0.5 * size, cy + 0.1 * size,  0.8 * size, 0.8 * size);
    p.ellipse(cx + 0.9 * size, cy + 0.15 * size, 0.5 * size, 0.5 * size);
    p.ellipse(cx - 0.9 * size, cy + 0.15 * size, 0.5 * size, 0.5 * size);
  }

  // ── Ground ────────────────────────────────────────────────────────────────────

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
