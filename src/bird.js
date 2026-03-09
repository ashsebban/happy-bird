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
    const { p, x, y, w, vy, frame } = this;
    const r = w / 2;   // r = 20

    const scared    = vy > 5;
    const straining = vy < -1;

    const tilt = p.constrain(
      p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -0.42, 1.25),
      -0.42, 1.25
    );

    const wingFreq = straining ? 0.52 : scared ? 0.07 : 0.20;
    const wingAmp  = straining ? 13   : scared ? 6    : 6;
    const flapY    = Math.sin(frame * wingFreq) * wingAmp;

    p.push();
    p.translate(x, y);
    p.rotate(tilt);
    p.noStroke();

    // ── Tail (behind everything) ───────────────────────────────────────────
    p.fill(200, 155, 10);
    p.triangle(-r*0.65, -r*0.08,  -r*0.68,  r*0.26,  -r*1.40,  r*0.06);
    p.fill(185, 140, 8);
    p.triangle(-r*0.60,  r*0.12,  -r*0.65,  r*0.44,  -r*1.30,  r*0.36);

    // ── Wing ──────────────────────────────────────────────────────────────
    p.fill(230, 185, 18);
    if (scared) {
      // Splayed wide — flailing in panic
      p.ellipse(-r*0.05, flapY - r*0.20, r*1.5, r*0.55);
    } else {
      p.ellipse(-r*0.12, flapY + r*0.08, r*1.2, r*0.50);
    }

    // ── Body ──────────────────────────────────────────────────────────────
    p.fill(255, 218, 22);
    p.circle(0, 0, w + 4);

    // Belly sheen
    p.fill(255, 248, 145, 85);
    p.ellipse(r*0.10, r*0.24, r*0.9, r*0.72);

    // ── Beak ─────────────────────────────────────────────────────────────
    // The beak is big and prominent — the main character feature

    if (scared) {
      // Open wide — screaming
      // Upper beak — angles up
      p.fill(255, 155, 18);
      p.triangle(
        r*0.42, -r*0.38,
        r*0.44,  r*0.04,
        r*1.62, -r*0.22
      );
      // Dark mouth interior
      p.fill(185, 65, 12);
      p.triangle(
        r*0.44,  r*0.04,
        r*0.44,  r*0.36,
        r*1.30,  r*0.14
      );
      // Lower beak — droops down
      p.fill(225, 120, 14);
      p.triangle(
        r*0.44,  r*0.36,
        r*0.44,  r*0.60,
        r*1.22,  r*0.44
      );

    } else {
      // Closed beak (neutral + straining)
      // Upper beak
      p.fill(255, 155, 18);
      p.triangle(
        r*0.42, -r*0.30,
        r*0.44,  r*0.06,
        r*1.60, -r*0.12
      );
      // Lower beak
      p.fill(220, 118, 12);
      p.triangle(
        r*0.44,  r*0.06,
        r*0.44,  r*0.30,
        r*1.48,  r*0.16
      );
    }

    // ── Eye ───────────────────────────────────────────────────────────────
    const ex = r*0.18;
    const ey = -r*0.22;

    if (straining) {
      // Squinted shut — CHORD arc = half-ellipse, flat edge at bottom
      p.fill(22, 15, 6);
      p.arc(ex, ey, r*1.0, r*0.68, Math.PI, 0, p.CHORD);

      // Effort wrinkle above
      p.stroke(175, 132, 8);
      p.strokeWeight(1.5);
      p.noFill();
      p.arc(ex, ey - r*0.48, r*0.60, r*0.28, Math.PI + 0.25, 0 - 0.25);
      p.noStroke();
      p.noFill();

      // Furrowed brow
      p.fill(172, 130, 8);
      p.beginShape();
        p.vertex(ex - r*0.36, ey - r*0.44);
        p.vertex(ex - r*0.04, ey - r*0.54);
        p.vertex(ex + r*0.30, ey - r*0.44);
        p.vertex(ex + r*0.26, ey - r*0.35);
        p.vertex(ex - r*0.04, ey - r*0.44);
        p.vertex(ex - r*0.32, ey - r*0.35);
      p.endShape(p.CLOSE);

    } else if (scared) {
      // Wide, panicked eye
      p.fill(255);
      p.circle(ex, ey, r*1.10);

      // Blue iris
      p.fill(60, 155, 225);
      p.circle(ex + r*0.04, ey + r*0.05, r*0.58);

      // Tiny terror pupil
      p.fill(10, 8, 8);
      p.circle(ex + r*0.04, ey + r*0.05, r*0.20);

      // Highlight
      p.fill(255);
      p.circle(ex + r*0.12, ey - r*0.04, r*0.10);

      // Eyebrows launched skyward
      p.fill(172, 130, 8);
      p.beginShape();
        p.vertex(ex - r*0.36, ey - r*0.60);
        p.vertex(ex - r*0.04, ey - r*0.74);
        p.vertex(ex + r*0.30, ey - r*0.60);
        p.vertex(ex + r*0.26, ey - r*0.50);
        p.vertex(ex - r*0.04, ey - r*0.62);
        p.vertex(ex - r*0.32, ey - r*0.50);
      p.endShape(p.CLOSE);

    } else {
      // Normal eye
      p.fill(255);
      p.circle(ex, ey, r*1.0);

      // Blue iris
      p.fill(60, 155, 225);
      p.circle(ex + r*0.03, ey, r*0.55);

      // Pupil
      p.fill(10, 8, 8);
      p.circle(ex + r*0.05, ey, r*0.26);

      // Highlight
      p.fill(255);
      p.circle(ex + r*0.12, ey - r*0.08, r*0.10);

      // Calm brow
      p.fill(172, 130, 8);
      p.beginShape();
        p.vertex(ex - r*0.36, ey - r*0.56);
        p.vertex(ex - r*0.04, ey - r*0.66);
        p.vertex(ex + r*0.30, ey - r*0.54);
        p.vertex(ex + r*0.26, ey - r*0.45);
        p.vertex(ex - r*0.04, ey - r*0.55);
        p.vertex(ex - r*0.32, ey - r*0.45);
      p.endShape(p.CLOSE);
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
