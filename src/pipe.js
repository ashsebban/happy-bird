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

    // Top pipe body + cap, Bottom pipe body + cap
    this._drawPipeBody(x, 0 + offset, WIDTH, LENGTH * 2);
    this._drawPipeCap(x, LENGTH - ORN_HEIGHT / 2 + offset, ORN_WIDTH, ORN_HEIGHT);
    this._drawPipeBody(x, CONFIG.HEIGHT + offset, WIDTH, LENGTH * 2);
    this._drawPipeCap(x, CONFIG.HEIGHT - LENGTH + ORN_HEIGHT / 2 + offset, ORN_WIDTH, ORN_HEIGHT);
  }

  _drawPipeBody(x, y, w, h) {
    const p = this.p;
    // Base
    p.fill(36, 138, 55);
    p.noStroke();
    p.rect(x, y, w, h);
    // Left highlight strip
    p.fill(88, 188, 78);
    p.rect(x - w * 0.30, y, w * 0.22, h);
    // Right shadow strip
    p.fill(20, 85, 36);
    p.rect(x + w * 0.36, y, w * 0.14, h);
  }

  _drawPipeCap(x, y, w, h) {
    const p = this.p;
    // Cap base — slightly lighter than body
    p.fill(48, 155, 65);
    p.noStroke();
    p.rect(x, y, w, h);
    // Left highlight
    p.fill(100, 200, 88);
    p.rect(x - w * 0.30, y, w * 0.22, h);
    // Right shadow
    p.fill(24, 95, 40);
    p.rect(x + w * 0.36, y, w * 0.14, h);
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
