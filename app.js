import { Game } from "./modules/Game.js";

const app = document.querySelector("#app");
const map = document.querySelector("#map");
const scoreBoard = document.createElement("div");
const scoreCounter = document.createElement("span");
const player = document.createElement("div");
const outerMenu = document.createElement("div");
const menu = document.createElement("div");
const menuTitle = document.createElement("div");
const personalBestDiv = document.createElement("div");
const gamesPlayedDiv = document.createElement("div");
const playGame = document.createElement("div");
const increasePlayerSensitivity = document.createElement("span");
const decreasePlayerSensitivity = document.createElement("span");

let game = new Game();

let PLAYER_SENSITIVITY = window.innerWidth * game.STEP_WIDTH;
const MIN_BACKGROUND_INTERVAL = 150;
const MAX_BACKGROUND_INTERVAL = 50;
const roadColor = "#636164"

let backgroundInterval;
let bestScoreCookie = getCookie("bestScore");
let gamesPlayedCookie = getCookie("gamesPlayed");
let bestScore = bestScoreCookie === null ? 0 : parseInt(bestScoreCookie);
let gamesPlayed = gamesPlayedCookie === null ? 0 : parseInt(gamesPlayedCookie);

initialHtmlSetUp();


// listeners for moving object
const keyState = {};
window.addEventListener("keydown", function (e) {
    keyState[e.code] = true;
  }, true
);
window.addEventListener("keyup", function (e) {
    keyState[e.code] = false;
  }, true
);

// menu listeners
playGame.addEventListener('click', () => {
  if (game.isOver) {
    continouseHtmlSetUp();
  }
  closeMenu();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Escape" || e.code === "Space") {
    if (game.isOver) return;
    if (game.isPaused) {
      closeMenu();
    } else {
      playGame.innerHTML = "continue";
      openMenu();
    }
  }
});

// sensitivity listeners
decreasePlayerSensitivity.addEventListener("click", () => {
  PLAYER_SENSITIVITY = PLAYER_SENSITIVITY * 0.75;
});
increasePlayerSensitivity.addEventListener("click", () => {
  PLAYER_SENSITIVITY = PLAYER_SENSITIVITY * 1.25;
});

// generates background
function backGroundMover() {

  setTimeout(function () {
    if (!game.isPaused && !game.isOver) {
      generateNewFrame();
      scoreCounter.innerHTML = `${game.score} x `;
    }
    backGroundMover();
  }, backgroundInterval);
}
backGroundMover();


// player movement
setInterval(() => {
  if (!game.isPaused && !game.isOver) {
    movementLoop();
    checkPlayerLocation();
  }
}, 10);


function movementLoop() {
  if (keyState["KeyA"] || keyState["ArrowLeft"]) {
    movePlayerLeft();
  }
  if (keyState["KeyD"] || keyState["ArrowRight"]) {
    movePlayerRight();
  }
  if (keyState["KeyW"] || keyState["ArrowUp"]) {
    movePlayerUp();
  }
  if (keyState["KeyS"] || keyState["ArrowDown"]) {
    movePlayerDown();
  }
}


function checkPlayerLocation() {
  let playerTopLeft = document.elementsFromPoint(player.offsetLeft, player.offsetTop);
  let playerTopRight = document.elementsFromPoint(player.offsetLeft + player.offsetWidth, player.offsetTop);
  let playerBottomLeft = document.elementsFromPoint(player.offsetLeft, player.offsetTop + player.offsetHeight);
  let playerBottomRight = document.elementsFromPoint(player.offsetLeft + player.offsetWidth, player.offsetTop + player.offsetHeight);
  let playerMiddle = document.elementsFromPoint(player.offsetLeft + player.offsetWidth / 2, player.offsetTop + player.offsetHeight / 2);

  if (
    playerTopLeft.find((x) => x.classList.contains("off-road")) ||
    playerTopRight.find((x) => x.classList.contains("off-road")) ||
    playerBottomLeft.find((x) => x.classList.contains("off-road")) ||
    playerBottomRight.find((x) => x.classList.contains("off-road")) ||
    playerMiddle.find((x) => x.classList.contains("off-road"))
  ) {
    endGame();
    return;
  }

  if (
    playerTopLeft.find((x) => x.classList.contains("trap")) ||
    playerTopRight.find((x) => x.classList.contains("trap")) ||
    playerBottomLeft.find((x) => x.classList.contains("trap")) ||
    playerBottomRight.find((x) => x.classList.contains("trap")) ||
    playerMiddle.find((x) => x.classList.contains("trap"))
  ) {
    endGame();
    return;
  }

  document.querySelectorAll('.gold').forEach(gold => {
    if (
      playerTopLeft.find(x => x === gold) ||
      playerTopRight.find(x => x === gold) ||
      playerBottomLeft.find(x => x === gold) ||
      playerBottomRight.find(x => x === gold) ||
      playerMiddle.find(x => x === gold)
    ) {
      gold.remove();
      game.score++;
    }
  });
}


