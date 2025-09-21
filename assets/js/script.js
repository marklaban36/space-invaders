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
  levelComplete: false,
  bossLevel: false,
  bossWave: 1,
  bossComplete: false
}

// Level configurations
const LEVELS = {
  1: {
    enemyCount: 5,
    enemySpeed: 1,
    enemyLaserSpeed: 2,
    enemyFireRate: 500,
    enemySize: 50,
    enemyImage: "assets/images/ufo.png"
  },
  2: {
    enemyCount: 5,
    enemySpeed: 1.5,
    enemyLaserSpeed: 2.5,
    enemyFireRate: 400,
    enemySize: 45,
    enemyImage: "assets/images/alien5.png"
  },
  3: {
    enemyCount: 5,
    enemySpeed: 2,
    enemyLaserSpeed: 3,
    enemyFireRate: 300,
    enemySize: 40,
    enemyImage: "assets/images/alien3.png"
  },
  4: {
    enemyCount: 5,
    enemySpeed: 2.5,
    enemyLaserSpeed: 3.5,
    enemyFireRate: 200,
    enemySize: 35,
    enemyImage: "assets/images/alien4.png"
  },
  5: {
    enemyCount: 5,
    enemySpeed: 3,
    enemyLaserSpeed: 4,
    enemyFireRate: 100,
    enemySize: 30,
    enemyImage: "assets/images/alien2.png"
  },
  boss: {
    enemySpeed: 2,
    enemyLaserSpeed: 3,
    enemyFireRate: 5000,
    waves: [
      { enemyCount: 5, enemySize: 60, enemyHealth: 5, enemyImage: "assets/images/alien4.png" },
      { enemyCount: 7, enemySize: 55, enemyHealth: 5, enemyImage: "assets/images/alien2.png" },
      { enemyCount: 9, enemySize: 50, enemyHealth: 5, enemyImage: "assets/images/alien3.png" }
    ],
    finalBoss: {
      enemySize: 120,
      enemyHealth: 15,
      enemySpeed: 4,
      enemyImage: "assets/images/alien1.png"
    }
  }
}

