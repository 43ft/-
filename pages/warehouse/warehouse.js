const app = getApp();
const { ORES } = require('../../utils/gameData.js');
const { saveGameData, loadGameData } = require('../../utils/storage.js');

Page({
  data: {
    playerData: null,
    warehouseList: []
  },

  onShow() {
    this.loadData();
    this.initWarehouseList();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
  },

  initWarehouseList() {
    const { playerData } = this.data;
    const items = playerData.warehouse.items;
    const list = [];

    for (const oreId in items) {
      const count = items[oreId] || 0;
      if (count > 0) {
        const oreData = ORES[oreId];
        if (oreData) {
          list.push({
            oreId,
            name: oreData.name,
            icon: oreData.icon,
            count,
            rarity: oreData.rarity
          });
        }
      }
    }

    list.sort((a, b) => b.count - a.count);

    this.setData({ warehouseList: list });
  }
});