function generateNewFrame() {
  game.map.splice(0, 1);
  game.generateRow();

  let elementToBeRemoved = map.lastElementChild;

  map.removeChild(elementToBeRemoved);
  generateRowDiv(game.map[game.map.length - 1], game.map[game.map.length - 2]);
}


function endGame() {
  game.isOver = true;
  menuTitle.innerHTML = "Game over";
  playGame.innerHTML = "play";
  bestScore = bestScore < game.score ? game.score : bestScore;
  setCookie("bestScore", bestScore);
  setCookie("gamesPlayed", ++gamesPlayed);

  openMenu();
}


function openMenu() {
  personalBestDiv.innerHTML = bestScore;
  gamesPlayedDiv.innerHTML = gamesPlayed;
  outerMenu.style.display = "flex";
  game.isPaused = true;
  app.style.animationPlayState = "paused"; 
}


function closeMenu() {
  outerMenu.style.display = "none";
  game.isPaused = false;
  app.style.animationPlayState = "running";
  menuTitle.innerHTML = "Racing game";
}


function playerPositionSetUp() {
  player.style.width = (game.ROAD_WIDTH / 2 - game.TRAP_SIZE / 2) / 2 * 100 + "%";
  player.style.left = window.innerWidth / 2 - player.offsetWidth / 2 + "px";
  player.style.top = window.innerHeight - player.offsetWidth * 1.2 + "px";
}


function movePlayerLeft() {
  let x = player.offsetLeft;
  if (x > PLAYER_SENSITIVITY) {
    player.style.left = x - PLAYER_SENSITIVITY + "px";
  }
}


function movePlayerRight() {
  let x = player.offsetLeft;
  if (x < window.innerWidth - player.offsetWidth - PLAYER_SENSITIVITY) {
    player.style.left = x + PLAYER_SENSITIVITY + "px";
  }
}


function movePlayerUp() {
  let y = player.offsetTop;
  if (y > PLAYER_SENSITIVITY) {
    player.style.top = y - PLAYER_SENSITIVITY + "px";
  }
  setSpeed();
}


function movePlayerDown() {
  let y = player.offsetTop;
  if (y < window.innerHeight - player.offsetHeight - PLAYER_SENSITIVITY) {
    player.style.top = y + PLAYER_SENSITIVITY + "px";
  }
  setSpeed();
}


function setSpeed() {
  let heightPercentage = player.offsetTop / (window.innerHeight - player.offsetHeight);
  backgroundInterval = MAX_BACKGROUND_INTERVAL + (heightPercentage * (MIN_BACKGROUND_INTERVAL - MAX_BACKGROUND_INTERVAL));
  // app.style.animationDuration = 5 + (heightPercentage * (10 - 5)) + "s";
}


function initialHtmlSetUp() {
  let goldPhoto = document.createElement("span");
  let sensitivityBox = document.createElement("div");
  let menuLeftBox = document.createElement("div");
  let menuRightBox = document.createElement("div");
  let personalBestDivText = document.createElement("div");
  let gamesPlayedDivText = document.createElement("div");
  let sensitivityBoxText = document.createElement("div");
  let innerMenu = document.createElement("div");

  scoreCounter.innerHTML = `0 x `;
  playGame.innerHTML = "Play";
  menuTitle.innerHTML = "Racing game";
  decreasePlayerSensitivity.innerHTML = "-";
  increasePlayerSensitivity.innerHTML = "+";
  personalBestDivText.innerHTML = "High score";
  gamesPlayedDivText.innerHTML = "Games played";
  sensitivityBoxText.innerHTML = "Sensitivity";

  scoreBoard.classList.add("score");
  goldPhoto.classList.add("gold");
  goldPhoto.classList.add("gold-counter");
  playGame.classList.add("play-button");
  outerMenu.classList.add("outer-menu");
  menu.classList.add("menu");
  menuTitle.classList.add('title');
  decreasePlayerSensitivity.classList.add("sensitivity-button");
  increasePlayerSensitivity.classList.add("sensitivity-button");
  player.id = "player";
  innerMenu.style.display = "inline-flex";

  sensitivityBox.append(decreasePlayerSensitivity);
  sensitivityBox.append(increasePlayerSensitivity);
  menuLeftBox.appendChild(personalBestDivText);
  menuLeftBox.appendChild(gamesPlayedDivText);
  menuLeftBox.appendChild(sensitivityBoxText);
  menuRightBox.appendChild(personalBestDiv);
  menuRightBox.appendChild(gamesPlayedDiv);
  menuRightBox.appendChild(sensitivityBox);
  innerMenu.appendChild(menuLeftBox);
  innerMenu.appendChild(menuRightBox);

  scoreBoard.appendChild(scoreCounter);
  scoreBoard.appendChild(goldPhoto);
  outerMenu.appendChild(menu);
  menu.append(menuTitle);
  menu.appendChild(innerMenu);
  menu.append(playGame);
  app.prepend(scoreBoard);
  app.prepend(player);
  app.prepend(outerMenu);


  continouseHtmlSetUp();
  openMenu();
}


