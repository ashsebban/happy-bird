import { CONFIG } from './config.js';

export class Bird {
  constructor(p) {
    this.p = p;
    this.x = CONFIG.BIRD.X;
    this.y = 0;
    this.w = CONFIG.BIRD.WIDTH;
    this.h = CONFIG.BIRD.HEIGHT;
    this.fallSpeed = CONFIG.BIRD.FALL_SPEED;
    this.jumpSpeed = CONFIG.BIRD.JUMP_SPEED;
    this.frame = 0;
  }

  update(jumping) {
    this.frame++;
    if (jumping) {
      this.y -= this.jumpSpeed;
    } else {
      this.y += this.fallSpeed;
    }
  }

  draw() {
    const { p, x, y, w, h, frame } = this;
    // body
    p.fill(255, 243, 20);
    p.ellipse(x, y, w, h);
    // wing
    p.fill(255);
    p.ellipse(x - w * 0.35, y + p.sin(frame) * 5, 0.5 * w, 0.4 * h);
    // eye white
    p.ellipse(x + w * 0.3, y - w * 0.2, 0.4 * w, 0.5 * h);
    // eye pupil
    p.fill(0);
    p.ellipse(x + w * 0.4, y - w * 0.25, 0.05 * w, 0.2 * h);
    // beak
    p.fill(250, 123, 5);
    p.ellipse(x + w * 0.45, y + h * 0.08, 0.4 * w, 0.15 * h);
    p.ellipse(x + w * 0.43, y + h * 0.2, 0.3 * w, 0.15 * h);
    p.fill(255);
  }

  accelerateFall() {
    this.fallSpeed += 1;
  }

  isOutOfBounds() {
    return this.y > CONFIG.HEIGHT - this.h / 2;
  }

  reset() {
    this.y = 0;
    this.fallSpeed = CONFIG.BIRD.FALL_SPEED_RESET;
    this.frame = 0;
  }

  get top()   { return this.y - this.h / 2; }
  get bottom(){ return this.y + this.h / 2; }
  get front() { return this.x + this.w / 2; }
  get back()  { return this.x - this.w / 2; }
}
