const { EQUIPMENT_COSTS, ORES, EQUIPMENT } = require('./gameData.js');

function calculateMineSpeed(pickaxeLevel) {
  const baseSpeed = 1.0;
  const speedBonus = (pickaxeLevel - 1) * 0.2;
  return baseSpeed * (1 + speedBonus);
}

function canUpgradeEquipment(playerData, equipmentId) {
  const currentLevel = playerData.equipment[equipmentId];
  const equipment = EQUIPMENT[equipmentId];

  if (currentLevel >= equipment.maxLevel) {
    return { canUpgrade: false, reason: '已满级' };
  }

  const nextLevel = currentLevel + 1;
  const costs = EQUIPMENT_COSTS[equipmentId][nextLevel];

  if (!costs) {
    return { canUpgrade: false, reason: '升级配置不存在' };
  }

  for (const [oreId, required] of Object.entries(costs)) {
    const owned = playerData.backpack.items[oreId] || 0;
    if (owned < required) {
      const oreName = ORES[oreId]?.name || oreId;
      return {
        canUpgrade: false,
        reason: `缺少${oreName}×${required - owned}`
      };
    }
  }

  return { canUpgrade: true, costs };
}

function upgradeEquipment(playerData, equipmentId) {
  const check = canUpgradeEquipment(playerData, equipmentId);

  if (!check.canUpgrade) {
    return { success: false, reason: check.reason };
  }

  const currentLevel = playerData.equipment[equipmentId];
  const nextLevel = currentLevel + 1;
  const costs = EQUIPMENT_COSTS[equipmentId][nextLevel];

  for (const [oreId, required] of Object.entries(costs)) {
    playerData.backpack.items[oreId] -= required;
  }

  playerData.equipment[equipmentId] = nextLevel;

  return { success: true, newLevel: nextLevel };
}

function calculateAutoMineRate(autoMinerLevel, transportLevel) {
  if (autoMinerLevel === 0) return 0;

  const baseRate = 0.5;
  const minerBonus = autoMinerLevel * 0.3;
  const transportBonus = transportLevel * 0.1;

  return baseRate + minerBonus + transportBonus;
}

function calculateGoldBonus(detectorLevel, transportLevel) {
  let bonus = 1.0;
  bonus += detectorLevel * 0.05;
  bonus += transportLevel * 0.1;
  return bonus;
}

function getEquipmentEffects(playerData) {
  return {
    mineSpeed: calculateMineSpeed(playerData.equipment.pickaxe),
    autoMineRate: calculateAutoMineRate(playerData.equipment.autoMiner, playerData.equipment.transport),
    goldBonus: calculateGoldBonus(playerData.equipment.detector, playerData.equipment.transport),
    canExplosive: playerData.equipment.explosives > 0,
    explosivePower: playerData.equipment.explosives * 2,
    drillLevel: playerData.equipment.drill,
    detectorRange: playerData.equipment.detector * 2 + 1
  };
}

module.exports = {
  calculateMineSpeed,
  canUpgradeEquipment,
  upgradeEquipment,
  calculateAutoMineRate,
  calculateGoldBonus,
  getEquipmentEffects
};
