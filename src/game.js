import { CONFIG } from './config.js';
import { Bird }       from './bird.js';
import { Pipe }       from './pipe.js';
import { Background } from './background.js';
import { Audio }      from './audio.js';
import { Particles }  from './particles.js';
import { submitScore, getTopScores } from './leaderboard.js';

const STATE = { READY: 'ready', PLAYING: 'playing', OVER: 'over' };

export class Game {
  constructor(p) {
    this.p = p;
    this.bird       = new Bird(p);
    this.pipe       = new Pipe(p);
    this.background = null;
    this.audio      = new Audio();
    this.particles  = new Particles(p);

    this.score      = 0;
    this.highscore  = parseInt(localStorage.getItem('happybird_best') || '0');
    this.newBest    = false;
    this.collided   = false;
    this.state      = STATE.READY;

    this._bobT           = 0;
    this._deathTimer     = 0;
    this._shake          = 0;
    this._scorePop       = 0;
    this._levelFlash     = 0;
    this._bestSoundPlayed = false;

    // Leaderboard state
    this._leaderboard     = [];   // [{name, score}]
    this._lbStatus        = 'idle'; // 'idle' | 'loading' | 'done' | 'error'
    this._nameSubmitted   = false;
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

    // Screen shake — applied as translate at top of frame (resets each frame)
    if (this._shake > 0) {
      p.translate(
        p.random(-this._shake, this._shake),
        p.random(-this._shake, this._shake)
      );
      this._shake *= 0.78;
      if (this._shake < 0.5) this._shake = 0;
    }

    this.background.update(Math.min(p.deltaTime, 100));
    this.background.draw();
    this.pipe.draw();

    if (this.bird.y < CONFIG.HEIGHT + this.bird.h) {
      this.bird.draw();
    }

    this.particles.update();
    this.particles.draw();

    if (this.state === STATE.READY) {
      this._updateReady();
      this._drawReady();
    } else if (this.state === STATE.PLAYING) {
      this._update();
      this._drawScore();
    } else {
      this._deathTimer++;
      this.bird.update(false);
      this._drawScore();
      if (this._deathTimer > 50) {
        this._drawGameOver();
      }
    }
  }

  handleKeyPressed() {
    const p = this.p;
    if (p.keyCode === 9) {
      if (this.state === STATE.OVER && this._deathTimer > 50) this._reset();
      return false;
    }
    if (p.keyCode === p.UP_ARROW || p.keyCode === 32) {
      this._handleTap();
    }
  }