function continouseHtmlSetUp() {
  backgroundInterval = MIN_BACKGROUND_INTERVAL;
  map.innerHTML = "";

  game = new Game();
  for (let i = 0; i < game.map.length; i++) {
    if (i === 0) {
      generateRowDiv(game.map[i], null);
    } else {
      generateRowDiv(game.map[i], game.map[i - 1]);
    }
  }
  playerPositionSetUp();
}


function generateRowDiv(gameRow, previousGameRow) {
  const rowDiv = document.createElement("div");
  const leftDiv = document.createElement("div");
  const roadDiv = document.createElement("div");
  const parentRoadDiv = document.createElement("div");
  const rightDiv = document.createElement("div");

  const roadLeftTriangle = document.createElement("div");
  const roadRightTriangle = document.createElement("div");

  let leftRoadSide = document.createElement("div");
  let rightRoadSide = document.createElement("div");

  roadLeftTriangle.style.width = 0;
  roadLeftTriangle.style.height = 0;
  roadRightTriangle.style.width = 0;
  roadRightTriangle.style.height = 0;


  if (previousGameRow !== null) {
    roadLeftTriangle.style.borderLeft = window.innerWidth * game.STEP_WIDTH + 'px solid transparent';
    if (gameRow.leftSide < previousGameRow.leftSide) {
      roadLeftTriangle.style.borderTop = window.innerHeight / game.ROW_COUNT + `px solid ${gameRow.sideColor}`;
    } else {
      roadLeftTriangle.style.borderBottom = window.innerHeight / game.ROW_COUNT + `px solid ${gameRow.sideColor}`;
    }

    roadRightTriangle.style.borderRight = window.innerWidth * game.STEP_WIDTH + 'px solid transparent';
    if (gameRow.leftSide < previousGameRow.leftSide) {
      roadRightTriangle.style.borderBottom = window.innerHeight / game.ROW_COUNT + `px solid ${gameRow.sideColor}`;
    } else {
      roadRightTriangle.style.borderTop = window.innerHeight / game.ROW_COUNT + `px solid ${gameRow.sideColor}`;
    }
    leftRoadSide = roadRightTriangle.cloneNode(true);
    rightRoadSide = roadLeftTriangle.cloneNode(true);
    leftRoadSide.style.borderRightColor = roadColor;
    rightRoadSide.style.borderLeftColor = roadColor;
  }


  rowDiv.classList.add("row");
  leftDiv.classList.add("off-road");
  rightDiv.classList.add("off-road");
  roadDiv.classList.add("road");
  parentRoadDiv.classList.add("parent-road");

  leftDiv.style.width = gameRow.leftSide * 100 + "%";
  parentRoadDiv.style.width = gameRow.road * 100 + "%";
  rightDiv.style.width = gameRow.rightSide * 100 + "%";
  rowDiv.style.height = window.innerHeight / game.ROW_COUNT + "px";

  parentRoadDiv.appendChild(roadLeftTriangle);
  parentRoadDiv.appendChild(leftRoadSide);
  parentRoadDiv.appendChild(roadDiv);
  parentRoadDiv.appendChild(rightRoadSide);
  parentRoadDiv.appendChild(roadRightTriangle);

  if (gameRow.trap) {
    const trapDiv = document.createElement("div");
    trapDiv.classList.add("trap");
    roadDiv.appendChild(trapDiv);
    let margin = Math.random() * (1 - game.TRAP_SIZE);
    trapDiv.style.marginLeft = margin * 100 + "%";
    trapDiv.style.width = game.TRAP_SIZE * 100 + "%";
  }

  if (gameRow.gold) {
    const goldDiv = document.createElement("div");
    goldDiv.classList.add("gold");
    roadDiv.appendChild(goldDiv);
    let margin = Math.random() * (1 - game.GOLD_SIZE);
    goldDiv.style.marginLeft = margin * 100 + "%";
    goldDiv.style.width = game.GOLD_SIZE * 100 + "%";
  }

  rowDiv.appendChild(leftDiv);
  rowDiv.appendChild(parentRoadDiv);
  rowDiv.appendChild(rightDiv);
  map.prepend(rowDiv);
}

function setCookie(name, val) {
  document.cookie = `${name}=${val}`;
}

function getCookie(name) {
  let val = document.cookie;
  let startIndex = val.indexOf(`${name}=`);

  if (startIndex != -1) {
    let endIndex = val.indexOf(";", startIndex);
    endIndex = endIndex !== -1 ? endIndex : val.length;
    val = val.substring(startIndex + name.length + 1, endIndex);
    return val;
  }
  return null;
}