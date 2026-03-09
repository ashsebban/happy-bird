import { CONFIG } from './config.js';

export class Pipe {
  constructor(p) {
    this.p = p;
    this.x = CONFIG.WIDTH * 2;
    this.offset = p.random(CONFIG.HEIGHT / 3);
  }

  // Move the pipe left. Returns true if it just passed offscreen (score event).
  advance() {
    this.x -= CONFIG.PIPE.SPEED;
    return this.x < -CONFIG.PIPE.WIDTH;
  }

  // Called by Game after a score event to reposition and randomize the pipe.
  wrap(score) {
    this.x = CONFIG.WIDTH + CONFIG.PIPE.WIDTH;
    const change = this.p.random(10) * 15;
    this.offset = score % 2 === 0 ? -change : change;
  }

  draw() {
    const { p, x, offset } = this;
    const { WIDTH, LENGTH, ORN_WIDTH, ORN_HEIGHT } = CONFIG.PIPE;

    p.fill(45, 150, 66);
    // top pipe
    p.rect(x, 0 + offset, WIDTH, LENGTH * 2);
    p.rect(x, LENGTH - ORN_HEIGHT / 2 + offset, ORN_WIDTH, ORN_HEIGHT);
    // bottom pipe
    p.rect(x, CONFIG.HEIGHT + offset, WIDTH, LENGTH * 2);
    p.rect(x, CONFIG.HEIGHT - LENGTH + ORN_HEIGHT / 2 + offset, ORN_WIDTH, ORN_HEIGHT);
    p.fill(255);
  }

  collidesWith(bird) {
    const front = this.x - CONFIG.PIPE.WIDTH / 2;
    const back  = this.x + CONFIG.PIPE.WIDTH / 2;
    const bottomOfTop    = CONFIG.PIPE.LENGTH + this.offset;
    const topOfBottom    = CONFIG.HEIGHT - CONFIG.PIPE.LENGTH + this.offset;

    if (bird.front >= front && bird.back <= back) {
      return !(bird.top > bottomOfTop && bird.bottom < topOfBottom);
    }
    return false;
  }

  reset() {
    this.x = CONFIG.WIDTH * 2;
    this.offset = this.p.random(CONFIG.HEIGHT / 3);
  }
}