  handleMousePressed() {
    this._handleTap();
    return false;
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _handleTap() {
    if (this.state === STATE.READY) {
      this.state = STATE.PLAYING;
      this.audio.flap();
    } else if (this.state === STATE.OVER && this._deathTimer > 50) {
      this._reset();
    } else if (this.state === STATE.PLAYING && !this.collided) {
      this.bird.vy = -CONFIG.BIRD.JUMP_FORCE;
      this.audio.flap();
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
      this._shake = 14;
      this.particles.burst(this.bird.x, this.bird.y);
      this.audio.death();
    } else if (!this.collided) {
      const passed = this.pipe.advance();
      if (passed) {
        this.score++;
        this._scorePop = 9;
        this.audio.score();

        if (this.score > this.highscore) {
          this.highscore = this.score;
          this.newBest = true;
          localStorage.setItem('happybird_best', String(this.highscore));
        }

        if (this.score % CONFIG.PIPE.SPEED_INTERVAL === 0) {
          this.pipe.speed = Math.min(
            this.pipe.speed + CONFIG.PIPE.SPEED_INCREMENT,
            CONFIG.PIPE.SPEED_MAX
          );
          this._levelFlash = 60;
        }

        this.pipe.wrap(this.score);
      }
    }

    if (this.bird.isOutOfBounds()) {
      // Ground hit without prior pipe collision — fire effects now
      if (!this.collided) {
        this._shake = 10;
        this.particles.burst(this.bird.x, this.bird.y);
        this.audio.death();
      }
      this.state = STATE.OVER;
    }
  }

  _reset() {
    this.bird.reset();
    this.bird.y = CONFIG.HEIGHT / 2;
    this.pipe.reset();
    this.pipe.speed = CONFIG.PIPE.SPEED_INITIAL;
    this.particles.clear();
    this.score    = 0;
    this.newBest  = false;
    this.collided = false;
    this.state    = STATE.READY;
    this._bobT           = 0;
    this._deathTimer     = 0;
    this._shake          = 0;
    this._scorePop       = 0;
    this._levelFlash     = 0;
    this._bestSoundPlayed = false;
    this._nameSubmitted  = false;
    this._lbStatus       = 'idle';
    this._leaderboard    = [];
  }

  // ── Score display ────────────────────────────────────────────────────────────
  _drawScore() {
    const p = this.p;

    if (this._scorePop > 0) this._scorePop--;
    const popScale = 1 + (this._scorePop / 9) * 0.38;

    p.push();
    p.translate(CONFIG.WIDTH / 2, 62);
    p.scale(popScale);
    p.textAlign(p.CENTER);
    p.textStyle(p.BOLD);
    p.noStroke();
    p.textSize(46);
    p.fill(0, 0, 0, 90);
    p.text(this.score, 2, 2);
    p.fill(255);
    p.text(this.score, 0, 0);
    p.pop();
    p.textStyle(p.NORMAL);

    // "FASTER!" flash on difficulty bump
    if (this._levelFlash > 0) {
      this._levelFlash--;
      const a = this._levelFlash > 30
        ? 255
        : p.map(this._levelFlash, 0, 30, 0, 255);
      p.textAlign(p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(14);
      p.noStroke();
      p.fill(255, 230, 50, a);
      p.text('FASTER!', CONFIG.WIDTH / 2, 88);
      p.textStyle(p.NORMAL);
    }
  }

  // ── Ready / title screen ─────────────────────────────────────────────────────
  _drawReady() {
    const p = this.p;
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;
    p.textAlign(p.CENTER);
    p.noStroke();

    p.textStyle(p.BOLD);
    p.textSize(34);
    p.fill(0, 0, 0, 80);
    p.text('HAPPY BIRD', W / 2 + 2, H * 0.20 + 2);
    p.fill(255);
    p.text('HAPPY BIRD', W / 2, H * 0.20);

    const pulse = p.map(Math.sin(this._bobT * 2.2), -1, 1, 130, 255);
    p.textStyle(p.NORMAL);
    p.textSize(15);
    p.fill(255, 255, 255, pulse);
    p.text('TAP or ↑ to play', W / 2, H * 0.78);

    if (this.highscore > 0) {
      p.textSize(13);
      p.fill(255, 215, 70, 220);
      p.text('BEST  ' + this.highscore, W / 2, H * 0.84);
    }
  }

  // ── Game over card ───────────────────────────────────────────────────────────
  _drawGameOver() {
    const p = this.p;
    const W = CONFIG.WIDTH;
    const H = CONFIG.HEIGHT;

    // Fire new-best sound and leaderboard fetch once
    if (this.newBest && !this._bestSoundPlayed) {
      this._bestSoundPlayed = true;
      this.audio.newBest();
      this._triggerLeaderboard();
    } else if (!this.newBest && this._lbStatus === 'idle') {
      this._fetchLeaderboard();
    }

    // Dim overlay
    p.noStroke();
    p.fill(0, 0, 0, 110);
    p.rectMode(p.CORNER);
    p.rect(0, 0, W, H);
    p.rectMode(p.CENTER);

    const cardW = W * 0.74;
    const cardH = H * 0.52;   // taller to fit leaderboard
    const cx    = W / 2;
    const cy    = H * 0.44;

    // Card drop shadow + body
    p.fill(0, 0, 0, 55);
    p.rect(cx + 4, cy + 5, cardW, cardH, 18);
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

    // Medal
    this._drawMedal(cx - cardW * 0.28, cy - cardH / 2 + 100);

    // Score / Best columns (shifted right to leave room for medal)
    const colL = cx + cardW * 0.02;
    const colR = cx + cardW * 0.34;
    const labY = cy - cardH / 2 + 82;
    const valY = cy - cardH / 2 + 110;

    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.fill(150);
    p.text('SCORE', colL, labY);
    p.text('BEST',  colR, labY);

    p.textStyle(p.BOLD);
    p.textSize(32);
    p.fill(40);
    p.text(this.score, colL, valY);
    p.fill(this.newBest ? p.color(200, 145, 0) : p.color(40));
    p.text(this.highscore, colR, valY);

    // Vertical divider between score cols
    p.stroke(210);
    p.strokeWeight(1);
    p.line(colL + (colR - colL) / 2, labY - 8, colL + (colR - colL) / 2, valY + 4);
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

    // Leaderboard section
    this._drawLeaderboard(cx, cy - cardH / 2 + 145, cardW);

    // Pulsing replay button
    const pulse = p.map(Math.sin(p.frameCount * 0.07), -1, 1, 0.94, 1.02);
    p.push();
      p.translate(cx, cy + cardH / 2 + 28);
      p.scale(pulse);
      p.noStroke();
      p.fill(0, 0, 0, 50);
      p.rect(2, 3, cardW * 0.76, 38, 19);
      p.fill(75, 185, 105);
      p.rect(0, 0, cardW * 0.76, 38, 19);
      p.fill(255);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.text('TAP or ↑  to play again', 0, 5);
    p.pop();
  }

  _drawMedal(x, y) {
    const p = this.p;
    const score = this.score;
    if (score < 5) return;

    let col, shine, label;
    if      (score >= 50) { col = p.color(100, 220, 240); shine = p.color(200, 255, 255); label = 'PLAT'; }
    else if (score >= 30) { col = p.color(220, 170,   0); shine = p.color(255, 240, 120); label = 'GOLD'; }
    else if (score >= 15) { col = p.color(180, 180, 190); shine = p.color(240, 240, 250); label = 'SILV'; }
    else                  { col = p.color(180, 100,  40); shine = p.color(230, 165, 100); label = 'BRNZ'; }

    const r = 20;
    // Shadow
    p.noStroke();
    p.fill(0, 0, 0, 40);
    p.circle(x + 2, y + 2, r * 2);
    // Medal body
    p.fill(col);
    p.circle(x, y, r * 2);
    // Shine highlight
    p.fill(shine);
    p.circle(x - r * 0.28, y - r * 0.28, r * 0.7);
    // Label
    p.fill(0, 0, 0, 120);
    p.textAlign(p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(7);
    p.text(label, x, y + r + 10);
    p.textStyle(p.NORMAL);
  }

  _drawLeaderboard(cx, topY, cardW) {
    const p = this.p;
    const lb = this._leaderboard;

    p.textAlign(p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(9);
    p.noStroke();
    p.fill(180);
    p.text('── TOP SCORES ──', cx, topY);

    if (this._lbStatus === 'loading') {
      p.textStyle(p.NORMAL);
      p.textSize(9);
      p.fill(160);
      p.text('loading…', cx, topY + 16);
      return;
    }

    if (this._lbStatus === 'error' || lb.length === 0) {
      p.textStyle(p.NORMAL);
      p.textSize(9);
      p.fill(160);
      p.text('no scores yet', cx, topY + 16);
      return;
    }

    const rowH = 14;
    lb.forEach((entry, i) => {
      const rowY = topY + 14 + i * rowH;
      const isPlayer = this.newBest && entry.score === this.highscore && i === 0;
      p.textStyle(isPlayer ? p.BOLD : p.NORMAL);
      p.textSize(10);
      p.fill(isPlayer ? p.color(200, 145, 0) : p.color(50));
      p.textAlign(p.LEFT);
      p.text(`${i + 1}. ${entry.name}`, cx - cardW * 0.34, rowY);
      p.textAlign(p.RIGHT);
      p.text(entry.score, cx + cardW * 0.34, rowY);
    });
    p.textAlign(p.CENTER);
    p.textStyle(p.NORMAL);
  }

  async _fetchLeaderboard() {
    if (this._lbStatus !== 'idle') return;
    this._lbStatus = 'loading';
    try {
      this._leaderboard = await getTopScores(8);
      this._lbStatus = 'done';
    } catch (_) {
      this._lbStatus = 'error';
    }
  }

  async _triggerLeaderboard() {
    if (this._nameSubmitted) return;
    this._nameSubmitted = true;

    const raw = prompt('New best! Enter your initials (3 letters):', 'AAA');
    const name = raw ? raw.trim().slice(0, 3).toUpperCase() || 'AAA' : 'AAA';

    this._lbStatus = 'loading';
    try {
      await submitScore(name, this.highscore);
      this._leaderboard = await getTopScores(8);
      this._lbStatus = 'done';
    } catch (_) {
      this._lbStatus = 'error';
    }
  }
}
