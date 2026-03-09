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

  BACKGROUND: {
    CYCLE_DURATION_MS: 900000,     // 15 minutes = one full day/night cycle
    CLOUD_COUNT: 4,
    CLOUD_SCROLL_SPEED: 0.012,     // px per ms
    FAR_MOUNTAINS: [
      {x:0.00,y:0.62},{x:0.15,y:0.50},{x:0.30,y:0.58},
      {x:0.48,y:0.44},{x:0.65,y:0.55},{x:0.82,y:0.47},{x:1.00,y:0.62}
    ],
    NEAR_MOUNTAINS: [
      {x:0.00,y:0.70},{x:0.12,y:0.58},{x:0.28,y:0.66},
      {x:0.45,y:0.53},{x:0.60,y:0.62},{x:0.78,y:0.56},{x:1.00,y:0.70}
    ],
  },
};
