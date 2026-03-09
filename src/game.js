import { CONFIG } from './config.js';
import { Bird } from './bird.js';
import { Pipe } from './pipe.js';
import { Background } from './background.js';

const STATE = { READY: 'ready', PLAYING: 'playing', OVER: 'over' };

export class Game {
  constructor(p) {
    this.p = p;
    this.bird = new Bird(p);
    this.pipe = new Pipe(p);
    this.background = null;
    this.score = 0;
    this.highscore = 0;
    this.newBest = false;
    this.collided = false;
    this.state = STATE.READY;
    this._bobT = 0;
  }

  setup() {
    const p = this.p;
    p.createCanvas(CONFIG.WIDTH, CONFIG.HEIGHT);
    p.rectMode(p.CENTER);
    this.background = new Background(p);
    this.bird.y = CONFIG.HEIGHT / 2;
  }

  draw() {
    const p = this.p;
    p.rectMode(p.CENTER);

    this.background.update(Math.min(p.deltaTime, 100));
    this.background.draw();
    this.pipe.draw();
    this.bird.draw();

    if (this.state === STATE.READY) {
      this._updateReady();
      this._drawReady();
    } else if (this.state === STATE.PLAYING) {
      this._update();
      this._drawScore();
    } else {
      this._drawScore();
      this._drawGameOver();
    }
  }

  handleKeyPressed() {
    const p = this.p;
    if (p.keyCode === 9) {                          // TAB always intercepts
      if (this.state === STATE.OVER) this._reset();
      return false;
    }
    if (p.keyCode === p.UP_ARROW || p.keyCode === 32) {
      this._handleTap();
    }
  }

  handleMousePressed() {
    this._handleTap();
    return false;                                   // prevent default scroll on mobile
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _handleTap() {
    if (this.state === STATE.READY) {
      this.state = STATE.PLAYING;
    } else if (this.state === STATE.OVER) {
      this._reset();
    } else if (this.state === STATE.PLAYING && !this.collided) {
      this.bird.vy = -CONFIG.BIRD.JUMP_FORCE;
    }
  }

  _updateReady() {
    this._bobT += 0.05;
    this.bird.y = CONFIG.HEIGHT / 2 + Math.sin(this._bobT) * 6;
    this.bird.vy = 0;
    this.bird.wingPhase += 0.12;
  }

  _update() {
    const p = this.p;
    const jumping = !this.collided && p.keyIsPressed &&
                    (p.keyCode === p.UP_ARROW || p.keyCode === 32);
    this.bird.update(jumping);

    if (!this.collided && this.pipe.collidesWith(this.bird)) {
      this.collided = true;
      this.bird.accelerateFall();
    } else if (!this.collided) {
      const passed = this.pipe.advance();
      if (passed) {
        this.score++;
        if (this.score > this.highscore) {
          this.highscore = this.score;
          this.newBest = true;
        }
        this.pipe.wrap(this.score);
      }
    }

    if (this.bird.isOutOfBounds()) {
      this.state = STATE.OVER;
    }
  }

  _reset() {
    this.bird.reset();
    this.bird.y = CONFIG.HEIGHT / 2;
    this.pipe.reset();
    this.score = 0;
    this.newBest = false;
    this.collided = false;
    this.state = STATE.READY;
    this._bobT = 0;
  }

  // ── Score display (shown during play and on game over) ──────────────────────
  _drawScore() {
    const p = this.p;
    p.textAlign(p.CENTER);
    p.textStyle(p.BOLD);
    p.noStroke();

    // Drop shadow
    p.fill(0, 0, 0, 90);
    p.textSize(46);
    p.text(this.score, CONFIG.WIDTH / 2 + 2, 64);
    // White score
    p.fill(255);
    p.text(this.score, CONFIG.WIDTH / 2, 62);
    p.textStyle(p.NORMAL);
  }

  // ── Ready / title screen ────────────────────────────────────────────────────
  _drawReady() {
    const p = this.p;
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;
    p.textAlign(p.CENTER);
    p.noStroke();

    // Title
    p.textStyle(p.BOLD);
    p.textSize(34);
    p.fill(0, 0, 0, 80);
    p.text('HAPPY BIRD', W / 2 + 2, H * 0.20 + 2);
    p.fill(255);
    p.text('HAPPY BIRD', W / 2, H * 0.20);

    // Pulsing tap prompt
    const pulse = p.map(Math.sin(this._bobT * 2.2), -1, 1, 130, 255);
    p.textStyle(p.NORMAL);
    p.textSize(15);
    p.fill(255, 255, 255, pulse);
    p.text('TAP or ↑ to play', W / 2, H * 0.78);

    // Best score (only if set)
    if (this.highscore > 0) {
      p.textSize(13);
      p.fill(255, 215, 70, 220);
      p.text('BEST  ' + this.highscore, W / 2, H * 0.84);
    }
  }

  // ── Game over card ──────────────────────────────────────────────────────────
  _drawGameOver() {
    const p = this.p;
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;

    // Dim overlay
    p.noStroke();
    p.fill(0, 0, 0, 110);
    p.rectMode(p.CORNER);
    p.rect(0, 0, W, H);
    p.rectMode(p.CENTER);

    const cardW = W * 0.74;
    const cardH = H * 0.38;
    const cx    = W / 2;
    const cy    = H * 0.47;

    // Card drop shadow
    p.fill(0, 0, 0, 55);
    p.rect(cx + 4, cy + 5, cardW, cardH, 18);

    // Card body
    p.fill(255, 252, 240);
    p.rect(cx, cy, cardW, cardH, 18);

    // Red header band
    p.fill(215, 60, 55);
    p.rect(cx, cy - cardH / 2 + 27, cardW, 54, 18, 18, 0, 0);
    p.fill(255);
    p.textAlign(p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(21);
    p.text('GAME OVER', cx, cy - cardH / 2 + 33);

    // Score / Best columns
    const colL = cx - cardW * 0.24;
    const colR = cx + cardW * 0.24;
    const labY = cy + 10;
    const valY = cy + 38;

    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.fill(150);
    p.text('SCORE', colL, labY);
    p.text('BEST', colR, labY);

    p.textStyle(p.BOLD);
    p.textSize(32);
    p.fill(40);
    p.text(this.score, colL, valY);
    p.fill(this.newBest ? p.color(200, 145, 0) : p.color(40));
    p.text(this.highscore, colR, valY);

    // Vertical divider
    p.stroke(210);
    p.strokeWeight(1);
    p.line(cx, labY - 8, cx, valY + 4);
    p.noStroke();

    // NEW BEST badge
    if (this.newBest) {
      p.fill(255, 200, 30);
      p.rect(colR, valY + 20, 62, 17, 9);
      p.fill(110, 65, 0);
      p.textStyle(p.BOLD);
      p.textSize(9);
      p.text('NEW BEST!', colR, valY + 25);
    }

    // Pulsing replay button
    const pulse = p.map(Math.sin(p.frameCount * 0.07), -1, 1, 0.94, 1.02);
    p.push();
      p.translate(cx, cy + cardH / 2 + 28);
      p.scale(pulse);
      p.noStroke();
      // Shadow
      p.fill(0, 0, 0, 50);
      p.rect(2, 3, cardW * 0.76, 38, 19);
      // Button
      p.fill(75, 185, 105);
      p.rect(0, 0, cardW * 0.76, 38, 19);
      p.fill(255);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.text('TAP or ↑  to play again', 0, 5);
    p.pop();
  }
}
