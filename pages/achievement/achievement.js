const app = getApp();
const { saveGameData, loadGameData } = require('../../utils/storage.js');

const ACHIEVEMENTS = [
  {
    id: 'first_mine',
    name: '初出茅庐',
    description: '累计挖矿10次',
    icon: '⛏️',
    requirement: { type: 'totalMined', value: 10 },
    reward: { type: 'gold', value: 100 }
  },
  {
    id: 'mine_100',
    name: '挖矿达人',
    description: '累计挖矿100次',
    icon: '🔨',
    requirement: { type: 'totalMined', value: 100 },
    reward: { type: 'gold', value: 1000 }
  },
  {
    id: 'mine_1000',
    name: '资深矿工',
    description: '累计挖矿1000次',
    icon: '⚒️',
    requirement: { type: 'totalMined', value: 1000 },
    reward: { type: 'gold', value: 10000 }
  },
  {
    id: 'diamond_first',
    name: '钻石猎人',
    description: '挖出第一颗钻石',
    icon: '💎',
    requirement: { type: 'ore', oreId: 'diamond', value: 1 },
    reward: { type: 'gold', value: 5000 }
  },
  {
    id: 'era1_complete',
    name: '纪元探索者',
    description: '通关第一纪元',
    icon: '🏆',
    requirement: { type: 'layer', value: 5 },
    reward: { type: 'gold', value: 5000 }
  },
  {
    id: 'era2_complete',
    name: '金属大师',
    description: '通关第二纪元',
    icon: '🥇',
    requirement: { type: 'layer', value: 10 },
    reward: { type: 'gold', value: 50000 }
  },
  {
    id: 'rich_100k',
    name: '小有资产',
    description: '累计获得10万金币',
    icon: '💵',
    requirement: { type: 'totalGold', value: 100000 },
    reward: { type: 'gold', value: 10000 }
  },
  {
    id: 'rich_1m',
    name: '百万富翁',
    description: '累计获得100万金币',
    icon: '💰',
    requirement: { type: 'totalGold', value: 1000000 },
    reward: { type: 'gold', value: 100000 }
  }
];

Page({
  data: {
    playerData: null,
    achievementsList: [],
    completedCount: 0,
    totalCount: ACHIEVEMENTS.length
  },

  onShow() {
    this.loadData();
    this.initAchievementsList();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
  },

  initAchievementsList() {
    const { playerData } = this.data;
    const completed = playerData.achievements?.completed || [];
    const totalMined = playerData.totalMined;
    const currentLayer = playerData.currentLayer;
    const totalGold = playerData.gold;

    const list = ACHIEVEMENTS.map(ach => {
      let progress = 0;
      let isCompleted = completed.includes(ach.id);

      switch (ach.requirement.type) {
        case 'totalMined':
          progress = Math.min(100, Math.floor((totalMined / ach.requirement.value) * 100));
          break;
        case 'totalGold':
          progress = Math.min(100, Math.floor((totalGold / ach.requirement.value) * 100));
          break;
        case 'layer':
          progress = Math.min(100, Math.floor((currentLayer / ach.requirement.value) * 100));
          break;
        case 'ore':
          const oreCount = playerData.backpack.items[ach.requirement.oreId] || 0;
          progress = Math.min(100, Math.floor((oreCount / ach.requirement.value) * 100));
          break;
      }

      return {
        ...ach,
        progress,
        isCompleted
      };
    });

    const completedCount = list.filter(a => a.isCompleted).length;

    this.setData({
      achievementsList: list,
      completedCount
    });
  },

  onClaim(e) {
    const { achId } = e.currentTarget.dataset;
    const { playerData } = this.data;
    const ach = ACHIEVEMENTS.find(a => a.id === achId);

    if (!ach || playerData.achievements?.completed?.includes(achId)) {
      return;
    }

    playerData.gold += ach.reward.value;
    if (!playerData.achievements) {
      playerData.achievements = { completed: [] };
    }
    if (!playerData.achievements.completed) {
      playerData.achievements.completed = [];
    }
    playerData.achievements.completed.push(achId);

    saveGameData(playerData);
    this.loadData();

    wx.showToast({
      title: `获得 ${ach.reward.value} 金币`,
      icon: 'success'
    });
  }
});
