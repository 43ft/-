const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

const GRID_SIZE = 4;
const CELL_SIZE = 70;
const CELL_GAP = 10;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_GAP;

const COLORS = {
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
  32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
  512: '#edc850', 1024: '#edc53f', 2048: '#edc22e', 4096: '#3c3a32'
};

const TEXT_COLORS = {
  2: '#776e65', 4: '#776e65', 8: '#f9f6f2', 16: '#f9f6f2',
  32: '#f9f6f2', 64: '#f9f6f2', 128: '#f9f6f2', 256: '#f9f6f2',
  512: '#f9f6f2', 1024: '#f9f6f2', 2048: '#f9f6f2', 4096: '#f9f6f2'
};

let W = 375, H = 667;
let boardX = 0, boardY = 0;

class Tile {
  constructor(v, r, c) {
    this.v = v;
    this.r = r;
    this.c = c;
    this.x = boardX + CELL_GAP + c * (CELL_SIZE + CELL_GAP);
    this.y = boardY + CELL_GAP + r * (CELL_SIZE + CELL_GAP);
    this.tx = this.x;
    this.ty = this.y;
    this.scale = 0;
    this.newScale = 1;
  }

  setTarget() {
    this.tx = boardX + CELL_GAP + this.c * (CELL_SIZE + CELL_GAP);
    this.ty = boardY + CELL_GAP + this.r * (CELL_SIZE + CELL_GAP);
  }

  update() {
    const s = 0.3;
    this.x += (this.tx - this.x) * s;
    this.y += (this.ty - this.y) * s;
    if (this.scale < this.newScale) {
      this.scale += (this.newScale - this.scale) * s;
      if (this.scale > 0.98) this.scale = this.newScale;
    }
  }

  moveTo(r, c) {
    this.r = r;
    this.c = c;
    this.setTarget();
  }
}

class Game {
  constructor() {
    this.grid = [];
    this.tiles = [];
    this.score = 0;
    this.best = 0;
    this.over = false;
    this.animating = false;
    this.load();
    this.init();
    this.bind();
    this.loop();
  }

  load() {
    try { this.best = wx.getStorageSync('2048_best') || 0; } catch (e) {}
  }

  save() {
    try {
      if (this.score > this.best) {
        this.best = this.score;
        wx.setStorageSync('2048_best', this.best);
      }
    } catch (e) {}
  }

  init() {
    this.grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    this.tiles = [];
    this.score = 0;
    this.over = false;
    this.animating = false;
    this.spawn();
    this.spawn();
  }

  spawn() {
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (!this.grid[r][c]) empty.push({ r, c });
    if (!empty.length) return;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    const tile = new Tile(Math.random() < 0.9 ? 2 : 4, r, c);
    this.grid[r][c] = tile;
    this.tiles.push(tile);
  }

  move(dir) {
    if (this.animating || this.over) return;

    let moved = false;
    const vectors = {
      left: [0, -1], right: [0, 1],
      up: [-1, 0], down: [1, 0]
    };
    const [dr, dc] = vectors[dir];
    const isVert = dr !== 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      const line = [];
      const tiles = [];

      for (let j = 0; j < GRID_SIZE; j++) {
        const r = isVert ? j : i;
        const c = isVert ? i : j;
        if (this.grid[r][c]) {
          line.push(this.grid[r][c].v);
          tiles.push({ r, c, tile: this.grid[r][c] });
        }
      }

      if (!line.length) continue;

      const merged = [];
      const newLine = [];

      if (dc === -1 || dr === -1) {
        for (let j = 0; j < line.length; j++) {
          if (j + 1 < line.length && line[j] === line[j + 1]) {
            newLine.push(line[j] * 2);
            merged.push(newLine.length - 1);
            this.score += line[j] * 2;
            j++;
          } else {
            newLine.push(line[j]);
          }
        }
      } else {
        let j = line.length - 1;
        while (j >= 0) {
          if (j - 1 >= 0 && line[j] === line[j - 1]) {
            newLine.unshift(line[j] * 2);
            merged.unshift(newLine.length - 1);
            this.score += line[j] * 2;
            j--;
          } else {
            newLine.unshift(line[j]);
            j--;
          }
        }
      }

      while (newLine.length < GRID_SIZE) {
        if (dc === -1 || dr === -1) newLine.push(null);
        else newLine.unshift(null);
      }

      let idx = 0;
      for (let j = 0; j < GRID_SIZE; j++) {
        const r = isVert ? j : i;
        const c = isVert ? i : j;

        if (newLine[j] !== null) {
          const targetR = isVert ? (dc === -1 ? idx : GRID_SIZE - 1 - idx) : i;
          const targetC = isVert ? i : (dr === -1 ? idx : GRID_SIZE - 1 - idx);

          const src = tiles[idx];
          if (src) {
            src.tile.moveTo(targetR, targetC);
            this.grid[targetR][targetC] = src.tile;
            if (src.r !== targetR || src.c !== targetC) {
              this.grid[src.r][src.c] = null;
              moved = true;
            }
          }

          if (merged.includes(j)) {
            const mergedTile = this.grid[targetR][targetC];
            if (mergedTile) {
              mergedTile.v = newLine[j];
            }
          }
          idx++;
        } else {
          const r2 = isVert ? j : i;
          const c2 = isVert ? i : j;
          if (this.grid[r2][c2]) {
            this.grid[r2][c2] = null;
            moved = true;
          }
        }
      }
    }

