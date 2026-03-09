import { Game } from './game.js';

const sketch = (p) => {
  const game = new Game(p);

  p.setup        = () => game.setup();
  p.draw         = () => game.draw();
  p.keyPressed   = () => game.handleKeyPressed();
  p.mousePressed = () => game.handleMousePressed();
  p.touchStarted = () => game.handleMousePressed();
};

new p5(sketch);
