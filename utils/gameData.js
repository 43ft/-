const ORES = {
  coal: { id: 'coal', name: '煤矿', icon: '�ite', value: 1, rarity: 'common', era: 1 },
  iron: { id: 'iron', name: '铁矿', icon: '�ite', value: 5, rarity: 'common', era: 1 },
  copper: { id: 'copper', name: '铜矿', icon: '🟠', value: 15, rarity: 'rare', era: 2 },
  silver: { id: 'silver', name: '银矿', icon: '⬜', value: 50, rarity: 'rare', era: 2 },
  gold: { id: 'gold', name: '金矿', icon: '🟡', value: 150, rarity: 'epic', era: 2 },
  diamond: { id: 'diamond', name: '钻石', icon: '💎', value: 500, rarity: 'legendary', era: 3 },
  rareOre: { id: 'rareOre', name: '稀有矿石', icon: '🔮', value: 800, rarity: 'legendary', era: 3 },
  coldIron: { id: 'coldIron', name: '寒铁矿', icon: '🧊', value: 1200, rarity: 'myth', era: 4 },
  iceCrystal: { id: 'iceCrystal', name: '冰晶石', icon: '❄️', value: 2000, rarity: 'myth', era: 4 },
  frozenDiamond: { id: 'frozenDiamond', name: '永冻钻石', icon: '💠', value: 5000, rarity: 'epic', era: 4 },
  moonIron: { id: 'moonIron', name: '月铁矿', icon: '🌙', value: 8000, rarity: 'epic', era: 5 },
  spaceAlloy: { id: 'spaceAlloy', name: '太空合金', icon: '🛸', value: 12000, rarity: 'legendary', era: 5 },
  meteorDiamond: { id: 'meteorDiamond', name: '陨石钻石', icon: '☄️', value: 20000, rarity: 'myth', era: 5 },
  antiGravity: { id: 'antiGravity', name: '反重力石', icon: '🌀', value: 30000, rarity: 'myth', era: 5 },
  starFragment: { id: 'starFragment', name: '星星碎片', icon: '⭐', value: 100000, rarity: 'legendary', era: 6 },
  moonEssence: { id: 'moonEssence', name: '月壤精华', icon: '🌕', value: 150000, rarity: 'legendary', era: 6 }
};

const EQUIPMENT = {
  pickaxe: { id: 'pickaxe', name: '矿镐', icon: '⛏️', description: '提升挖掘速度', maxLevel: 5 },
  explosives: { id: 'explosives', name: '炸药', icon: '💥', description: '批量破坏方块', maxLevel: 5 },
  drill: { id: 'drill', name: '电钻', icon: '⚡', description: '穿透硬质矿石', maxLevel: 5 },
  transport: { id: 'transport', name: '运输车', icon: '🚛', description: '自动运输矿石', maxLevel: 5 },
  detector: { id: 'detector', name: '探测仪', icon: '🔍', description: '显示周围矿石', maxLevel: 5 },
  autoMiner: { id: 'autoMiner', name: '自动采掘机', icon: '🤖', description: '全自动挖掘', maxLevel: 5 },
  coolingDevice: { id: 'coolingDevice', name: '制冷设备', icon: '🧊', description: '高温矿区作业', maxLevel: 5 },
  thruster: { id: 'thruster', name: '推进器', icon: '🚀', description: '快速移动', maxLevel: 5 }
};

const ERAS = [
  {
    id: 1,
    name: '第一纪元',
    subtitle: '表层煤矿区',
    levels: [1, 2, 3, 4, 5],
    ores: ['coal', 'iron', 'copper'],
    unlockCondition: '初始解锁',
    description: '工业革命的起点，新手矿工的摇篮'
  },
  {
    id: 2,
    name: '第二纪元',
    subtitle: '金属矿区',
    levels: [6, 7, 8, 9, 10],
    ores: ['copper', 'silver', 'gold', 'diamond'],
    unlockCondition: '累计挖矿500次',
    description: '钢铁与熔岩的交响曲'
  },
  {
    id: 3,
    name: '第三纪元',
    subtitle: '深度矿区',
    levels: [11, 12, 13, 14, 15],
    ores: ['silver', 'gold', 'diamond', 'rareOre'],
    unlockCondition: '第二纪元通关',
    description: '越深藏着越珍贵的宝藏'
  },
  {
    id: 4,
    name: '第四纪元',
    subtitle: '极地矿区',
    levels: [16, 17, 18, 19, 20],
    ores: ['coldIron', 'rareOre', 'iceCrystal', 'frozenDiamond'],
    unlockCondition: '第三纪元通关',
    description: '永冻层下的战略资源'
  },
  {
    id: 5,
    name: '第五纪元',
    subtitle: '太空矿区',
    levels: [21, 22, 23, 24, 25],
    ores: ['moonIron', 'spaceAlloy', 'meteorDiamond', 'antiGravity', 'starFragment', 'moonEssence'],
    unlockCondition: '第四纪元通关',
    description: '月球陨石坑的奇迹'
  },
  {
    id: 6,
    name: '第六纪元+',
    subtitle: '深空矿区',
    levels: [26, 27, 28, 29, 30],
    ores: ['starFragment', 'moonEssence', 'meteorDiamond', 'antiGravity', 'spaceAlloy', 'moonIron'],
    unlockCondition: '第五纪元通关',
    description: '星际采矿新时代'
  }
];