function getCurrentLevel() {
  if (STATE.bossLevel) {
    return LEVELS.boss;
  }
  return LEVELS[STATE.currentLevel] || LEVELS[5];
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
function createEnemy($container, x, y, health = 1, isFinalBoss = false){
  const level = getCurrentLevel();
  const $enemy = document.createElement("img");
  
  if (STATE.bossLevel && STATE.bossWave === 4) {
    // Final boss
    $enemy.src = level.finalBoss.enemyImage;
    setSize($enemy, level.finalBoss.enemySize);
  } else if (STATE.bossLevel) {
    // Boss wave enemies
    const currentWave = level.waves[STATE.bossWave - 1];
    $enemy.src = currentWave.enemyImage;
    setSize($enemy, currentWave.enemySize);
  } else {
    // Regular level enemies
    $enemy.src = level.enemyImage;
    setSize($enemy, level.enemySize);
  }
  
  $enemy.className = "enemy";
  $container.appendChild($enemy);
  
  const enemy_cooldown = Math.floor(Math.random() * level.enemyFireRate);
  const enemy = {
    x, 
    y, 
    $enemy, 
    enemy_cooldown, 
    health: health, 
    maxHealth: health,
    isFinalBoss: isFinalBoss
  };
  
  STATE.enemies.push(enemy);
  setPosition($enemy, x, y);
  
  // Add health indicator for enemies with more than 1 health
  if (health > 1) {
    createHealthBar($container, enemy);
  }
}

function createHealthBar($container, enemy) {
  const $healthBar = document.createElement("div");
  $healthBar.className = "health-bar";
  $healthBar.style.position = "absolute";
  $healthBar.style.width = "40px";
  $healthBar.style.height = "4px";
  $healthBar.style.backgroundColor = "red";
  $healthBar.style.border = "1px solid white";
  $container.appendChild($healthBar);
  
  const $healthFill = document.createElement("div");
  $healthFill.className = "health-fill";
  $healthFill.style.width = "100%";
  $healthFill.style.height = "100%";
  $healthFill.style.backgroundColor = "green";
  $healthBar.appendChild($healthFill);
  
  enemy.$healthBar = $healthBar;
  enemy.$healthFill = $healthFill;
  updateHealthBar(enemy);
}

function updateHealthBar(enemy) {
  if (enemy.$healthBar && enemy.$healthFill) {
    const healthPercent = (enemy.health / enemy.maxHealth) * 100;
    enemy.$healthFill.style.width = `${healthPercent}%`;
    
    // Position health bar above enemy
    const enemyRect = enemy.$enemy.getBoundingClientRect();
    const containerRect = document.querySelector(".main").getBoundingClientRect();
    setPosition(enemy.$healthBar, enemy.x - 20, enemy.y - 15);
  }
}

function updateEnemies($container){
  const level = getCurrentLevel();
  const enemies = STATE.enemies;
  
  for (let i = 0; i < enemies.length; i++){
    const enemy = enemies[i];
    let dx, dy;
    
    if (enemy.isFinalBoss) {
      // Final boss movement - faster and more aggressive
      dx = Math.sin(Date.now()/500) * 60;
      dy = Math.cos(Date.now()/800) * 40;
    } else {
      // Regular enemy movement
      dx = Math.sin(Date.now()/1000) * 40;
      dy = Math.cos(Date.now()/1000) * 30;
    }
    
    const speed = enemy.isFinalBoss ? level.finalBoss.enemySpeed : level.enemySpeed;
    const a = enemy.x + dx * speed;
    const b = enemy.y + dy * speed;
    
    setPosition(enemy.$enemy, a, b);
    updateHealthBar(enemy);
    
    // Enemy shooting
    if (enemy.enemy_cooldown <= 0){
      if (Math.random() < 0.3) {
        createEnemyLaser($container, a, b);
        enemy.enemy_cooldown = Math.floor(Math.random() * level.enemyFireRate) + level.enemyFireRate/2;
      }
    }
    enemy.enemy_cooldown -= 1;
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
        
        // Damage enemy
        enemy.health--;
        updateHealthBar(enemy);
        
        // Remove enemy if health reaches 0
        if (enemy.health <= 0) {
          const index = enemies.indexOf(enemy);
          enemies.splice(index, 1);
          $container.removeChild(enemy.$enemy);
          if (enemy.$healthBar) {
            $container.removeChild(enemy.$healthBar);
          }
        }
        break;
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

// Boss Level Functions
function startBossLevel() {
  STATE.bossLevel = true;
  STATE.bossWave = 1;
  STATE.levelComplete = false;
  createBossWave($container);
  updateLevelDisplay();
}

function createBossWave($container) {
  const level = getCurrentLevel();
  
  if (STATE.bossWave === 4) {
    // Final boss
    const finalBoss = level.finalBoss;
    const x = GAME_WIDTH / 2 - finalBoss.enemySize / 2;
    const y = 100;
    createEnemy($container, x, y, finalBoss.enemyHealth, true);
  } else {
    // Regular boss waves
    const currentWave = level.waves[STATE.bossWave - 1];
    const enemiesPerRow = Math.ceil(Math.sqrt(currentWave.enemyCount));
    const spacing = GAME_WIDTH / (enemiesPerRow + 1);
    
    for(let i = 0; i < currentWave.enemyCount; i++){
      const row = Math.floor(i / enemiesPerRow);
      const col = i % enemiesPerRow;
      const x = (col + 1) * spacing - currentWave.enemySize/2;
      const y = 100 + row * 80;
      createEnemy($container, x, y, currentWave.enemyHealth);
    }
  }
}

function nextBossWave() {
  // Clear existing enemies and lasers
  STATE.enemies.forEach(enemy => {
    $container.removeChild(enemy.$enemy);
    if (enemy.$healthBar) {
      $container.removeChild(enemy.$healthBar);
    }
  });
  STATE.enemies = [];
  
  STATE.enemyLasers.forEach(laser => {
    $container.removeChild(laser.$enemyLaser);
  });
  STATE.enemyLasers = [];
  
  STATE.bossWave++;
  STATE.levelComplete = false; // Reset level complete flag
  
  if (STATE.bossWave <= 3) {
    // Waves 1, 2, and 3
    createBossWave($container);
    updateLevelDisplay();
  } else if (STATE.bossWave === 4) {
    // Final boss wave
    createBossWave($container);
    updateLevelDisplay();
  } else {
    // Boss level complete (after final boss is defeated)
    STATE.bossComplete = true;
    document.querySelector(".boss-complete").style.display = "block";
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
  } else if (STATE.enemies.length == 0 && !STATE.levelComplete && !STATE.bossComplete) {
    STATE.levelComplete = true;
    
    if (STATE.bossLevel && STATE.bossWave < 4) {
      // Next boss wave (waves 1, 2, 3)
      document.querySelector(".next-wave").style.display = "block";
    } else if (STATE.bossLevel && STATE.bossWave === 4) {
      // Final boss defeated
      STATE.bossComplete = true;
      document.querySelector(".boss-complete").style.display = "block";
    } else if (STATE.currentLevel < 5) {
      // Next regular level
      document.querySelector(".next-level").style.display = "block";
    } else {
      // Start boss level
      document.querySelector(".boss-level").style.display = "block";
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
    if (STATE.bossLevel) {
      if (STATE.bossWave === 4) {
        levelDisplay.textContent = `BOSS LEVEL - Final Boss`;
      } else {
        levelDisplay.textContent = `BOSS LEVEL - Wave ${STATE.bossWave}`;
      }
    } else {
      levelDisplay.textContent = `Level: ${STATE.currentLevel}`;
    }
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