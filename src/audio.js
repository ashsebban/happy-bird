export class Audio {
  constructor() { this._ctx = null; }

  _getCtx() {
    if (!this._ctx) this._ctx = new AudioContext();
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  _tone(freq, type, duration, gain, freqEnd = freq) {
    try {
      const ctx = this._getCtx();
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) { /* silently ignore if audio unavailable */ }
  }

  flap()    { this._tone(520, 'triangle', 0.08, 0.12, 420); }
  score()   { this._tone(880, 'sine',     0.10, 0.18); }
  death()   { this._tone(200, 'sawtooth', 0.35, 0.28, 60); }
  newBest() {
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => this._tone(f, 'sine', 0.14, 0.22), i * 110);
    });
  }
}
