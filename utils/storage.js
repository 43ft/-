function saveGameData(playerData) {
  try {
    wx.setStorageSync('playerData', playerData);
    return true;
  } catch (e) {
    console.error('保存游戏数据失败:', e);
    return false;
  }
}

function loadGameData() {
  try {
    const data = wx.getStorageSync('playerData');
    return data || null;
  } catch (e) {
    console.error('读取游戏数据失败:', e);
    return null;
  }
}

function clearGameData() {
  try {
    wx.removeStorageSync('playerData');
    return true;
  } catch (e) {
    console.error('清除游戏数据失败:', e);
    return false;
  }
}

function getDefaultPlayerData() {
  return {
    gold: 0,
    totalMined: 0,
    currentLayer: 1,
    currentEra: 1,
    mineProgress: {
      currentLayer: 1,
      blocksRemaining: 8,
      totalBlocks: 8
    },
    backpack: {
      capacity: 100,
      items: {
        coal: 0,
        iron: 0,
        copper: 0,
        silver: 0,
        gold: 0,
        diamond: 0,
        rareOre: 0,
        coldIron: 0,
        iceCrystal: 0,
        frozenDiamond: 0,
        moonIron: 0,
        spaceAlloy: 0,
        meteorDiamond: 0,
        antiGravity: 0,
        starFragment: 0,
        moonEssence: 0
      }
    },
    warehouse: {
      items: {}
    },
    equipment: {
      pickaxe: 1,
      explosives: 0,
      drill: 0,
      transport: 0,
      detector: 0,
      autoMiner: 0,
      coolingDevice: 0,
      thruster: 0
    },
    unlocked: {
      eras: [1],
      layers: [1],
      equipment: ['pickaxe'],
      ores: ['coal', 'iron']
    },
    achievements: {
      totalMined: 0,
      erasCompleted: [],
      equipmentMaxed: []
    },
    settings: {
      soundEnabled: true,
      autoSaveInterval: 30000
    }
  };
}

module.exports = {
  saveGameData,
  loadGameData,
  clearGameData,
  getDefaultPlayerData
};
