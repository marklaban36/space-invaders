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

function getCurrentLevel() {
  return LEVELS[STATE.currentLevel] || LEVELS[5]; // Default to level 5 if beyond defined levels
}

// General purpose functions
function setPosition($element, x, y) {
  $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width) {
  $element.style.width = `${width}px`;
  $element.style.height = "auto";
}

function bound(x){
  if (x >= GAME_WIDTH-STATE.spaceship_width){
    STATE.x_pos = GAME_WIDTH-STATE.spaceship_width;
    return GAME_WIDTH-STATE.spaceship_width
  } if (x <= 0){
    STATE.x_pos = 0;
    return 0
  } else {
    return x;
  }
}

function collideRect(rect1, rect2){
  return!(rect2.left > rect1.right || 
    rect2.right < rect1.left || 
    rect2.top > rect1.bottom || 
    rect2.bottom < rect1.top);
}

// Enemy 
function createEnemy($container, x, y){
  const level = getCurrentLevel();
  const $enemy = document.createElement("img");
  $enemy.src = "assets/images/ufo.png";
  $enemy.className = "enemy";
  $container.appendChild($enemy);
  // Start with random cooldown so enemies don't all shoot at once
  const enemy_cooldown = Math.floor(Math.random() * level.enemyFireRate);
  const enemy = {x, y, $enemy, enemy_cooldown}
  STATE.enemies.push(enemy);
  setSize($enemy, level.enemySize);
  setPosition($enemy, x, y)
}

function updateEnemies($container){
  const level = getCurrentLevel();
  const dx = Math.sin(Date.now()/1000)*40;
  const dy = Math.cos(Date.now()/1000)*30;
  const enemies = STATE.enemies;
  for (let i = 0; i < enemies.length; i++){
    const enemy = enemies[i];
    var a = enemy.x + dx * level.enemySpeed;
    var b = enemy.y + dy * level.enemySpeed;
    setPosition(enemy.$enemy, a, b);
    
    // Only shoot if cooldown reaches 0
    if (enemy.enemy_cooldown <= 0){
      // Add random chance to make shooting less predictable
      if (Math.random() < 0.3) {  // 30% chance to shoot when cooldown is ready
        createEnemyLaser($container, a, b);
        enemy.enemy_cooldown = Math.floor(Math.random() * level.enemyFireRate) + level.enemyFireRate/2;
      }
    }
    enemy.enemy_cooldown -= 1;  // Decrease cooldown each frame
  }
}

// Player
function createPlayer($container) {
  STATE.x_pos = GAME_WIDTH / 2;
  STATE.y_pos = GAME_HEIGHT - 50;
  const $player = document.createElement("img");
  $player.src = "assets/images/spaceship.png";
  $player.className = "player";
  $container.appendChild($player);
  setPosition($player, STATE.x_pos, STATE.y_pos);
  setSize($player, STATE.spaceship_width);
}

function updatePlayer(){
  if(STATE.move_left){
    STATE.x_pos -= 3;
  } if(STATE.move_right){
    STATE.x_pos += 3;
  } if(STATE.shoot && STATE.cooldown == 0){
    createLaser($container, STATE.x_pos - STATE.spaceship_width/2, STATE.y_pos);
    STATE.cooldown = 30;
  }
  const $player = document.querySelector(".player");
  setPosition($player, bound(STATE.x_pos), STATE.y_pos-10);
  if(STATE.cooldown > 0){
    STATE.cooldown -= 0.5;
  }
}

// Player Laser
function createLaser($container, x, y){
  const $laser = document.createElement("img");
  $laser.src = "assets/images/laser.png";
  $laser.className = "laser";
  $container.appendChild($laser);
  const laser = {x, y, $laser};
  STATE.lasers.push(laser);
  setPosition($laser, x, y);
}

