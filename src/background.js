import { CONFIG } from './config.js';

const W = CONFIG.WIDTH;
const H = CONFIG.HEIGHT;
const BG = CONFIG.BACKGROUND;

export class Background {
  constructor(p) {
    this.p = p;
    this.elapsed = 0;
    this.t = 0;

    // Sky keyframes: { t, zen: p5.Color, hor: p5.Color }
    // t is distributed unevenly — more time in stable phases, briefer transitions
    this._keyframes = [
      { t: 0.00, zen: p.color(5,   5,  25), hor: p.color( 12,  12,  45) }, // deep night
      { t: 0.10, zen: p.color(8,   8,  35), hor: p.color( 18,  15,  55) }, // late night
      { t: 0.18, zen: p.color(18, 15,  65), hor: p.color( 55,  30,  85) }, // predawn
      { t: 0.24, zen: p.color(35, 45, 130), hor: p.color(255, 130,  55) }, // sunrise
      { t: 0.30, zen: p.color(80,140, 215), hor: p.color(200, 225, 255) }, // early morning
      { t: 0.45, zen: p.color(100,175,255), hor: p.color(165, 215, 255) }, // noon
      { t: 0.58, zen: p.color(85, 155,235), hor: p.color(185, 225, 255) }, // afternoon
      { t: 0.68, zen: p.color(60,  90,180), hor: p.color(255, 175,  90) }, // golden hour
      { t: 0.74, zen: p.color(38,  28, 95), hor: p.color(255,  95,  38) }, // sunset
      { t: 0.80, zen: p.color(18,  12, 65), hor: p.color(110,  50,  90) }, // dusk
      { t: 0.88, zen: p.color(8,    8, 40), hor: p.color( 30,  20,  70) }, // blue hour
      { t: 1.00, zen: p.color(5,    5, 25), hor: p.color( 12,  12,  45) }, // deep night
    ];

    // 80 fixed star positions (upper 75% of sky, above mountains)
    this._stars = Array.from({ length: 80 }, () => ({
      x: p.random(W),
      y: p.random(H * 0.02, H * 0.58),
      r: p.random(0.5, 1.8),
    }));

    // Mountain peak arrays in pixel coordinates (far → mid → near)
    this._farPeaks  = BG.FAR_MOUNTAINS.map(pt => ({ x: pt.x * W, y: pt.y * H }));
    this._midPeaks  = BG.MID_MOUNTAINS.map(pt => ({ x: pt.x * W, y: pt.y * H }));
    this._nearPeaks = BG.NEAR_MOUNTAINS.map(pt => ({ x: pt.x * W, y: pt.y * H }));

    // Clouds spread across the canvas
    this._clouds = Array.from({ length: BG.CLOUD_COUNT }, (_, i) => ({
      x:     (i / BG.CLOUD_COUNT) * W + p.random(W * 0.05),
      y:     p.random(H * 0.05, H * 0.38),
      size:  p.random(W * 0.08, W * 0.18),
      speed: p.random(0.8, 1.2),
    }));
  }

  update(dt) {
    this.elapsed = (this.elapsed + dt) % BG.CYCLE_DURATION_MS;
    this.t = this.elapsed / BG.CYCLE_DURATION_MS;

    // Scroll clouds
    for (const c of this._clouds) {
      c.x -= BG.CLOUD_SCROLL_SPEED * c.speed * dt;
      if (c.x + c.size * 2 < 0) c.x = W + c.size * 2;
    }
  }

  draw() {
    const { zenith, horizon } = this._getSkyColors();
    // Compute warmth/darkness once per frame and pass through
    const w = this._warmth();
    const d = this._darkness();
    this._drawSkyGradient(zenith, horizon);
    this._drawStars();
    this._drawSun();
    this._drawMountainLayer(this._farPeaks,  this._getFarMountainColor(w, d));
    this._drawMountainLayer(this._midPeaks,  this._getMidMountainColor(w, d));
    this._drawMountainLayer(this._nearPeaks, this._getNearMountainColor(w, d));
    this._drawClouds(w, d);
  }

  // Called by Game after pipe.draw() so pipes appear planted in the ground.
  drawGround() { this._drawGround(); }

  // ─── Private ─────────────────────────────────────────────────────────────

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
    // Use native Canvas2D gradient — 1 draw call instead of 650 stroke+line pairs
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

    // Stars visible during night: fade in at dusk (0.80), full at blue hour (0.88)
    // fade out at predawn (0.18), gone by sunrise (0.24)
    let alpha = 0;
    if (t >= 0.88 || t <= 0.18) {
      alpha = 255;
    } else if (t > 0.80 && t < 0.88) {
      alpha = p.map(t, 0.80, 0.88, 0, 255);
    } else if (t > 0.18 && t < 0.24) {
      alpha = p.map(t, 0.18, 0.24, 255, 0);
    }

