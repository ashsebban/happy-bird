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
    this.wingPhase += 0.35;
  }

  draw() {
    const { p, x, y, w } = this;
    const r = w / 2;

    // wing flap — continuous sin wave, faster when ascending
    const wingBob = Math.sin(this.wingPhase) * r * 0.32;

    p.noStroke();

    // tail feathers — two small golden triangles, rear
    p.fill(230, 160, 10);
    p.triangle(
      x - r * 0.52,  y - r * 0.12,
      x - r * 0.52,  y + r * 0.28,
      x - r * 1.05,  y - r * 0.38
    );
    p.fill(255, 190, 20);
    p.triangle(
      x - r * 0.52,  y + r * 0.10,
      x - r * 0.52,  y + r * 0.58,
      x - r * 1.10,  y + r * 0.62
    );

    // body
    p.stroke(25, 15, 5);
    p.strokeWeight(1.6);
    p.fill(255, 220, 55);
    p.circle(x, y, w);

    // wing — original proportions: wide white oval, sin(f) flutter
    p.stroke(25, 15, 5);
    p.strokeWeight(1.2);
    p.fill(255);
    p.ellipse(x - r * 0.70, y + wingBob, r * 1.00, r * 0.72);

    // feet — two small orange legs with toes, tucked back
    p.stroke(255, 145, 0);
    p.strokeWeight(1.4);
    p.noFill();
    p.line(x - r * 0.22, y + r * 0.88, x - r * 0.22, y + r * 1.10);
    p.line(x - r * 0.22, y + r * 1.10, x - r * 0.44, y + r * 1.22);
    p.line(x - r * 0.22, y + r * 1.10, x - r * 0.02, y + r * 1.22);
    p.line(x + r * 0.08, y + r * 0.90, x + r * 0.08, y + r * 1.10);
    p.line(x + r * 0.08, y + r * 1.10, x - r * 0.12, y + r * 1.22);
    p.line(x + r * 0.08, y + r * 1.10, x + r * 0.28, y + r * 1.22);

    // beak — two stacked ellipses (original style: lips)
    p.noStroke();
    p.fill(250, 123, 5);
    p.ellipse(x + r * 0.90, y + r * 0.14, r * 0.80, r * 0.27); // top lip
    p.ellipse(x + r * 0.86, y + r * 0.36, r * 0.60, r * 0.27); // bottom lip

    // rosy cheek
    p.fill(255, 160, 160, 90);
    p.circle(x + r * 0.58, y + r * 0.14, r * 0.36);

    // eye — white oval sclera, round pupil, shine dot
    p.stroke(25, 15, 5);
    p.strokeWeight(1.2);
    p.fill(255);
    p.ellipse(x + r * 0.60, y - r * 0.40, r * 0.80, r * 0.90);
    p.noStroke();
    p.fill(25, 15, 5);
    p.circle(x + r * 0.68, y - r * 0.36, r * 0.44);
    p.fill(255);
    p.circle(x + r * 0.56, y - r * 0.50, r * 0.15);
  }

  accelerateFall() { this.vy += 5; }
  isOutOfBounds()  { return this.y > CONFIG.HEIGHT - this.h / 2; }
  reset()          { this.y = 0; this.vy = 0; this.frame = 0; this.wingPhase = 0; }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
