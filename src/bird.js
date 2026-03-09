import { CONFIG } from './config.js';

const C = {
  body:  [102, 183, 200],
  wing:  [79,  163, 181],
  belly: [234, 220, 203],
  beak:  [242, 162, 28],
  feet:  [240, 172, 60],
  cheek: [246, 195, 195],
  tuft:  [68,  152, 170],
};

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
    const r = w / 2;

    const tilt = p.constrain(
      p.map(vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -0.28, 0.52),
      -0.28, 0.52
    );

    // Wing: hinge on left side of body, ellipse extends leftward from hinge.
    // Frequency and amplitude both scale continuously with vy:
    // going up (vy negative) → fast + wide flap; falling (vy positive) → slow + shallow.
    const wingFreq  = p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, 0.32, 0.10);
    const wingAmp   = p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, 0.38, 0.10);
    const wingAngle = Math.sin(frame * wingFreq) * wingAmp;

    // Blink
    const blinkCycle = this.frame % 210;
    let blinkT = 0;
    if (blinkCycle < 10) {
      blinkT = blinkCycle < 5
        ? blinkCycle / 5
        : 1 - (blinkCycle - 5) / 5;
    }

    p.push();
    p.translate(x, y);
    p.rotate(tilt);
    p.noStroke();

    // ── Wing — hinge at left-center of body; ellipse offset left so it
    //    extends outward. Body (drawn after) covers the inner portion. ─────────
    p.push();
      p.translate(-r * 0.48, r * 0.05);
      p.rotate(wingAngle);
      p.fill(55, 135, 155);                         // shadow layer
      p.ellipse(-r * 0.65, r * 0.12, r * 1.45, r * 0.62);
    p.pop();
    p.push();
      p.translate(-r * 0.48, r * 0.05);
      p.rotate(wingAngle);
      p.fill(...C.wing);                            // main wing
      p.ellipse(-r * 0.58, r * 0.07, r * 1.28, r * 0.54);
    p.pop();

    // ── Feet — two orange mounds before body ──────────────────────────────────
    p.fill(...C.feet);
    p.ellipse(-r*0.18, r*0.88, r*0.52, r*0.72);
    p.ellipse( r*0.18, r*0.88, r*0.52, r*0.72);

    // ── Body — one circle ─────────────────────────────────────────────────────
    p.fill(...C.body);
    p.circle(0, 0, w);

    // Belly — lighter patch on front
    p.fill(...C.belly);
    p.ellipse(r*0.16, r*0.22, r*1.05, r*0.96);

    // ── Head tuft ─────────────────────────────────────────────────────────────
    p.fill(...C.tuft);
    p.circle(-r*0.06, -r*0.91, r*0.30);
    p.circle( r*0.16, -r*0.87, r*0.22);

    // ── Beak — drawn BEFORE eye so the eye renders on top ─────────────────────
    p.fill(...C.beak);
    p.triangle(
      r*0.40,  r*0.05,
      r*0.40,  r*0.26,
      r*0.72,  r*0.16
    );

    // ── Eye — drawn AFTER beak so it always appears in front ──────────────────
    const ex = r * 0.28;
    const ey = -r * 0.18;
    const sd = r * 0.70;

    p.fill(255);
    p.circle(ex, ey, sd);

    p.fill(22, 14, 10);
    p.circle(ex + r*0.03, ey + r*0.02, sd * 0.64);

    p.fill(255);
    p.circle(ex + r*0.08, ey - r*0.12, r*0.14);

    // Eyelid blink
    if (blinkT > 0.02) {
      const lidY = ey - sd * (1 - blinkT);
      p.fill(...C.body);
      p.circle(ex, lidY, sd * 1.06);
      p.stroke(...C.tuft);
      p.strokeWeight(1.2);
      p.noFill();
      p.arc(ex, lidY, sd * 1.06, sd * 1.06, Math.PI - 1.6, 1.6);
      p.noStroke();
    }

    // Top eyelid line
    p.stroke(28, 18, 8);
    p.strokeWeight(1.7);
    p.noFill();
    p.arc(ex, ey, sd * 1.05, sd * 0.82, Math.PI, 0);
    p.noStroke();

    // ── Cheek blush ───────────────────────────────────────────────────────────
    p.noStroke();
    p.fill(...C.cheek, 100);
    p.circle(ex + r*0.02, ey + r*0.44, r*0.46);

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
