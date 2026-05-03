const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const CELL_SPACING = 12;
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

let canvasWidth = 375;
let canvasHeight = 667;
let startX = 0;
let startY = 0;
let totalHeight = 0;

class Tile {
  constructor(value, row, col) {
    this.value = value;
    this.row = row;
    this.col = col;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.scale = 0;
    this.targetScale = 1;
    this.mergeScale = 1;
    this.isNew = true;
    this.isMerging = false;
    this.updatePosition();
    this.updateScale();
  }

  updatePosition() {
    this.targetX = startX + CELL_SPACING + this.col * (CELL_SIZE + CELL_SPACING);
    this.targetY = startY + CELL_SPACING + this.row * (CELL_SIZE + CELL_SPACING);
  }

  updateScale() {
    this.targetScale = 1;
  }

  moveTo(row, col) {
    this.row = row;
    this.col = col;
    this.updatePosition();
    this.isNew = false;
  }

  merge(value) {
    this.value = value;
    this.isMerging = true;
    this.mergeScale = 1.2;
  }

  update() {
    const speed = 0.2;
    this.x += (this.targetX - this.x) * speed;
    this.y += (this.targetY - this.y) * speed;

    if (this.scale < this.targetScale) {
      this.scale += (this.targetScale - this.scale) * speed;
    } else if (this.scale > this.targetScale) {
      this.scale = this.targetScale;
    }

    if (this.isMerging) {
      this.mergeScale += (1 - this.mergeScale) * speed;
      if (Math.abs(this.mergeScale - 1) < 0.01) {
        this.mergeScale = 1;
        this.isMerging = false;
      }
    }

    if (this.isNew && this.scale >= 0.9) {
      this.scale = 1;
      this.isNew = false;
    }
  }
}

class Game2048 {
  constructor() {
    this.tiles = [];
    this.score = 0;
    this.bestScore = 0;
    this.gameOver = false;
    this.won = false;
    this.isAnimating = false;
    this.loadBestScore();
    this.init();
    this.bindEvents();
    this.gameLoop();
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
    this.tiles = [];
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.isAnimating = false;

    this.addRandomTile();
    this.addRandomTile();
  }

  getEmptyCells() {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!this.getTileAt(r, c)) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  getTileAt(row, col) {
    return this.tiles.find(t => t.row === row && t.col === col);
  }

  addRandomTile() {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return false;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const tile = new Tile(value, cell.row, cell.col);
    this.tiles.push(tile);
    return true;
  }

  move(direction) {
    if (this.isAnimating || this.gameOver || this.won) return;

    const oldPositions = this.tiles.map(t => ({ row: t.row, col: t.col, value: t.value }));
    let moved = false;

    const vectors = {
      'left': { dr: 0, dc: -1 },
      'right': { dr: 0, dc: 1 },
      'up': { dr: -1, dc: 0 },
      'down': { dr: 1, dc: 0 }
    };

    const v = vectors[direction];
    const rows = v.dr === 1 ? [GRID_SIZE - 1, 1, 0] : v.dr === -1 ? [0, 1, GRID_SIZE - 1] : [0, 1, 2, 3];
    const cols = v.dc === 1 ? [GRID_SIZE - 1, 1, 0] : v.dc === -1 ? [0, 1, GRID_SIZE - 1] : [0, 1, 2, 3];

    const mergedThisTurn = [];

    for (const r of rows) {
      for (const c of cols) {
        const tile = this.getTileAt(r, c);
        if (!tile) continue;

        let newR = r;
        let newC = c;

        while (true) {
          const nextR = newR + v.dr;
          const nextC = newC + v.dc;

          if (nextR < 0 || nextR >= GRID_SIZE || nextC < 0 || nextC >= GRID_SIZE) break;

          const nextTile = this.getTileAt(nextR, nextC);

          if (!nextTile) {
            newR = nextR;
            newC = nextC;
          } else if (nextTile.value === tile.value && !mergedThisTurn.includes(nextTile)) {
            newR = nextR;
            newC = nextC;
            mergedThisTurn.push(tile);
            break;
          } else {
            break;
          }
        }

        if (newR !== r || newC !== c) {
          moved = true;
          tile.moveTo(newR, newC);

          const targetTile = this.getTileAt(newR, newC);
          if (targetTile && targetTile !== tile && targetTile.value === tile.value) {
            const newValue = tile.value * 2;
            targetTile.merge(newValue);
            this.tiles = this.tiles.filter(t => t !== tile);
            this.score += newValue;

            if (newValue >= 2048 && !this.won) {
              this.won = true;
            }
          }
        }
      }
    }

    if (moved) {
      this.isAnimating = true;
      this.saveBestScore();

      setTimeout(() => {
        this.addRandomTile();
        this.isAnimating = false;

        if (!this.canMove()) {
          this.gameOver = true;
        }
      }, 150);
    }
  }

