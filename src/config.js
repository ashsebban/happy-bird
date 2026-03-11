export const CONFIG = {
  WIDTH: 350,
  HEIGHT: 650,
  GROUND_HEIGHT: 24,

  BIRD: {
    WIDTH: 44,
    HEIGHT: 44,
    X: 87.5,
    GRAVITY: 0.65,
    JUMP_FORCE: 6.5,
    MAX_FALL: 13,
  },

  PIPE: {
    WIDTH: 50,
    SPEED_INITIAL:  2,
    SPEED_MAX:      3.5,
    SPEED_INCREMENT: 0.25,
    SPEED_INTERVAL: 10,   // pipes between speed bumps
    get LENGTH() { return CONFIG.HEIGHT / 3; },
    get ORN_WIDTH() { return CONFIG.PIPE.WIDTH + CONFIG.PIPE.WIDTH / 10; },
    get ORN_HEIGHT() { return CONFIG.PIPE.LENGTH / 12; },
  },

  BACKGROUND: {
    CYCLE_DURATION_MS: 900000,     // 15 minutes = one full day/night cycle
    CLOUD_COUNT: 4,
    CLOUD_SCROLL_SPEED: 0.012,     // px per ms
    // Three hill layers — far to near. Y values are 0–1 fractions of HEIGHT.
    // Atmospheric perspective: far = pale/hazy, near = dark/saturated.
    FAR_MOUNTAINS: [
      {x:0.00,y:0.68},{x:0.16,y:0.56},{x:0.34,y:0.63},
      {x:0.52,y:0.52},{x:0.70,y:0.60},{x:0.86,y:0.55},{x:1.00,y:0.68}
    ],
    MID_MOUNTAINS: [
      {x:0.00,y:0.74},{x:0.13,y:0.65},{x:0.28,y:0.71},
      {x:0.44,y:0.62},{x:0.60,y:0.69},{x:0.76,y:0.64},{x:1.00,y:0.74}
    ],
    NEAR_MOUNTAINS: [
      {x:0.00,y:0.82},{x:0.10,y:0.74},{x:0.24,y:0.79},
      {x:0.38,y:0.71},{x:0.54,y:0.77},{x:0.68,y:0.73},{x:0.84,y:0.78},{x:1.00,y:0.82}
    ],
  },
};
