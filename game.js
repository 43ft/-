const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const CELL_SPACING = 12;
const MARGIN = 30;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_SPACING;

const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  4096: '#3c3a32'
};

const TEXT_COLORS = {
  2: '#776e65',
  4: '#776e65',
  8: '#f9f6f2',
  16: '#f9f6f2',
  32: '#f9f6f2',
  64: '#f9f6f2',
  128: '#f9f6f2',
  256: '#f9f6f2',
  512: '#f9f6f2',
  1024: '#f9f6f2',
  2048: '#f9f6f2',
  4096: '#f9f6f2'
};

class Game2048 {
  constructor() {
    this.grid = [];
    this.score = 0;
    this.bestScore = 0;
    this.gameOver = false;
    this.won = false;
    this.loadBestScore();
    this.init();
    this.bindEvents();
  }

  loadBestScore() {
    try {
      const saved = wx.getStorageSync('2048_best_score');
      if (saved) {
        this.bestScore = saved;
      }
    } catch (e) {
      console.error('加载最高分失败', e);
    }
  }

  saveBestScore() {
    try {
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        wx.setStorageSync('2048_best_score', this.bestScore);
      }
    } catch (e) {
      console.error('保存最高分失败', e);
    }
  }

  init() {
    this.grid = [];
    this.score = 0;
    this.gameOver = false;
    this.won = false;

    for (let i = 0; i < GRID_SIZE; i++) {
      this.grid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        this.grid[i][j] = null;
      }
    }

    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }

  addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!this.grid[i][j]) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) return false;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  slideLeft(row) {
    let arr = row.filter(val => val !== null);
    let merged = [];

    for (let i = 0; i < arr.length; i++) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
        const newVal = arr[i] * 2;
        merged.push(newVal);
        this.score += newVal;
        if (newVal >= 2048) {
          this.won = true;
        }
        i++;
      } else {
        merged.push(arr[i]);
      }
    }

    while (merged.length < GRID_SIZE) {
      merged.push(null);
    }

    return merged;
  }

  slideRight(row) {
    let arr = row.filter(val => val !== null);
    let merged = [];

    for (let i = arr.length - 1; i >= 0; i--) {
      if (i - 1 >= 0 && arr[i] === arr[i - 1]) {
        const newVal = arr[i] * 2;
        merged.unshift(newVal);
        this.score += newVal;
        if (newVal >= 2048) {
          this.won = true;
        }
        i--;
      } else {
        merged.unshift(arr[i]);
      }
    }

    while (merged.length < GRID_SIZE) {
      merged.unshift(null);
    }

    return merged;
  }

  moveLeft() {
    const oldGrid = JSON.stringify(this.grid);
    for (let i = 0; i < GRID_SIZE; i++) {
      this.grid[i] = this.slideLeft(this.grid[i]);
    }
    const hasChanged = JSON.stringify(this.grid) !== oldGrid;
    if (hasChanged) {
      this.addRandomTile();
      this.checkGameOver();
      this.saveBestScore();
    }
    this.render();
  }

  moveRight() {
    const oldGrid = JSON.stringify(this.grid);
    for (let i = 0; i < GRID_SIZE; i++) {
      this.grid[i] = this.slideRight(this.grid[i]);
    }
    const hasChanged = JSON.stringify(this.grid) !== oldGrid;
    if (hasChanged) {
      this.addRandomTile();
      this.checkGameOver();
      this.saveBestScore();
    }
    this.render();
  }

  transposeGrid() {
    const newGrid = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      newGrid[j] = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[j][i] = this.grid[i][j];
      }
    }
    this.grid = newGrid;
  }

  moveUp() {
    this.transposeGrid();
    const oldGrid = JSON.stringify(this.grid);
    for (let i = 0; i < GRID_SIZE; i++) {
      this.grid[i] = this.slideLeft(this.grid[i]);
    }
    const hasChanged = JSON.stringify(this.grid) !== oldGrid;
    this.transposeGrid();
    if (hasChanged) {
      this.addRandomTile();
      this.checkGameOver();
      this.saveBestScore();
    }
    this.render();
  }

  moveDown() {
    this.transposeGrid();
    const oldGrid = JSON.stringify(this.grid);
    for (let i = 0; i < GRID_SIZE; i++) {
      this.grid[i] = this.slideRight(this.grid[i]);
    }
    const hasChanged = JSON.stringify(this.grid) !== oldGrid;
    this.transposeGrid();
    if (hasChanged) {
      this.addRandomTile();
      this.checkGameOver();
      this.saveBestScore();
    }
    this.render();
  }

  canMove() {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!this.grid[i][j]) return true;

        const current = this.grid[i][j];
        if (j < GRID_SIZE - 1 && current === this.grid[i][j + 1]) return true;
        if (i < GRID_SIZE - 1 && current === this.grid[i + 1][j]) return true;
      }
    }
    return false;
  }

  checkGameOver() {
    if (!this.canMove()) {
      this.gameOver = true;
    }
  }

  render() {
    this.drawBackground();
    this.drawCells();
    this.drawScore();

    if (this.gameOver) {
      this.drawGameOver();
    } else if (this.won) {
      this.drawWin();
    }
  }

  drawBackground() {
    const canvasWidth = canvas.width;
    const startX = (canvasWidth - BOARD_SIZE) / 2;

    ctx.fillStyle = '#bbada0';
    ctx.fillRect(startX, MARGIN + 80, BOARD_SIZE, BOARD_SIZE);

    ctx.fillStyle = '#cdc1b4';
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = startX + CELL_SPACING + j * (CELL_SIZE + CELL_SPACING);
        const y = MARGIN + 80 + CELL_SPACING + i * (CELL_SIZE + CELL_SPACING);
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  drawCells() {
    const canvasWidth = canvas.width;
    const startX = (canvasWidth - BOARD_SIZE) / 2;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const val = this.grid[i][j];
        if (val) {
          const x = startX + CELL_SPACING + j * (CELL_SIZE + CELL_SPACING);
          const y = MARGIN + 80 + CELL_SPACING + i * (CELL_SIZE + CELL_SPACING);

          ctx.fillStyle = COLORS[val] || '#3c3a32';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

          ctx.fillStyle = TEXT_COLORS[val] || '#f9f6f2';
          ctx.font = val < 100 ? '40px Arial' : val < 1000 ? '30px Arial' : '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }
      }
    }
  }

  drawScore() {
    const canvasWidth = canvas.width;

    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, canvasWidth, 70);

    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('2048', canvasWidth / 2, 20);

    ctx.font = '16px Arial';
    ctx.fillText(`分数: ${this.score} | 最高分: ${this.bestScore}`, canvasWidth / 2, 50);

    ctx.font = '14px Arial';
    ctx.fillText('上下左右滑动开始游戏 | 点击重新开始', canvasWidth / 2, MARGIN + 90 + BOARD_SIZE);
  }

  drawGameOver() {
    const canvasWidth = canvas.width;
    const startX = (canvasWidth - BOARD_SIZE) / 2;

    ctx.fillStyle = 'rgba(238, 228, 218, 0.73)';
    ctx.fillRect(startX, MARGIN + 80, BOARD_SIZE, BOARD_SIZE);

    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束!', canvasWidth / 2, MARGIN + 80 + BOARD_SIZE / 2);

    ctx.font = '20px Arial';
    ctx.fillText('点击屏幕重新开始', canvasWidth / 2, MARGIN + 110 + BOARD_SIZE / 2);
  }

  drawWin() {
    const canvasWidth = canvas.width;
    const startX = (canvasWidth - BOARD_SIZE) / 2;

    ctx.fillStyle = 'rgba(237, 194, 46, 0.73)';
    ctx.fillRect(startX, MARGIN + 80, BOARD_SIZE, BOARD_SIZE);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('恭喜!', canvasWidth / 2, MARGIN + 80 + BOARD_SIZE / 2);

    ctx.font = '20px Arial';
    ctx.fillText('你合成了2048!', canvasWidth / 2, MARGIN + 110 + BOARD_SIZE / 2);
  }

  bindEvents() {
    let startX = 0;
    let startY = 0;

    wx.onTouchStart((res) => {
      startX = res.touches[0].clientX;
      startY = res.touches[0].clientY;
    });

    wx.onTouchEnd((res) => {
      if (this.gameOver || this.won) {
        this.init();
        return;
      }

      const endX = res.changedTouches[0].clientX;
      const endY = res.changedTouches[0].clientY;

      const dx = endX - startX;
      const dy = endY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
          this.moveRight();
        } else if (dx < -30) {
          this.moveLeft();
        }
      } else {
        if (dy > 30) {
          this.moveDown();
        } else if (dy < -30) {
          this.moveUp();
        }
      }
    });
  }
}

function initCanvas() {
  const systemInfo = wx.getSystemInfoSync();
  canvas.width = systemInfo.screenWidth;
  canvas.height = systemInfo.screenHeight;
}

initCanvas();
new Game2048();
