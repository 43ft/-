const app = getApp();
const { ERAS, getLayerSize } = require('../../utils/gameData.js');
const { saveGameData, loadGameData } = require('../../utils/storage.js');

Page({
  data: {
    playerData: null,
    erasList: []
  },

  onShow() {
    this.loadData();
    this.initErasList();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
  },

  initErasList() {
    const { playerData } = this.data;
    const currentEra = playerData.currentEra;
    const currentLayer = playerData.currentLayer;
    const unlockedEras = playerData.unlocked.eras;
    const unlockedLayers = playerData.unlocked.layers;

    const list = ERAS.map(era => {
      const isUnlocked = unlockedEras.includes(era.id);
      const isCurrent = era.id === currentEra;

      let progress = 0;
      if (isUnlocked) {
        const completedLayers = era.levels.filter(l => unlockedLayers.includes(l)).length;
        progress = Math.floor((completedLayers / era.levels.length) * 100);
      }

      return {
        id: era.id,
        name: era.name,
        subtitle: era.subtitle,
        description: era.description,
        levels: era.levels,
        ores: era.ores,
        unlockCondition: era.unlockCondition,
        isUnlocked,
        isCurrent,
        progress
      };
    });

    this.setData({ erasList: list });
  }
});
