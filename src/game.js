import { CONFIG } from './config.js';
import { Bird } from './bird.js';
import { Pipe } from './pipe.js';
import { Background } from './background.js';

const STATE = { PLAYING: 'playing', OVER: 'over' };

export class Game {
  constructor(p) {
    this.p = p;
    this.bird = new Bird(p);
    this.pipe = new Pipe(p);
    this.background = new Background(p);
    this.score = 0;
    this.highscore = 0;
    this.highscoreReached = false;
    this.collided = false;
    this.state = STATE.PLAYING;
  }

  setup() {
    const p = this.p;
    p.createCanvas(CONFIG.WIDTH, CONFIG.HEIGHT);
    p.stroke(0);
    p.rectMode(p.CENTER);
  }

  draw() {
    const p = this.p;
    p.rectMode(p.CENTER);

    this.background.update(Math.min(p.deltaTime, 100));
    this.background.draw();
    this.pipe.draw();
    this.bird.draw();
    this._drawScoreboard();

    if (this.state === STATE.PLAYING) {
      this._update();
    } else {
      this._drawGameOver();
    }
  }

  handleKeyPressed() {
    const p = this.p;
    if (this.state === STATE.OVER && p.keyCode === 9) {
      this._reset();
      return false;
    }
    if (p.keyCode === 9) return false;
  }

  _update() {
    const p = this.p;
    const jumping = !this.collided && p.keyIsPressed && p.keyCode === p.UP_ARROW;
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
          this.highscoreReached = true;
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
    this.pipe.reset();
    this.score = 0;
    this.highscoreReached = false;
    this.collided = false;
    this.state = STATE.PLAYING;
  }

  _drawScoreboard() {
    const p = this.p;
    const w = CONFIG.WIDTH;
    p.rectMode(p.CENTER);
    p.fill(this.highscoreReached ? p.color(255, 243, 20) : p.color(255));
    p.stroke(0);
    p.rect(w - w * 0.11, 20, 72, 20);
    p.fill(0);
    p.textSize(10);
    p.text('Highscore: ' + this.highscore, w - w * 0.11, 25);
    p.rectMode(p.CORNER);
    p.textAlign(p.CENTER);
    p.textSize(36);
    p.text(this.score, w / 2, 50);
    p.fill(255);
  }

  _drawGameOver() {
    const p = this.p;
    const w = CONFIG.WIDTH;
    const h = CONFIG.HEIGHT;
    p.stroke(0);
    p.rectMode(p.CENTER);
    p.rect(w / 2, h / 2, w / 2, h / 4);
    p.rectMode(p.CORNER);
    p.fill(0);
    p.textAlign(p.CENTER);
    p.textSize(20);
    p.text('GAME OVER', w / 2, h / 2);
    p.textSize(14);
    p.text('Press TAB to replay', w / 2, h / 2 + 30);
    p.fill(255);
  }
}
