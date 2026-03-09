import { CONFIG } from './config.js';

export class Bird {
  constructor(p) {
    this.p = p;
    this.x = CONFIG.BIRD.X;
    this.y = 0;
    this.w = CONFIG.BIRD.WIDTH;
    this.h = CONFIG.BIRD.HEIGHT;
    this.vy = 0;
    this.frame = 0;
  }

  update(jumping) {
    this.frame++;
    if (jumping) this.vy = -CONFIG.BIRD.JUMP_FORCE;
    this.vy += CONFIG.BIRD.GRAVITY;
    this.vy = Math.min(this.vy, CONFIG.BIRD.MAX_FALL);
    this.y += this.vy;
  }

  draw() {
    const { p, x, y, w, h, vy, frame } = this;
    const scared    = vy > 5;
    const straining = vy < -1;

    // Wing cadence depends on state
    const wingFreq = straining ? 0.55 : scared ? 0.08 : 0.22;
    const wingAmp  = straining ? 10   : scared ? 3    : 5;
    const flapY    = Math.sin(frame * wingFreq) * wingAmp;

    // Tilt: nose up when rising, nose down when falling
    const tilt = p.constrain(
      p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -0.42, 1.25),
      -0.42, 1.25
    );

    p.push();
    p.translate(x, y);
    p.rotate(tilt);
    p.noStroke();

    // ── Wing (behind body) ────────────────────────────────────────────────
    p.fill(255, 255, 255, 220);
    p.ellipse(-w * 0.35, flapY, w * 0.5, h * 0.4);

    // ── Body ──────────────────────────────────────────────────────────────
    p.fill(255, 235, 20);
    p.ellipse(0, 0, w, h);

    // Belly sheen
    p.fill(255, 248, 130, 80);
    p.ellipse(w * 0.08, h * 0.1, w * 0.55, h * 0.45);

    if (scared) {
      // ── SCARED: wide eyes, open beak ────────────────────────────────────

      // Eye white — big
      p.fill(255);
      p.ellipse(w * 0.28, -w * 0.16, w * 0.48, h * 0.58);

      // Pupil — large, centered
      p.fill(20, 20, 30);
      p.ellipse(w * 0.30, -w * 0.14, w * 0.20, h * 0.32);

      // Pupil highlight
      p.fill(255);
      p.ellipse(w * 0.35, -w * 0.20, w * 0.07, w * 0.07);

      // Mouth interior (dark gap)
      p.fill(160, 60, 10);
      p.ellipse(w * 0.46, h * 0.16, w * 0.32, h * 0.12);

      // Upper beak (tilts up slightly)
      p.fill(250, 130, 10);
      p.ellipse(w * 0.46, h * 0.06, w * 0.38, h * 0.13);

      // Lower beak (drops down with gap)
      p.fill(230, 110, 5);
      p.ellipse(w * 0.44, h * 0.26, w * 0.28, h * 0.13);

    } else if (straining) {
      // ── STRAINING: squinted eyes, clenched beak ──────────────────────────

      // Squinted eye — just a thin dark crescent
      p.fill(30, 20, 10);
      p.ellipse(w * 0.30, -w * 0.18, w * 0.34, h * 0.045);

      // Tiny white glint above squint
      p.fill(255, 255, 255, 160);
      p.ellipse(w * 0.36, -w * 0.22, w * 0.07, w * 0.04);

      // Clenched beak — tight together
      p.fill(250, 130, 10);
      p.ellipse(w * 0.46, h * 0.08, w * 0.36, h * 0.12);
      p.fill(230, 110, 5);
      p.ellipse(w * 0.45, h * 0.17, w * 0.28, h * 0.10);

    } else {
      // ── NEUTRAL ──────────────────────────────────────────────────────────

      // Eye white
      p.fill(255);
      p.ellipse(w * 0.28, -w * 0.18, w * 0.40, h * 0.50);

      // Pupil
      p.fill(20, 20, 30);
      p.ellipse(w * 0.34, -w * 0.22, w * 0.10, h * 0.22);

      // Pupil highlight
      p.fill(255);
      p.ellipse(w * 0.38, -w * 0.27, w * 0.05, w * 0.05);

      // Beak — two ellipses, closed
      p.fill(250, 130, 10);
      p.ellipse(w * 0.46, h * 0.08, w * 0.38, h * 0.13);
      p.fill(230, 110, 5);
      p.ellipse(w * 0.44, h * 0.19, w * 0.28, h * 0.12);
    }

    p.pop();
  }

  accelerateFall() {
    this.vy += 5;
  }

  isOutOfBounds() {
    return this.y > CONFIG.HEIGHT - this.h / 2;
  }

  reset() {
    this.y = 0;
    this.vy = 0;
    this.frame = 0;
  }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
