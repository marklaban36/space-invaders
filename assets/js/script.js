const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_SPACE = 32;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const STATE = {
  x_pos : 0,
  y_pos : 0,
  move_right: false,
  move_left: false,
  shoot: false,
  lasers: [],
  enemyLasers: [],
  enemies : [],
  spaceship_width: 50,
  enemy_width: 50,
  cooldown : 0,
  number_of_enemies: 16,
  enemy_cooldown : 0,
  gameOver: false,
  currentLevel: 1,
  levelComplete: false
}

// Level configurations
const LEVELS = {
  1: {
    enemyCount: 16,
    enemySpeed: 1,
    enemyLaserSpeed: 2,
    enemyFireRate: 500,  // Higher number = less frequent shooting
    enemySize: 50
  },
  2: {
    enemyCount: 20,
    enemySpeed: 1.5,
    enemyLaserSpeed: 2.5,
    enemyFireRate: 400,  // Slightly more frequent than level 1
    enemySize: 45
  },
  3: {
    enemyCount: 24,
    enemySpeed: 2,
    enemyLaserSpeed: 3,
    enemyFireRate: 300,  // More frequent shooting
    enemySize: 40
  },
  4: {
    enemyCount: 28,
    enemySpeed: 2.5,
    enemyLaserSpeed: 3.5,
    enemyFireRate: 200,  // Even more frequent
    enemySize: 35
  },
  5: {
    enemyCount: 32,
    enemySpeed: 3,
    enemyLaserSpeed: 4,
    enemyFireRate: 100,   // Most frequent shooting
    enemySize: 30
  }
}