    if (alpha <= 0) return;
    p.noStroke();
    for (const s of this._stars) {
      p.fill(255, 255, 240, alpha * (0.5 + 0.5 * (s.r / 1.8)));
      p.circle(s.x, s.y, s.r * 2);
    }
  }

  _drawSun() {
    const p = this.p;
    const t = this.t;
    if (t < 0.22 || t > 0.80) return;

    const u = (t - 0.22) / 0.58;                             // 0 = rising, 1 = set
    const sinArc = Math.sin(u * Math.PI);
    const sunX = p.lerp(-20, W + 20, u);
    const sunY = p.lerp(H * 0.60, H * 0.06, sinArc);
    const sunR = 22;
    // Horizon color: deep orange-red. Midday: near-white with warm tint.
    const horizonCol = p.color(255, 90, 20);
    const middayCol  = p.color(255, 252, 220);
    const sunCol = p.lerpColor(horizonCol, middayCol, sinArc);

    // Haze rings — larger and softer at midday, tighter and warmer at horizon
    const hazeScale = p.lerp(2.0, 5.5, sinArc);   // compact at horizon, wide haze at noon
    const hazeAlpha = p.lerp(55,  18,  sinArc);    // more opaque glow at horizon
    p.noStroke();
    p.fill(p.red(sunCol), p.green(sunCol), p.blue(sunCol), hazeAlpha * 0.30);
    p.circle(sunX, sunY, sunR * hazeScale * 2);
    p.fill(p.red(sunCol), p.green(sunCol), p.blue(sunCol), hazeAlpha * 0.55);
    p.circle(sunX, sunY, sunR * hazeScale * 1.3);
    p.fill(p.red(sunCol), p.green(sunCol), p.blue(sunCol), hazeAlpha);
    p.circle(sunX, sunY, sunR * hazeScale * 0.7);

    // Sun disc — bright white-yellow at noon, orange-red at horizon
    p.fill(sunCol);
    p.circle(sunX, sunY, sunR * 2);
  }

  _drawMountainLayer(peaks, col) {
    const p = this.p;
    p.fill(col);
    p.noStroke();
    p.beginShape();
    p.curveVertex(0, H);                       // phantom anchor
    p.curveVertex(0, H);                       // bottom-left
    for (const pt of peaks) p.curveVertex(pt.x, pt.y);
    p.curveVertex(W, H);                       // bottom-right
    p.curveVertex(W, H);                       // phantom anchor
    p.endShape(p.CLOSE);
  }

  _warmth() {
    const t = this.t;
    const w = Math.max(
      1 - Math.abs(t - 0.24) / 0.10,   // sunrise influence
      1 - Math.abs(t - 0.74) / 0.10    // sunset influence
    );
    return Math.min(1, Math.max(0, w));
  }

  _darkness() {
    // 0 = bright noon, 1 = deep night — derived from t proximity to night
    const t = this.t;
    const nightness = t >= 0.88 || t <= 0.10
      ? 1
      : t > 0.80 ? this.p.map(t, 0.80, 0.88, 0, 1)
      : t < 0.18 ? this.p.map(t, 0.10, 0.18, 1, 0)
      : 0;
    return nightness;
  }

  // Atmospheric perspective: far = pale/hazy (barely separates from sky),
  // mid = muted mid-tone, near = dark saturated silhouette.
  _getFarMountainColor(w, d) {
    const p = this.p;
    const day  = p.color(168, 188, 210);  // pale blue-gray atmospheric haze
    const warm = p.color(210, 155, 120);  // warm dusty rose at sunrise/sunset
    const night= p.color( 18,  16,  38);  // near-invisible at night
    return p.lerpColor(p.lerpColor(day, warm, w), night, d);
  }

  _getMidMountainColor(w, d) {
    const p = this.p;
    const day  = p.color( 72, 100,  80);  // muted sage green
    const warm = p.color(105,  68,  48);  // warm ochre/brown
    const night= p.color( 10,  10,  24);
    return p.lerpColor(p.lerpColor(day, warm, w), night, d);
  }

  _getNearMountainColor(w, d) {
    const p = this.p;
    const day  = p.color( 32,  52,  38);  // dark forest green
    const warm = p.color( 55,  32,  22);  // dark russet
    const night= p.color(  5,   5,  12);
    return p.lerpColor(p.lerpColor(day, warm, w), night, d);
  }

  _cloudTint(w, d) {
    const p = this.p;
    const white  = p.color(255, 255, 255, 230);
    const orange = p.color(255, 175, 110, 210);
    const dark   = p.color( 55,  55,  75, 180);
    return p.lerpColor(p.lerpColor(white, orange, w), dark, d);
  }

  _drawClouds(w, d) {
    const tint = this._cloudTint(w, d);
    for (const c of this._clouds) this._drawCloud(c.x, c.y, c.size, tint);
  }

  _drawGround() {
    const p = this.p;
    const gh = CONFIG.GROUND_HEIGHT;
    p.noStroke();
    p.rectMode(p.CORNER);
    // Dirt base
    p.fill(101, 72, 42);
    p.rect(0, H - gh, W, gh);
    // Grass cap
    p.fill(86, 175, 60);
    p.rect(0, H - gh, W, Math.ceil(gh * 0.38));
    p.rectMode(p.CENTER);
  }

  _drawCloud(cx, cy, size, col) {
    const p = this.p;
    p.noStroke();
    p.fill(col);
    p.ellipse(cx,                  cy,                  size,        size);
    p.ellipse(cx + 0.5 * size,     cy + 0.1  * size,    0.8 * size,  0.8 * size);
    p.ellipse(cx - 0.5 * size,     cy + 0.1  * size,    0.8 * size,  0.8 * size);
    p.ellipse(cx + 0.9 * size,     cy + 0.15 * size,    0.5 * size,  0.5 * size);
    p.ellipse(cx - 0.9 * size,     cy + 0.15 * size,    0.5 * size,  0.5 * size);
  }
}
