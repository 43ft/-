const app = getApp();
const { generateMineField, getLayerSize, getEraByLayer, ORES, ERAS } = require('../../utils/gameData.js');
const { getEquipmentEffects } = require('../../utils/calculator.js');
const { saveGameData, loadGameData } = require('../../utils/storage.js');

Page({
  data: {
    playerData: null,
    mineField: null,
    effects: null,
    currentEra: null,
    layerProgress: 0,
    autoMineInterval: null,
    isAutoMining: false,
    ORES: ORES,
    eraName: '第一纪元',
    backpackCount: 0,
    currentLayerOres: []
  },

  onLoad() {
    this.loadData();
    this.initMineField();
  },

  onShow() {
    this.loadData();
    this.updateEffects();
    this.updateComputed();
  },

  onUnload() {
    this.stopAutoMine();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
  },

  initMineField() {
    const { playerData } = this.data;
    const layer = playerData.currentLayer;
    const mineField = generateMineField(layer);
    const currentEra = getEraByLayer(layer);
    const era = ERAS.find(e => e.id === currentEra);

    this.setData({
      mineField,
      currentEra,
      eraName: era ? `${era.name}·${era.subtitle}` : '未知纪元',
      layerProgress: 0
    });
  },

  updateEffects() {
    const { playerData } = this.data;
    const effects = getEquipmentEffects(playerData);
    this.setData({ effects });
  },

  updateComputed() {
    const { playerData, currentEra } = this.data;

    let count = 0;
    const items = playerData.backpack.items;
    for (const key in items) {
      count += items[key];
    }

    const era = ERAS.find(e => e.id === currentEra);
    const oreList = [];

    if (era) {
      for (const oreId of era.ores) {
        if (items[oreId] > 0) {
          oreList.push({
            oreId,
            icon: ORES[oreId]?.icon || '❓',
            count: items[oreId]
          });
        }
      }
    }

    this.setData({
      backpackCount: count,
      currentLayerOres: oreList,
      eraName: era ? `${era.name}·${era.subtitle}` : '未知纪元'
    });
  },

  onMineBlock(e) {
    const { x, y, z } = e.currentTarget.dataset;
    const { mineField, playerData, effects } = this.data;

    if (mineField.blocks[y][z][x].mined) {
      return;
    }

    const oreId = mineField.blocks[y][z][x].oreId;
    const oreData = ORES[oreId];

    mineField.blocks[y][z][x].mined = true;
    mineField.blocksRemaining--;

    playerData.backpack.items[oreId] = (playerData.backpack.items[oreId] || 0) + 1;
    playerData.totalMined++;

    const totalBlocks = getLayerSize(playerData.currentLayer).totalBlocks;
    const progress = Math.floor(((totalBlocks - mineField.blocksRemaining) / totalBlocks) * 100);

    playerData.gold += oreData.value * (effects?.goldBonus || 1);

    this.setData({
      mineField,
      playerData,
      layerProgress: progress
    });

    this.updateComputed();
    this.checkLayerComplete();
    saveGameData(playerData);
  },

  checkLayerComplete() {
    const { mineField, playerData } = this.data;

    if (mineField.blocksRemaining <= 0) {
      const nextLayer = playerData.currentLayer + 1;
      const newEra = getEraByLayer(nextLayer);

      playerData.currentLayer = nextLayer;

      if (!playerData.unlocked.layers.includes(nextLayer)) {
        playerData.unlocked.layers.push(nextLayer);
      }

      if (newEra > playerData.currentEra) {
        playerData.currentEra = newEra;
        if (!playerData.unlocked.eras.includes(newEra)) {
          playerData.unlocked.eras.push(newEra);
        }
      }

      const newMineField = generateMineField(nextLayer);
      const sizeInfo = getLayerSize(nextLayer);
      const era = ERAS.find(e => e.id === newEra);

      this.setData({
        mineField: newMineField,
        currentEra: newEra,
        layerProgress: 0,
        eraName: era ? `${era.name}·${era.subtitle}` : '未知纪元'
      });

      saveGameData(playerData);

      wx.showModal({
        title: '🎉 矿层通关！',
        content: `恭喜进入第 ${nextLayer} 层！\n矿区规模：${sizeInfo.dimension}×${sizeInfo.dimension}×${sizeInfo.dimension}`,
        showCancel: false
      });
    }
  },

  startAutoMine() {
    const { effects } = this.data;

    if (!effects || effects.autoMineRate === 0) {
      wx.showToast({
        title: '需要先解锁自动采掘机',
        icon: 'none'
      });
      return;
    }

    if (this.data.isAutoMining) {
      return;
    }

    this.setData({ isAutoMining: true });

    const interval = setInterval(() => {
      this.autoMine();
    }, 1000 / effects.autoMineRate);

    this.setData({ autoMineInterval: interval });
  },

  stopAutoMine() {
    const { autoMineInterval } = this.data;
    if (autoMineInterval) {
      clearInterval(autoMineInterval);
      this.setData({ autoMineInterval: null, isAutoMining: false });
    }
  },

  toggleAutoMine() {
    if (this.data.isAutoMining) {
      this.stopAutoMine();
    } else {
      this.startAutoMine();
    }
  },

  autoMine() {
    const { mineField } = this.data;

    for (let y = 0; y < mineField.size; y++) {
      for (let z = 0; z < mineField.size; z++) {
        for (let x = 0; x < mineField.size; x++) {
          if (!mineField.blocks[y][z][x].mined) {
            this.onMineBlock({
              currentTarget: {
                dataset: { x, y, z }
              }
            });
            return;
          }
        }
      }
    }
  },

  onShareAppMessage() {
    return {
      title: '挖矿大亨 - 一起成为矿王吧！',
      path: '/pages/index/index'
    };
  }
});
