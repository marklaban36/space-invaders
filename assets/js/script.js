let gameArea = document.getElementById("game-area");
let statusText = document.getElementById("status");
let player, invaders = [], bullets = [], score = 0;
let gameInterval, invaderDirection = 1;
let invaderDropSpeed = 10; // descent speed in pixels

function startGame() {
  gameArea.innerHTML = "";
  score = 0;
  statusText.textContent = "Score: 0";
  invaders = [];
  bullets = [];

  // Create player
  player = document.createElement("div");
  player.classList.add("player");
  player.style.left = "280px";
  gameArea.appendChild(player);

  // Create invaders
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      let invader = document.createElement("div");
      invader.classList.add("invader");
      invader.style.top = `${row * 30}px`;
      invader.style.left = `${col * 70}px`;
      gameArea.appendChild(invader);
      invaders.push(invader);
    }
  }

  document.addEventListener("keydown", handleKey);
  gameInterval = setInterval(gameLoop, 50);
}

function handleKey(e) {
  let left = parseInt(player.style.left);
  if (e.key === "ArrowLeft" && left > 0) {
    player.style.left = `${left - 20}px`;
  } else if (e.key === "ArrowRight" && left < 560) {
    player.style.left = `${left + 20}px`;
  } else if (e.key === " " || e.key === "ArrowUp") {
    shootBullet();
  }
}

function shootBullet() {
  let bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = `${parseInt(player.style.left) + 17}px`;
  bullet.style.bottom = "30px";
  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

function gameLoop() {
  // Move bullets
  bullets.forEach((bullet, i) => {
    let bottom = parseInt(bullet.style.bottom);
    bullet.style.bottom = `${bottom + 10}px`;
    if (bottom > 400) {
      bullet.remove();
      bullets.splice(i, 1);
    }
  });

  // Move invaders
  let edgeReached = false;
  invaders.forEach(inv => {
    let left = parseInt(inv.style.left);
    inv.style.left = `${left + invaderDirection * 5}px`;
    if (left <= 0 || left >= 570) edgeReached = true;
  });

  if (edgeReached) {
    invaderDirection *= -1;
    invaders.forEach(inv => {
      inv.style.top = `${parseInt(inv.style.top) + invaderDropSpeed}px`;
      if (parseInt(inv.style.top) > 350) endGame("Game Over!");
    });
  }

  // Collision detection
  bullets.forEach((bullet, bi) => {
    let bLeft = parseInt(bullet.style.left);
    let bBottom = parseInt(bullet.style.bottom);

    invaders.forEach((inv, ii) => {
      if (!inv) return; // skip removed invaders

      let iLeft = parseInt(inv.style.left);
      let iTop = parseInt(inv.style.top);

      if (
        bLeft > iLeft &&
        bLeft < iLeft + 30 &&
        400 - bBottom > iTop &&
        400 - bBottom < iTop + 20
      ) {
        bullet.remove();
        bullets.splice(bi, 1);

        inv.remove();
        invaders[ii] = null; // mark for cleanup

        score += 10;
        statusText.textContent = `Score: ${score}`;
      }
    });
  });

  // Clean up null invaders
  invaders = invaders.filter(inv => inv !== null);

  if (invaders.length === 0) endGame("You Win!");
}

function endGame(message) {
  clearInterval(gameInterval);
  document.removeEventListener("keydown", handleKey);
  alert(message);
}
