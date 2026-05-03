const app = getApp();
const { EQUIPMENT, EQUIPMENT_COSTS, ORES } = require('../../utils/gameData.js');
const { canUpgradeEquipment, upgradeEquipment, getEquipmentEffects } = require('../../utils/calculator.js');
const { saveGameData, loadGameData } = require('../../utils/storage.js');

Page({
  data: {
    playerData: null,
    equipmentList: [],
    effects: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
    this.initEquipmentList();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
    const effects = getEquipmentEffects(this.data.playerData);
    this.setData({ effects });
  },

  initEquipmentList() {
    const { playerData } = this.data;
    const list = [];

    for (const eqId in EQUIPMENT) {
      const eq = EQUIPMENT[eqId];
      const level = playerData.equipment[eqId] || 0;
      const check = canUpgradeEquipment(playerData, eqId);

      const nextLevel = level + 1;
      const costs = level >= eq.maxLevel ? null : EQUIPMENT_COSTS[eqId][nextLevel];

      const costList = [];
      if (costs) {
        for (const [oreId, count] of Object.entries(costs)) {
          costList.push({
            oreId,
            icon: ORES[oreId]?.icon || '❓',
            name: ORES[oreId]?.name || oreId,
            count,
            owned: playerData.backpack.items[oreId] || 0
          });
        }
      }

      list.push({
        id: eqId,
        name: eq.name,
        icon: eq.icon,
        description: eq.description,
        level,
        maxLevel: eq.maxLevel,
        canUpgrade: check.canUpgrade,
        reason: check.reason,
        costs: costList,
        isMaxed: level >= eq.maxLevel
      });
    }

    this.setData({ equipmentList: list });
  },

  onUpgrade(e) {
    const { eqId } = e.currentTarget.dataset;
    const { playerData } = this.data;

    const result = upgradeEquipment(playerData, eqId);

    if (result.success) {
      saveGameData(playerData);
      this.loadData();
      wx.showToast({
        title: '升级成功！',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: result.reason,
        icon: 'none'
      });
    }
  }
});
