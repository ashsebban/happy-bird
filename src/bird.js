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
    this.wingPhase = 0;
  }

  update(jumping) {
    this.frame++;
    if (jumping) this.vy = -CONFIG.BIRD.JUMP_FORCE;
    this.vy += CONFIG.BIRD.GRAVITY;
    this.vy = Math.min(this.vy, CONFIG.BIRD.MAX_FALL);
    this.y += this.vy;
    const freq = this.p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, 0.25, 0.08);
    this.wingPhase += freq;
  }

  draw() {
    const { p, x, y, w, vy } = this;
    const br = w / 2;

    const tilt = p.constrain(
      p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -0.28, 0.52),
      -0.28, 0.52
    );

    p.push();
    p.translate(x, y);
    p.rotate(tilt);
    p.noStroke();

    // ── 1 OVAL WING — below horizontal center, extends backward ───────────────
    const wAngle = Math.sin(this.wingPhase) *
      p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, 0.42, 0.10);

    p.push();
      p.translate(0, br * 0.18);
      p.rotate(wAngle);
      p.fill(58, 130, 152);
      p.ellipse(-br * 0.12, 0, br * 1.30, br * 0.48);
    p.pop();
    p.push();
      p.translate(0, br * 0.18);
      p.rotate(wAngle);
      p.fill(79, 163, 181);
      p.ellipse(-br * 0.10, -br * 0.04, br * 1.12, br * 0.36);
    p.pop();

    // ── 2 SMALL OVAL FEET — angled backward to read as flight ─────────────────
    const fShift = p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, br * 0.10, -br * 0.10);
    p.fill(240, 172, 60);
    p.ellipse(-br * 0.14 + fShift, br * 0.90, br * 0.36, br * 0.50);
    p.ellipse( br * 0.14 + fShift, br * 0.90, br * 0.36, br * 0.50);

    // ── 1 CIRCLE BODY ─────────────────────────────────────────────────────────
    p.fill(102, 183, 200);
    p.circle(0, 0, w);

    // ── 1 TRIANGLE BEAK — large, directly in front of eye ─────────────────────
    // Base flush with front body edge; tip extends well past it
    p.fill(242, 162, 28);
    p.triangle(
      br * 0.82, -br * 0.18,   // base top
      br * 0.82,  br * 0.30,   // base bottom
      br * 1.30,  br * 0.06    // tip
    );

    // ── 1 SMALL CIRCLE EYE — 70% toward front, above beak ────────────────────
    // diameter = 40% of br (20% of body diameter — beak dominates, not eye)
    const eX = br * 0.55;
    const eY = -br * 0.26;
    const eD = br * 0.42;

    p.fill(255);
    p.circle(eX, eY, eD);

    p.fill(20, 12, 8);
    p.circle(eX + br * 0.03, eY + br * 0.02, eD * 0.62);

    p.fill(255);
    p.circle(eX + br * 0.07, eY - br * 0.07, eD * 0.26);

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
    this.wingPhase = 0;
  }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
