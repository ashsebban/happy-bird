export const CONFIG = {
  WIDTH: 350,
  HEIGHT: 650,

  BIRD: {
    WIDTH: 40,
    HEIGHT: 36,      // width * 0.9
    X: 87.5,         // 0.25 * WIDTH
    FALL_SPEED: 6.5,
    FALL_SPEED_RESET: 8,
    JUMP_SPEED: 9.75, // 6.5 * 1.5
  },

  PIPE: {
    WIDTH: 50,
    SPEED: 2,
    get LENGTH() { return CONFIG.HEIGHT / 3; },
    get ORN_WIDTH() { return CONFIG.PIPE.WIDTH + CONFIG.PIPE.WIDTH / 10; },
    get ORN_HEIGHT() { return CONFIG.PIPE.LENGTH / 12; },
  },
};
