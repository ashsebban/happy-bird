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
    this.eyeOpenness = 1.0;
  }

  update(jumping) {
    this.frame++;
    if (jumping) this.vy = -CONFIG.BIRD.JUMP_FORCE;
    this.vy += CONFIG.BIRD.GRAVITY;
    this.vy = Math.min(this.vy, CONFIG.BIRD.MAX_FALL);
    this.y += this.vy;

    const flapSpeed = this.p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, 1.12, 0.70);
    this.wingPhase += flapSpeed;

    // Eye states by velocity:
    //   vy < -3.0  → CLOSED  (intense rising — bird is flying hard)
    //   vy >= 7.0  → WIDE OPEN (plummet — afraid)
    //   everything else → normal OPEN
    const vy = this.vy;
    const targetOpen = vy < -3.0 ? 0.05 : vy >= 7.0 ? 1.18 : 1.0;
    this.eyeOpenness += (targetOpen - this.eyeOpenness) * 0.14;
  }

  draw() {
    const { p, x, y, w } = this;
    const r = w / 2;

    const flapAmp = p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, r * 0.20, r * 0.13);
    const wingBob = Math.sin(this.wingPhase) * flapAmp;

    const tilt = p.constrain(
      p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -0.32, 0.42),
      -0.32, 0.42
    );

    const eo = this.eyeOpenness;

    p.push();
    p.translate(x, y);
    p.rotate(tilt);
    p.noStroke();

    // tail feathers
    p.fill(230, 160, 10);
    p.triangle(-r*0.52, -r*0.12, -r*0.52, r*0.28, -r*1.05, -r*0.38);
    p.fill(255, 190, 20);
    p.triangle(-r*0.52, r*0.10, -r*0.52, r*0.58, -r*1.10, r*0.62);

    // body
    p.stroke(25, 15, 5);
    p.strokeWeight(1.6);
    p.fill(255, 220, 55);
    p.circle(0, 0, w);

    // wing
    p.stroke(25, 15, 5);
    p.strokeWeight(1.2);
    p.fill(255);
    p.ellipse(-r*0.70, wingBob, r*1.05, r*0.756);

    // feet
    p.stroke(255, 145, 0);
    p.strokeWeight(1.4);
    p.noFill();
    p.line(-r*0.22, r*0.88, -r*0.22, r*1.10);
    p.line(-r*0.22, r*1.10, -r*0.44, r*1.22);
    p.line(-r*0.22, r*1.10, -r*0.02, r*1.22);
    p.line( r*0.08, r*0.90,  r*0.08, r*1.10);
    p.line( r*0.08, r*1.10, -r*0.12, r*1.22);
    p.line( r*0.08, r*1.10,  r*0.28, r*1.22);

    // beak — lips split open when plummeting (eo > 1.0)
    const mouthGap = eo > 1.0 ? (eo - 1.0) / 0.18 * r * 0.22 : 0;
    p.noStroke();
    p.fill(250, 123, 5);
    p.ellipse(r*0.90, r*0.14 - mouthGap, r*0.80, r*0.27); // top lip
    p.ellipse(r*0.86, r*0.36 + mouthGap, r*0.60, r*0.27); // bottom lip
    // tongue/inside when open
    if (mouthGap > r * 0.05) {
      p.fill(220, 80, 80);
      p.ellipse(r*0.88, r*0.25, r*0.40, mouthGap * 1.2);
    }

    // rosy cheek
    p.fill(255, 160, 160, 90);
    p.circle(r*0.58, r*0.14, r*0.36);

    // eye
    const eX = r * 0.60;
    const eY = -r * 0.40;
    const eW = r * 0.80;
    const eH = r * 0.90;

    // eye — height scales with eyeOpenness, top lid arc always drawn
    p.stroke(25, 15, 5);
    p.strokeWeight(0.7);
    p.fill(255);
    p.ellipse(eX, eY, eW, eH * eo);

    // top eyelid arc always visible (anchors the squint)
    p.noFill();
    p.strokeWeight(0.9);
    p.arc(eX, eY, eW * 0.98, eH * 0.98, Math.PI, 0);

    // pupil + shine fade in as eye opens
    if (eo > 0.25) {
      p.noStroke();
      p.fill(25, 15, 5);
      p.circle(eX + r*0.08, eY + r*0.04, r*0.44);
      if (eo > 0.5) {
        p.fill(255);
        p.circle(eX - r*0.04, eY - r*0.10, r*0.15);
      }
    }

    p.pop();
  }

  accelerateFall() { this.vy += 5; }
  isOutOfBounds()  { return this.y > CONFIG.HEIGHT - this.h / 2; }
  reset()          { this.y = 0; this.vy = 0; this.frame = 0; this.wingPhase = 0; }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
