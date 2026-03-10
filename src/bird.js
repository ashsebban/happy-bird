import { CONFIG } from './config.js';

export class Bird {
  constructor(p) {
    this.p = p;
    this.x = CONFIG.BIRD.X;
    this.y = 0;
    this.w = CONFIG.BIRD.WIDTH;
    this.h = CONFIG.BIRD.HEIGHT;
    this.vy = 0;
  }

  update(jumping) {
    if (jumping) this.vy = -CONFIG.BIRD.JUMP_FORCE;
    this.vy += CONFIG.BIRD.GRAVITY;
    this.vy = Math.min(this.vy, CONFIG.BIRD.MAX_FALL);
    this.y += this.vy;
  }

  draw() {
    const { p, x, y, w } = this;
    const r = w / 2;

    p.noStroke();

    // tail — small dark triangle, lower-left, behind body
    p.fill(30, 30, 30);
    p.triangle(
      x - r * 0.60, y + r * 0.22,
      x - r * 0.60, y + r * 0.72,
      x - r * 1.18, y + r * 0.82
    );

    // body — yellow circle with thick black outline
    p.stroke(20, 20, 20);
    p.strokeWeight(2.2);
    p.fill(255, 215, 50);
    p.circle(x, y, w);

    // wing — wide white oval, thick black border, left-center
    p.stroke(20, 20, 20);
    p.strokeWeight(2.2);
    p.fill(255);
    p.ellipse(x - r * 0.22, y + r * 0.08, r * 1.48, r * 0.52);

    // feet — two orange ovals, tucked back (leftward)
    p.noStroke();
    p.fill(255, 140, 0);
    p.ellipse(x - r * 0.28, y + r * 0.88, r * 0.52, r * 0.36);
    p.ellipse(x + r * 0.08, y + r * 0.92, r * 0.52, r * 0.36);

    // beak — two orange rectangles, right side
    p.fill(230, 130, 0);
    p.rect(x + r * 0.82, y + r * 0.00, r * 0.88, r * 0.26);
    p.rect(x + r * 0.82, y + r * 0.30, r * 0.82, r * 0.26);

    // main eye — large white circle + big pupil
    p.stroke(20, 20, 20);
    p.strokeWeight(1.5);
    p.fill(255);
    p.circle(x + r * 0.28, y - r * 0.22, r * 0.88);
    p.noStroke();
    p.fill(20, 20, 20);
    p.circle(x + r * 0.34, y - r * 0.18, r * 0.50);

    // small second eye — tiny, right of main eye
    p.stroke(20, 20, 20);
    p.strokeWeight(1.2);
    p.fill(255);
    p.circle(x + r * 0.86, y - r * 0.30, r * 0.28);
    p.noStroke();
    p.fill(20, 20, 20);
    p.circle(x + r * 0.89, y - r * 0.28, r * 0.12);
  }

  accelerateFall() { this.vy += 5; }
  isOutOfBounds()  { return this.y > CONFIG.HEIGHT - this.h / 2; }
  reset()          { this.y = 0; this.vy = 0; }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
