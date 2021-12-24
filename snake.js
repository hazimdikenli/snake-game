const canvas = document.getElementById('canvas');
const ROWS = 20;
const COLS = 30;
const PIXELSIZE = 20;
const pixels = {};
let snakePos = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
];
let prevPos = [];
let snakeDir = 'right';
let paused = false;
let reward = { row: undefined, col: undefined };
function initializeCanvas() {
  canvas.replaceChildren([]);
  canvas.style.width = (PIXELSIZE * COLS) + 'px';
  canvas.style.height = (ROWS * PIXELSIZE) + 'px';
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let pixel = document.createElement('div');
      pixel.title = `${row}:${col}`;
      let style = {
        position: 'absolute',
        border: '1px solid red',
      };
      style.top = row * PIXELSIZE + 'px';
      style.left = col * PIXELSIZE + 'px';
      style.height = PIXELSIZE + 'px';
      style.width = PIXELSIZE + 'px';
      pixel.setAttribute('data-pos', `${row}:${col}`);
      Object.assign(pixel.style, style);
      // pixel.innerText=(row * COLS) + col;
      pixels[row * COLS + col] = pixel;
      canvas.appendChild(pixel);
    }
  }
}

function drawSnake(snake) {
  if (prevPos.length) {
    for (let i = 0; i < prevPos.length; i++) {
      let [row, col] = prevPos[i];
      clearPixelAt(row, col);
    }
  }
  prevPos = snake.slice();
  for (let i = 0; i < snake.length; i++) {
    let [row, col] = snake[i];
    fillPixelAt(row, col);
  }
  if (reward && reward.row) {
    getPixel(reward.row, reward.col).style.backgroundColor = 'green';
  }
}

const changeDirectionUp = () => {
  if (snakeDir !== 'left' && snakeDir !== 'right') return;
  snakePos.shift();
  let head = snakePos[snakePos.length - 1];
  snakePos.push([head[0] - 1, head[1]]);
  snakeDir = 'up';
  // console.log('newpos', snakePos);
};
const changeDirectionDown = () => {
  if (snakeDir !== 'left' && snakeDir !== 'right') return;
  snakePos.shift();
  let head = snakePos[snakePos.length - 1];
  snakePos.push([head[0] + 1, head[1]]);
  snakeDir = 'down';
};
const changeDirectionRight = () => {
  if (snakeDir !== 'up' && snakeDir !== 'down') return;
  snakePos.shift();
  let head = snakePos[snakePos.length - 1];
  snakePos.push([head[0], head[1] + 1]);
  snakeDir = 'right';
};
const changeDirectionLeft = () => {
  if (snakeDir !== 'up' && snakeDir !== 'down') return;
  snakePos.shift();
  let head = snakePos[snakePos.length - 1];
  snakePos.push([head[0], head[1] - 1]);
  snakeDir = 'left';
};
const moveSnake = () => {
  if (paused) return;
  snakePos.shift();
  let [row, col] = snakePos[snakePos.length - 1];
  switch (snakeDir) {
    case 'left':
      snakePos.push([row, col - 1]);
      break;
    case 'right':
      snakePos.push([row, col + 1]);
      break;
    case 'up':
      snakePos.push([row - 1, col]);
      break;
    case 'down':
      snakePos.push([row + 1, col]);
      break;
  }
  console.log('NEW POS', snakePos[snakePos.length - 1]);
  if (checkNewPosition()) {
    checkReward();
    drawSnake(snakePos);
  }
};
const checkNewPosition = () => {
  // just check if head is out of bounds
  const [row, col] = snakePos[snakePos.length - 1];
  if (row < 0 || col < 0 || row >= ROWS || col >= COLS) {
    stopPlay();
    return false;
  }
  // now check if head is going through tail already
  for (let i = 0; i < snakePos.length - 2; i++) {
    let [tailRow, tailCol] = snakePos[i];
    if (row === tailRow && col === tailCol) {
      console.log('trying to cut through your tail you little snake:', i);
      stopPlay();
      return false;
    }
  }
  return true;
};

const checkReward = () => {
  console.log('Reward is at', reward, COLS, ROWS);
  for (const [row, col] of snakePos) {
    if (reward.row === row && reward.col === col) {
      // gain reward
      // add another row to the tail
      console.log('EARNED PRIZE');
      const [tailRow, tailCol] = snakePos[0];
      snakePos = [[tailRow, tailCol], ...snakePos];
      // snakePos = [[reward.row, reward.col], ...snakePos];
      clearReward();
    }
  }
};
const clearReward = () => {
  clearPixelAt(reward.row, reward.col);
  reward.row = null;
  reward.col = null;
};

const pause = () => {
  paused = !paused;
};

const placeReword = () => {
  let row = Math.ceil(Math.random() * 1000) % ROWS;
  let col = Math.ceil(Math.random() * 1000) % COLS;
  if (
    snakePos.find((p) => {
      const [r, c] = p;
      if (r === row && col === c) {
        console.log('COllition');
        return true;
      }
    })
  ) {
    //retry due to collision
    return placeReword();
  }
  reward.row = row;
  reward.col = col;
};

function initKeyboard() {
  document.addEventListener('keydown', (k) => {
    if (k.key === 'ArrowUp') {
      changeDirectionUp();
      console.log('move up');
    } else if (k.key === 'ArrowDown') {
      changeDirectionDown();
      console.log('move down');
    } else if (k.key === 'ArrowLeft') {
      console.log('move left');
      changeDirectionLeft();
    } else if (k.key === 'ArrowRight') {
      changeDirectionRight();
      console.log('move right');
    } else if (k.code === 'Space' || k.code === 'Escape') {
      pause();
    } else {
      console.log(k);
    }
  });
}

function init() {
  initializeCanvas();
  drawSnake(snakePos);
  startPlay();
}

function getPixel(row, col) {
  return pixels[row * COLS + col];
}
function clearPixelAt(row, col) {
  getPixel(row, col).style.backgroundColor = 'transparent';
}
function fillPixelAt(row, col) {
  getPixel(row, col).style.backgroundColor = 'blue';
}

let movementTimer = undefined;

const startPlay = () => {
  snakePos = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
  ];
  movementTimer = setInterval(() => {
    if (!reward.row) {
      placeReword();
    }
    moveSnake();
  }, 200);
};
const stopPlay = () => {
  clearInterval(movementTimer);
};

init();
initKeyboard();

// console.log(pixels);
document.getElementById('restart').addEventListener('click', ()=> {
  snakePos = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
  ];
  stopPlay();
  startPlay();
  snakeDir='right';
})