const EQUIPMENT_COSTS = {
  pickaxe: {
    2: { coal: 50 },
    3: { coal: 150 },
    4: { iron: 100 },
    5: { copper: 50 }
  },
  explosives: {
    2: { iron: 30 },
    3: { iron: 80 },
    4: { copper: 50 },
    5: { silver: 20 }
  },
  drill: {
    2: { copper: 20 },
    3: { copper: 60 },
    4: { silver: 40 },
    5: { gold: 15 }
  },
  transport: {
    2: { silver: 15 },
    3: { silver: 50 },
    4: { gold: 30 },
    5: { diamond: 5 }
  },
  detector: {
    2: { gold: 10 },
    3: { gold: 30 },
    4: { diamond: 10 },
    5: { diamond: 20 }
  },
  autoMiner: {
    2: { diamond: 5 },
    3: { diamond: 15 },
    4: { diamond: 30 },
    5: { rareOre: 10 }
  },
  coolingDevice: {
    2: { iceCrystal: 10 },
    3: { iceCrystal: 25 },
    4: { frozenDiamond: 5 },
    5: { frozenDiamond: 15 }
  },
  thruster: {
    2: { meteorDiamond: 5 },
    3: { meteorDiamond: 15 },
    4: { starFragment: 1 },
    5: { moonEssence: 1 }
  }
};

const ORE_DISTRIBUTION = {
  1: [
    { oreId: 'coal', chance: 0.80, depthBonus: 0 },
    { oreId: 'iron', chance: 0.15, depthBonus: 0.05 },
    { oreId: 'copper', chance: 0.05, depthBonus: 0.03 }
  ],
  2: [
    { oreId: 'copper', chance: 0.40, depthBonus: 0 },
    { oreId: 'silver', chance: 0.30, depthBonus: 0.05 },
    { oreId: 'gold', chance: 0.20, depthBonus: 0.08 },
    { oreId: 'diamond', chance: 0.10, depthBonus: 0.07 }
  ],
  3: [
    { oreId: 'silver', chance: 0.25, depthBonus: 0 },
    { oreId: 'gold', chance: 0.25, depthBonus: 0.05 },
    { oreId: 'diamond', chance: 0.20, depthBonus: 0.08 },
    { oreId: 'rareOre', chance: 0.20, depthBonus: 0.10 }
  ],
  4: [
    { oreId: 'coldIron', chance: 0.30, depthBonus: 0 },
    { oreId: 'rareOre', chance: 0.30, depthBonus: 0.05 },
    { oreId: 'iceCrystal', chance: 0.25, depthBonus: 0.08 },
    { oreId: 'frozenDiamond', chance: 0.15, depthBonus: 0.10 }
  ],
  5: [
    { oreId: 'moonIron', chance: 0.25, depthBonus: 0 },
    { oreId: 'spaceAlloy', chance: 0.25, depthBonus: 0.03 },
    { oreId: 'meteorDiamond', chance: 0.20, depthBonus: 0.05 },
    { oreId: 'antiGravity', chance: 0.20, depthBonus: 0.05 },
    { oreId: 'starFragment', chance: 0.05, depthBonus: 0.02 },
    { oreId: 'moonEssence', chance: 0.05, depthBonus: 0.02 }
  ],
  6: [
    { oreId: 'meteorDiamond', chance: 0.25, depthBonus: 0 },
    { oreId: 'antiGravity', chance: 0.25, depthBonus: 0.03 },
    { oreId: 'starFragment', chance: 0.25, depthBonus: 0.05 },
    { oreId: 'moonEssence', chance: 0.25, depthBonus: 0.05 }
  ]
};

function getEraByLayer(layer) {
  if (layer >= 26) return 6;
  if (layer >= 21) return 5;
  if (layer >= 16) return 4;
  if (layer >= 11) return 3;
  if (layer >= 6) return 2;
  return 1;
}

function getLayerSize(layer) {
  const n = layer + 1;
  return {
    dimension: n,
    totalBlocks: n * n * n
  };
}

function generateOreForBlock(layer, depth) {
  const era = getEraByLayer(layer);
  const distribution = ORE_DISTRIBUTION[era];
  const depthNormalized = depth;

  for (const oreData of distribution) {
    const effectiveChance = oreData.chance + (oreData.depthBonus || 0) * depthNormalized;
    if (Math.random() < effectiveChance) {
      return oreData.oreId;
    }
  }

  return distribution[0].oreId;
}

function generateMineField(layer) {
  const sizeInfo = getLayerSize(layer);
  const dimension = sizeInfo.dimension;
  const blocks = [];

  for (let y = 0; y < dimension; y++) {
    const layerBlocks = [];
    for (let z = 0; z < dimension; z++) {
      const row = [];
      for (let x = 0; x < dimension; x++) {
        const depth = y / (dimension - 1 || 1);
        const oreId = generateOreForBlock(layer, depth);
        row.push({
          x, y, z,
          oreId,
          mined: false
        });
      }
      layerBlocks.push(row);
    }
    blocks.push(layerBlocks);
  }

  return {
    layer,
    size: dimension,
    totalBlocks: sizeInfo.totalBlocks,
    blocks,
    blocksRemaining: sizeInfo.totalBlocks
  };
}

module.exports = {
  ORES,
  EQUIPMENT,
  ERAS,
  EQUIPMENT_COSTS,
  ORE_DISTRIBUTION,
  getEraByLayer,
  getLayerSize,
  generateOreForBlock,
  generateMineField
};
