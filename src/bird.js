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
    const { p, x, y, w } = this;
    const r = w / 2;

    // wing flap — bobs up when ascending, hangs down when falling
    const wingBob = p.map(this.vy, -CONFIG.BIRD.JUMP_FORCE, CONFIG.BIRD.MAX_FALL, -r * 0.30, r * 0.18);

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

    // wing — lighter yellow, animated, sits on left side of body
    p.stroke(25, 15, 5);
    p.strokeWeight(1.4);
    p.fill(255, 240, 130);
    p.ellipse(x - r * 0.28, y + r * 0.18 + wingBob, r * 1.18, r * 0.46);

    // feet — two small orange legs with toes, tucked back
    p.stroke(255, 145, 0);
    p.strokeWeight(1.4);
    p.noFill();
    // back foot
    p.line(x - r * 0.22, y + r * 0.88, x - r * 0.22, y + r * 1.10);
    p.line(x - r * 0.22, y + r * 1.10, x - r * 0.44, y + r * 1.22);
    p.line(x - r * 0.22, y + r * 1.10, x - r * 0.02, y + r * 1.22);
    // front foot
    p.line(x + r * 0.08, y + r * 0.90, x + r * 0.08, y + r * 1.10);
    p.line(x + r * 0.08, y + r * 1.10, x - r * 0.12, y + r * 1.22);
    p.line(x + r * 0.08, y + r * 1.10, x + r * 0.28, y + r * 1.22);

    // beak — small cute orange triangle, lower-right of face
    p.noStroke();
    p.fill(255, 155, 25);
    p.triangle(
      x + r * 0.68,  y + r * 0.02,
      x + r * 0.68,  y + r * 0.26,
      x + r * 1.08,  y + r * 0.13
    );
    // lower mandible shadow
    p.fill(220, 115, 10);
    p.triangle(
      x + r * 0.68,  y + r * 0.16,
      x + r * 0.68,  y + r * 0.26,
      x + r * 1.04,  y + r * 0.22
    );

    // rosy cheek
    p.fill(255, 160, 160, 90);
    p.circle(x + r * 0.58, y + r * 0.14, r * 0.36);

    // back eye (slightly smaller, peeking out)
    p.stroke(25, 15, 5);
    p.strokeWeight(1.2);
    p.fill(255);
    p.circle(x + r * 0.20, y - r * 0.28, r * 0.52);
    p.noStroke();
    p.fill(25, 15, 5);
    p.circle(x + r * 0.24, y - r * 0.25, r * 0.28);
    p.fill(255);
    p.circle(x + r * 0.18, y - r * 0.33, r * 0.10);

    // front eye (main, larger, happy)
    p.stroke(25, 15, 5);
    p.strokeWeight(1.2);
    p.fill(255);
    p.circle(x + r * 0.52, y - r * 0.26, r * 0.64);
    p.noStroke();
    p.fill(25, 15, 5);
    p.circle(x + r * 0.57, y - r * 0.22, r * 0.36);
    p.fill(255);
    p.circle(x + r * 0.48, y - r * 0.34, r * 0.14);
  }

  accelerateFall() { this.vy += 5; }
  isOutOfBounds()  { return this.y > CONFIG.HEIGHT - this.h / 2; }
  reset()          { this.y = 0; this.vy = 0; this.frame = 0; }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
