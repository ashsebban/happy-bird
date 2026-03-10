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
    this.p.noStroke();
    this.p.fill(255, 220, 50);
    this.p.circle(this.x, this.y, this.w);
  }

  accelerateFall() { this.vy += 5; }
  isOutOfBounds()  { return this.y > CONFIG.HEIGHT - this.h / 2; }
  reset()          { this.y = 0; this.vy = 0; }

  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }
  get front()  { return this.x + this.w / 2; }
  get back()   { return this.x - this.w / 2; }
}
