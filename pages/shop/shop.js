const app = getApp();
const { saveGameData, loadGameData } = require('../../utils/storage.js');

const SHOP_ITEMS = [
  {
    id: 'speed_potion',
    name: '加速药水',
    icon: '⚡',
    description: '挖掘速度提升50%，持续5分钟',
    price: 500,
    effect: 'speedBoost'
  },
  {
    id: 'luck_charm',
    name: '幸运符',
    icon: '🍀',
    description: '稀有矿石掉率翻倍，持续3分钟',
    price: 1000,
    effect: 'luckBoost'
  },
  {
    id: 'auto_mine_card',
    name: '自动采掘卡',
    icon: '🤖',
    description: '开启自动采掘10分钟',
    price: 2000,
    effect: 'autoMine'
  },
  {
    id: 'gold_double',
    name: '金币加倍卡',
    icon: '💰',
    description: '金币获取双倍，持续5分钟',
    price: 3000,
    effect: 'goldDouble'
  },
  {
    id: 'backpack_expand',
    name: '背包扩容',
    icon: '🎒',
    description: '背包容量+50（永久）',
    price: 5000,
    effect: 'expandBackpack'
  }
];

Page({
  data: {
    playerData: null,
    shopItems: SHOP_ITEMS
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const savedData = loadGameData();
    if (savedData) {
      this.setData({ playerData: savedData });
    } else {
      this.setData({ playerData: app.globalData.playerData });
    }
  },

  onBuy(e) {
    const { itemId } = e.currentTarget.dataset;
    const { playerData } = this.data;
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    if (!item) return;

    if (playerData.gold < item.price) {
      wx.showToast({
        title: '金币不足',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认购买',
      content: `确定购买 ${item.name} 吗？\n价格: ${item.price} 金币`,
      success: (res) => {
        if (res.confirm) {
          playerData.gold -= item.price;

          switch (item.effect) {
            case 'expandBackpack':
              playerData.backpack.capacity += 50;
              wx.showToast({ title: '背包容量+50', icon: 'success' });
              break;
            default:
              wx.showToast({ title: '购买成功', icon: 'success' });
          }

          saveGameData(playerData);
          this.loadData();
        }
      }
    });
  }
});