    if (moved) {
      this.animating = true;
      this.save();
      setTimeout(() => {
        this.spawn();
        this.animating = false;
        if (!this.canMove()) this.over = true;
      }, 120);
    }
  }

  canMove() {
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!this.grid[r][c]) return true;
        if (c < GRID_SIZE - 1 && this.grid[r][c]?.v === this.grid[r][c + 1]?.v) return true;
        if (r < GRID_SIZE - 1 && this.grid[r][c]?.v === this.grid[r + 1][c]?.v) return true;
      }
    return false;
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    for (const t of this.tiles) t.update();
  }

  render() {
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#bbada0';
    this.roundRect(boardX - 15, boardY - 15, BOARD_SIZE + 30, BOARD_SIZE + 30, 12);

    ctx.fillStyle = '#cdc1b4';
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = boardX + CELL_GAP + c * (CELL_SIZE + CELL_GAP);
        const y = boardY + CELL_GAP + r * (CELL_SIZE + CELL_GAP);
        this.roundRect(x, y, CELL_SIZE, CELL_SIZE, 6);
      }

    for (const t of this.tiles) {
      const s = CELL_SIZE * t.scale;
      const off = (CELL_SIZE - s) / 2;
      ctx.fillStyle = COLORS[t.v] || '#3c3a32';
      this.roundRect(t.x + off, t.y + off, s, s, 4);

      ctx.fillStyle = TEXT_COLORS[t.v] || '#f9f6f2';
      ctx.font = `bold ${t.v < 100 ? 32 : t.v < 1000 ? 26 : 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.v, t.x + CELL_SIZE / 2, t.y + CELL_SIZE / 2);
    }

    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2048', W / 2, 40);

    ctx.font = '16px Arial';
    ctx.fillText(`分数: ${this.score}  |  最高: ${this.best}`, W / 2, 75);

    const y = boardY + BOARD_SIZE + 35;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#8f7a66';
    ctx.fillText('滑动屏幕移动方块', W / 2, y);
    ctx.fillStyle = '#bbada0';
    ctx.font = '12px Arial';
    ctx.fillText('相同数字合并翻倍', W / 2, y + 22);

    if (this.over) {
      ctx.fillStyle = 'rgba(238,228,218,0.85)';
      this.roundRect(boardX - 15, boardY - 15, BOARD_SIZE + 30, BOARD_SIZE + 30, 12);
      ctx.fillStyle = '#776e65';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('游戏结束', W / 2, boardY + BOARD_SIZE / 2 - 15);
      ctx.font = '18px Arial';
      ctx.fillText(`得分: ${this.score}`, W / 2, boardY + BOARD_SIZE / 2 + 20);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#8f7a66';
      ctx.fillText('点击重新开始', W / 2, boardY + BOARD_SIZE / 2 + 55);
    }
  }

  roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  bind() {
    let sx = 0, sy = 0;
    wx.onTouchStart(e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; });
    wx.onTouchEnd(e => {
      if (this.over) { this.init(); return; }
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 20) this.move(dx > 0 ? 'right' : 'left');
      } else {
        if (Math.abs(dy) > 20) this.move(dy > 0 ? 'down' : 'up');
      }
    });
  }
}

function init() {
  const sys = wx.getSystemInfoSync();
  W = sys.screenWidth;
  H = sys.screenHeight;
  canvas.width = W;
  canvas.height = H;
  const totalH = 120 + BOARD_SIZE + 80;
  boardX = (W - BOARD_SIZE) / 2;
  boardY = (H - totalH) / 2 + 50;
}

init();
new Game();
