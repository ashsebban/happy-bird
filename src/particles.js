export class Particles {
  constructor(p) {
    this.p = p;
    this._list = [];
  }

  burst(x, y) {
    const p = this.p;
    for (let i = 0; i < 12; i++) {
      this._list.push({
        x, y,
        vx:    p.random(-4.5, 4.5),
        vy:    p.random(-7, -1),
        size:  p.random(5, 11),
        rot:   p.random(p.TWO_PI),
        rotV:  p.random(-0.18, 0.18),
        life:  1.0,
        decay: p.random(0.016, 0.028),
        yellow: p.random() < 0.70,
      });
    }
  }

  update() {
    for (const pt of this._list) {
      pt.x   += pt.vx;
      pt.y   += pt.vy;
      pt.vy  += 0.28;
      pt.vx  *= 0.97;
      pt.rot += pt.rotV;
      pt.life -= pt.decay;
    }
    this._list = this._list.filter(pt => pt.life > 0);
  }

  draw() {
    const p = this.p;
    for (const pt of this._list) {
      p.push();
      p.translate(pt.x, pt.y);
      p.rotate(pt.rot);
      p.noStroke();
      const alpha = pt.life * 255;
      p.fill(pt.yellow ? p.color(255, 220, 55, alpha) : p.color(255, 255, 255, alpha));
      p.ellipse(0, 0, pt.size, pt.size * 0.42);
      p.pop();
    }
  }

  clear() { this._list = []; }
}