function updateLaser($container){
  const lasers = STATE.lasers;
  for(let i = 0; i < lasers.length; i++){
    const laser = lasers[i];
    laser.y -= 2;
    if (laser.y < 0){
      deleteLaser(lasers, laser, laser.$laser);
    }
    setPosition(laser.$laser, laser.x, laser.y);
    const laser_rectangle = laser.$laser.getBoundingClientRect();
    const enemies = STATE.enemies;
    for(let j = 0; j < enemies.length; j++){
      const enemy = enemies[j];
      const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
      if(collideRect(enemy_rectangle, laser_rectangle)){
        deleteLaser(lasers, laser, laser.$laser);
        const index = enemies.indexOf(enemy);
        enemies.splice(index,1);
        $container.removeChild(enemy.$enemy);
      }
    }
  }
}

// Enemy Laser
function createEnemyLaser($container, x, y){
  const $enemyLaser = document.createElement("img");
  $enemyLaser.src = "assets/images/enemyLaser.png";
  $enemyLaser.className = "enemyLaser";
  $container.appendChild($enemyLaser);
  const enemyLaser = {x, y, $enemyLaser};
  STATE.enemyLasers.push(enemyLaser);
  setPosition($enemyLaser, x, y);
}

function updateEnemyLaser($container){
  const level = getCurrentLevel();
  const enemyLasers = STATE.enemyLasers;
  for(let i = 0; i < enemyLasers.length; i++){
    const enemyLaser = enemyLasers[i];
    enemyLaser.y += level.enemyLaserSpeed;
    if (enemyLaser.y > GAME_HEIGHT-30){
      deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
    }
    const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
    const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
    if(collideRect(spaceship_rectangle, enemyLaser_rectangle)){
      STATE.gameOver = true;
    }
    setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width/2, enemyLaser.y+15);
  }
}

// Delete Laser
function deleteLaser(lasers, laser, $laser){
  const index = lasers.indexOf(laser);
  lasers.splice(index,1);
  $container.removeChild($laser);
}

// Key Presses
function KeyPress(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = true;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = true;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = true;
  }
}

function KeyRelease(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = false;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = false;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = false;
  }
}

// Main Update Function
function update(){
  updatePlayer();
  updateEnemies($container);
  updateLaser($container);
  updateEnemyLaser($container);

  window.requestAnimationFrame(update);
  
  if (STATE.gameOver) {
    document.querySelector(".lose").style.display = "block";
  } else if (STATE.enemies.length == 0 && !STATE.levelComplete) {
    STATE.levelComplete = true;
    if (STATE.currentLevel < 5) {
      document.querySelector(".next-level").style.display = "block";
    } else {
      document.querySelector(".win").style.display = "block";
    }
  }
}

function nextLevel() {
  STATE.currentLevel++;
  STATE.levelComplete = false;
  
  // Clear existing enemies and lasers
  STATE.enemies.forEach(enemy => {
    $container.removeChild(enemy.$enemy);
  });
  STATE.enemies = [];
  
  STATE.enemyLasers.forEach(laser => {
    $container.removeChild(laser.$enemyLaser);
  });
  STATE.enemyLasers = [];
  
  // Create new enemies for the next level
  createEnemies($container);
  
  // Update level display
  updateLevelDisplay();
}

function updateLevelDisplay() {
  const levelDisplay = document.querySelector(".level-display");
  if (levelDisplay) {
    levelDisplay.textContent = `Level: ${STATE.currentLevel}`;
  }
}

function createEnemies($container) {
  const level = getCurrentLevel();
  STATE.number_of_enemies = level.enemyCount;
  
  const enemiesPerRow = Math.ceil(Math.sqrt(level.enemyCount));
  const spacing = GAME_WIDTH / (enemiesPerRow + 1);
  
  for(let i = 0; i < level.enemyCount; i++){
    const row = Math.floor(i / enemiesPerRow);
    const col = i % enemiesPerRow;
    const x = (col + 1) * spacing - level.enemySize/2;
    const y = 100 + row * 80;
    createEnemy($container, x, y);
  }
}

// Initialize the Game
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);
updateLevelDisplay();

// Key Press Event Listener
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);
update();