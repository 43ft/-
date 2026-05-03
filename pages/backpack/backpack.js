const app = getApp();
const { ORES, ERAS } = require('../../utils/gameData.js');
const { saveGameData, loadGameData } = require('../../utils/storage.js');

Page({
  data: {
    playerData: null,
    oresList: [],
    totalValue: 0
  },

  onShow() {
    this.loadData();
    this.initOresList();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
  },

  initOresList() {
    const { playerData } = this.data;
    const items = playerData.backpack.items;
    const list = [];
    let totalValue = 0;
    let totalCount = 0;

    for (const oreId in items) {
      const count = items[oreId] || 0;
      if (count > 0) {
        const oreData = ORES[oreId];
        if (oreData) {
          const value = count * oreData.value;
          totalValue += value;
          totalCount += count;

          list.push({
            oreId,
            name: oreData.name,
            icon: oreData.icon,
            count,
            value,
            rarity: oreData.rarity
          });
        }
      }
    }

    list.sort((a, b) => b.value - a.value);

    this.setData({
      oresList: list,
      totalValue,
      totalCount
    });
  },

  onSellOre(e) {
    const { oreId } = e.currentTarget.dataset;
    const { playerData } = this.data;

    if (playerData.backpack.items[oreId] <= 0) {
      wx.showToast({ title: '没有可出售的矿石', icon: 'none' });
      return;
    }

    const oreData = ORES[oreId];
    const count = playerData.backpack.items[oreId];
    const totalValue = count * oreData.value;

    wx.showModal({
      title: '确认出售',
      content: `确定出售全部 ${count} 个 ${oreData.name} 吗？\n将获得 ${totalValue} 金币`,
      success: (res) => {
        if (res.confirm) {
          playerData.backpack.items[oreId] = 0;
          playerData.gold += totalValue;
          saveGameData(playerData);
          this.loadData();
          this.initOresList();
          wx.showToast({ title: `获得 ${totalValue} 金币`, icon: 'success' });
        }
      }
    });
  },

  onSellAll() {
    const { playerData, totalValue } = this.data;

    if (totalValue <= 0) {
      wx.showToast({ title: '没有可出售的矿石', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认全部出售',
      content: `确定出售背包中所有矿石吗？\n将获得 ${totalValue} 金币`,
      success: (res) => {
        if (res.confirm) {
          const items = playerData.backpack.items;
          for (const oreId in items) {
            items[oreId] = 0;
          }
          playerData.gold += totalValue;
          saveGameData(playerData);
          this.loadData();
          this.initOresList();
          wx.showToast({ title: `获得 ${totalValue} 金币`, icon: 'success' });
        }
      }
    });
  }
});
