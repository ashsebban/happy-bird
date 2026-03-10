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
    // faster when ascending, slower when falling
    const flapSpeed = this.p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, 1.12, 0.70);
    this.wingPhase += flapSpeed;
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

    const ascending = this.vy < 0;

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

    // beak
    p.noStroke();
    p.fill(250, 123, 5);
    p.ellipse(r*0.90, r*0.14, r*0.80, r*0.27);
    p.ellipse(r*0.86, r*0.36, r*0.60, r*0.27);

    // rosy cheek
    p.fill(255, 160, 160, 90);
    p.circle(r*0.58, r*0.14, r*0.36);

    // eye
    const eX = r * 0.60;
    const eY = -r * 0.40;
    const eW = r * 0.80;
    const eH = r * 0.90;

    if (ascending) {
      // squinting closed eye — two arcs forming a narrow slit
      p.stroke(25, 15, 5);
      p.strokeWeight(1.8);
      p.noFill();
      p.arc(eX, eY + r*0.10, eW*0.80, eH*0.52, Math.PI, 0);       // top lid
      p.arc(eX, eY + r*0.10, eW*0.80, eH*0.16, 0,       Math.PI); // bottom lid
    } else {
      // open eye — white oval, round pupil, shine dot
      p.stroke(25, 15, 5);
      p.strokeWeight(1.2);
      p.fill(255);
      p.ellipse(eX, eY, eW, eH);
      p.noStroke();
      p.fill(25, 15, 5);
      p.circle(eX + r*0.08, eY + r*0.04, r*0.44);
      p.fill(255);
      p.circle(eX - r*0.04, eY - r*0.10, r*0.15);
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