  canMove() {
    if (this.getEmptyCells().length > 0) return true;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = this.getTileAt(r, c);
        if (!tile) continue;

        if (c < GRID_SIZE - 1) {
          const right = this.getTileAt(r, c + 1);
          if (right && right.value === tile.value) return true;
        }
        if (r < GRID_SIZE - 1) {
          const down = this.getTileAt(r + 1, c);
          if (down && down.value === tile.value) return true;
        }
      }
    }
    return false;
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    for (const tile of this.tiles) {
      tile.update();
    }
  }

  render() {
    this.drawBackground();
    this.drawCells();
    this.drawTiles();
    this.drawScore();
    this.drawInstructions();

    if (this.gameOver) {
      this.drawGameOver();
    } else if (this.won) {
      this.drawWin();
    }
  }

  drawBackground() {
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#bbada0';
    const boardX = startX - 20;
    const boardY = startY - 20;
    const boardWidth = BOARD_SIZE + 40;
    const boardHeight = BOARD_SIZE + 40;
    this.roundRect(boardX, boardY, boardWidth, boardHeight, 15);

    ctx.fillStyle = '#cdc1b4';
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = startX + CELL_SPACING + j * (CELL_SIZE + CELL_SPACING);
        const y = startY + CELL_SPACING + i * (CELL_SIZE + CELL_SPACING);
        this.roundRect(x, y, CELL_SIZE, CELL_SIZE, 8);
      }
    }
  }

  drawCells() {
  }

  drawTiles() {
    for (const tile of this.tiles) {
      const x = tile.x;
      const y = tile.y;
      const scale = tile.scale * (tile.isMerging ? tile.mergeScale : 1);
      const size = CELL_SIZE * scale;
      const offset = (CELL_SIZE - size) / 2;

      ctx.fillStyle = COLORS[tile.value] || '#3c3a32';
      this.roundRect(x + offset, y + offset, size, size, 6);

      if (tile.value > 0) {
        ctx.fillStyle = TEXT_COLORS[tile.value] || '#f9f6f2';
        const fontSize = tile.value < 100 ? 36 : tile.value < 1000 ? 28 : 22;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tile.value, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    }
  }

  drawScore() {
    const titleY = 50;
    const scoreY = 100;

    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2048', canvasWidth / 2, titleY);

    ctx.font = '18px Arial';
    ctx.fillText(`分数: ${this.score}    最高分: ${this.bestScore}`, canvasWidth / 2, scoreY);
  }

  drawInstructions() {
    const y = startY + BOARD_SIZE + 50;

    ctx.fillStyle = '#8f7a66';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('滑动屏幕移动方块', canvasWidth / 2, y);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#bbada0';
    ctx.fillText('相同数字合并翻倍 | 合成2048获胜', canvasWidth / 2, y + 25);
  }

  drawGameOver() {
    ctx.fillStyle = 'rgba(238, 228, 218, 0.9)';
    this.roundRect(startX - 20, startY - 20, BOARD_SIZE + 40, BOARD_SIZE + 40, 15);

    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', canvasWidth / 2, startY + BOARD_SIZE / 2 - 15);

    ctx.font = '18px Arial';
    ctx.fillText(`得分: ${this.score}`, canvasWidth / 2, startY + BOARD_SIZE / 2 + 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#8f7a66';
    ctx.fillText('点击重新开始', canvasWidth / 2, startY + BOARD_SIZE / 2 + 55);
  }

  drawWin() {
    ctx.fillStyle = 'rgba(237, 194, 46, 0.9)';
    this.roundRect(startX - 20, startY - 20, BOARD_SIZE + 40, BOARD_SIZE + 40, 15);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 恭喜!', canvasWidth / 2, startY + BOARD_SIZE / 2 - 15);

    ctx.font = '18px Arial';
    ctx.fillText('你合成了 2048!', canvasWidth / 2, startY + BOARD_SIZE / 2 + 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#8f7a66';
    ctx.fillText('点击继续或重新开始', canvasWidth / 2, startY + BOARD_SIZE / 2 + 55);
  }

  roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  bindEvents() {
    let touchStartX = 0;
    let touchStartY = 0;

    wx.onTouchStart((res) => {
      touchStartX = res.touches[0].clientX;
      touchStartY = res.touches[0].clientY;
    });

    wx.onTouchEnd((res) => {
      if (this.gameOver || this.won) {
        this.init();
        return;
      }

      const touchEndX = res.changedTouches[0].clientX;
      const touchEndY = res.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      const minSwipe = 30;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > minSwipe) {
          this.move('right');
        } else if (dx < -minSwipe) {
          this.move('left');
        }
      } else {
        if (dy > minSwipe) {
          this.move('down');
        } else if (dy < -minSwipe) {
          this.move('up');
        }
      }
    });
  }
}

function initCanvas() {
  const systemInfo = wx.getSystemInfoSync();
  canvasWidth = systemInfo.screenWidth;
  canvasHeight = systemInfo.screenHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  totalHeight = 160 + BOARD_SIZE + 80;
  startX = (canvasWidth - BOARD_SIZE) / 2;
  startY = (canvasHeight - totalHeight) / 2 + 60;
}

initCanvas();
new Game2048();
