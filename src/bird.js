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
    const r = w / 2;                      // body radius = 20

    const scared    = vy > 5;
    const straining = vy < -1;

    const tilt = p.constrain(
      p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -0.42, 1.25),
      -0.42, 1.25
    );

    // Wing animation: fast + big when straining, limp when scared
    const wingFreq = straining ? 0.52 : scared ? 0.07 : 0.20;
    const wingAmp  = straining ? 11   : scared ? 5    : 6;
    const flapY    = Math.sin(frame * wingFreq) * wingAmp;

    p.push();
    p.translate(x, y);
    p.rotate(tilt);
    p.noStroke();

    // ── Tail feathers (drawn first, behind everything) ─────────────────────
    p.fill(210, 165, 15);
    // upper tail feather
    p.triangle(
      -r * 0.70, -r * 0.05,
      -r * 0.72,  r * 0.22,
      -r * 1.38,  r * 0.08
    );
    // lower tail feather (slightly offset)
    p.fill(195, 150, 10);
    p.triangle(
      -r * 0.65,  r * 0.10,
      -r * 0.70,  r * 0.38,
      -r * 1.28,  r * 0.32
    );

    // ── Wing ───────────────────────────────────────────────────────────────
    p.fill(240, 200, 20);
    if (scared) {
      // Wings splayed wide — flailing
      p.ellipse(-r * 0.05, flapY - r * 0.15, r * 1.4, r * 0.55);
    } else {
      p.ellipse(-r * 0.10, flapY + r * 0.05, r * 1.15, r * 0.50);
    }

    // ── Body ───────────────────────────────────────────────────────────────
    p.fill(255, 220, 25);
    p.circle(0, 0, w + 2);

    // Soft belly highlight
    p.fill(255, 248, 140, 90);
    p.ellipse(r * 0.12, r * 0.22, r * 0.85, r * 0.72);

    // ── Face (expression-specific) ─────────────────────────────────────────
    const eyeX = r * 0.28;
    const eyeY = -r * 0.18;

    if (scared) {
      // ── SCARED ─────────────────────────────────────────────────────────
      // Wide eye sclera
      p.fill(255);
      p.circle(eyeX, eyeY, r * 0.92);

      // Amber iris
      p.fill(230, 130, 20);
      p.circle(eyeX + r * 0.02, eyeY + r * 0.04, r * 0.52);

      // Tiny panicked pupil
      p.fill(15, 12, 10);
      p.circle(eyeX + r * 0.02, eyeY + r * 0.04, r * 0.18);

      // Highlight
      p.fill(255);
      p.circle(eyeX + r * 0.10, eyeY - r * 0.04, r * 0.09);

      // Eyebrows — shot up in shock
      p.fill(180, 135, 10);
      p.beginShape();
        p.vertex(eyeX - r * 0.30, eyeY - r * 0.52);
        p.vertex(eyeX - r * 0.02, eyeY - r * 0.64);
        p.vertex(eyeX + r * 0.26, eyeY - r * 0.54);
        p.vertex(eyeX + r * 0.22, eyeY - r * 0.46);
        p.vertex(eyeX - r * 0.02, eyeY - r * 0.54);
        p.vertex(eyeX - r * 0.26, eyeY - r * 0.44);
      p.endShape(p.CLOSE);

      // Beak open — screaming
      // Upper beak (tilted up)
      p.fill(255, 148, 22);
      p.triangle(
        r * 0.52, -r * 0.14,
        r * 0.52,  r * 0.02,
        r * 1.08,  r * 0.00
      );
      // Mouth interior
      p.fill(190, 65, 12);
      p.triangle(
        r * 0.52,  r * 0.02,
        r * 0.52,  r * 0.20,
        r * 0.98,  r * 0.10
      );
      // Lower beak (drooped)
      p.fill(230, 122, 15);
      p.triangle(
        r * 0.52,  r * 0.20,
        r * 0.52,  r * 0.32,
        r * 0.90,  r * 0.24
      );

    } else if (straining) {
      // ── STRAINING ──────────────────────────────────────────────────────
      // Squinted closed eye — upper-half arc = classic closed eye shape
      p.fill(25, 18, 8);
      p.arc(eyeX, eyeY, r * 0.88, r * 0.62, Math.PI, 0, p.CHORD);

      // Effort wrinkle above eye
      p.stroke(180, 138, 10);
      p.strokeWeight(1.4);
      p.noFill();
      p.arc(eyeX, eyeY - r * 0.42, r * 0.55, r * 0.26, Math.PI + 0.3, 0 - 0.3);
      p.noStroke();

      // Eyebrow — furrowed, pushed down toward nose
      p.fill(180, 135, 10);
      p.beginShape();
        p.vertex(eyeX - r * 0.30, eyeY - r * 0.40);
        p.vertex(eyeX - r * 0.02, eyeY - r * 0.50);
        p.vertex(eyeX + r * 0.26, eyeY - r * 0.40);
        p.vertex(eyeX + r * 0.22, eyeY - r * 0.32);
        p.vertex(eyeX - r * 0.02, eyeY - r * 0.40);
        p.vertex(eyeX - r * 0.26, eyeY - r * 0.32);
      p.endShape(p.CLOSE);

      // Beak — clenched shut, pushed forward with effort
      p.fill(255, 148, 22);
      p.triangle(
        r * 0.52, -r * 0.10,
        r * 0.52,  r * 0.02,
        r * 1.10,  r * 0.00
      );
      p.fill(220, 115, 15);
      p.triangle(
        r * 0.52,  r * 0.02,
        r * 0.52,  r * 0.12,
        r * 1.00,  r * 0.06
      );

    } else {
      // ── NEUTRAL ────────────────────────────────────────────────────────
      // Eye sclera
      p.fill(255);
      p.circle(eyeX, eyeY, r * 0.88);

      // Amber iris
      p.fill(230, 130, 20);
      p.circle(eyeX + r * 0.02, eyeY, r * 0.50);

      // Pupil
      p.fill(15, 12, 10);
      p.circle(eyeX + r * 0.04, eyeY, r * 0.22);

      // Highlight
      p.fill(255);
      p.circle(eyeX + r * 0.10, eyeY - r * 0.06, r * 0.09);

      // Eyebrow — calm, slight arch
      p.fill(180, 135, 10);
      p.beginShape();
        p.vertex(eyeX - r * 0.30, eyeY - r * 0.46);
        p.vertex(eyeX - r * 0.02, eyeY - r * 0.56);
        p.vertex(eyeX + r * 0.26, eyeY - r * 0.46);
        p.vertex(eyeX + r * 0.22, eyeY - r * 0.38);
        p.vertex(eyeX - r * 0.02, eyeY - r * 0.46);
        p.vertex(eyeX - r * 0.26, eyeY - r * 0.38);
      p.endShape(p.CLOSE);

      // Beak — closed, simple triangles
      p.fill(255, 148, 22);
      p.triangle(
        r * 0.52, -r * 0.10,
        r * 0.52,  r * 0.02,
        r * 1.08,  r * 0.00
      );
      p.fill(220, 115, 15);
      p.triangle(
        r * 0.52,  r * 0.02,
        r * 0.52,  r * 0.12,
        r * 0.98,  r * 0.06
      );
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
