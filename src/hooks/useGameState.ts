import { useState, useCallback, useEffect, useRef } from 'react';

export type HorseRarity = 'comum' | 'raro' | 'épico' | 'lendário';

export interface Horse {
  id: string;
  name: string;
  rarity: HorseRarity;
  isAdult: boolean;
  lastFedAt: number;
  dead: boolean;
}

export interface Animal {
  id: string;
  type: 'vaca' | 'ovelha' | 'galinha';
  hungry: boolean;
}

export type CropType = 'trigo' | 'milho' | 'cenoura';

export interface CropPlot {
  id: number;
  crop: CropType | null;
  plantedAt: number | null;
  growTime: number;
  ready: boolean;
}

export interface MineSlot {
  id: number;
  available: boolean;
  cooldownEnd: number | null;
}

export interface HerbNode {
  id: number;
  type: 'erva' | 'semente-medicinal';
  available: boolean;
  cooldownEnd: number | null;
}

export type ScrollRarity = 'comum' | 'raro' | 'épico';

export type QuestObjectiveType =
  | 'collect_wood'
  | 'mine_ore'
  | 'collect_herbs'
  | 'travel_estabulo'
  | 'travel_pub'
  | 'travel_fazenda';

export interface ScrollQuest {
  id: string;
  rarity: ScrollRarity;
  mapX: number;
  mapY: number;
  expiresAt: number;
  objective: { type: QuestObjectiveType; label: string; target: number };
  progress: number;
  completed: boolean;
  goldReward: number;
}

export interface Raid {
  area: LocationId;
  startedAt: number;
  endsAt: number; // 30 min lock
}

export type Weather = 'clear' | 'rain' | 'snow' | 'drought';
export type LocationId = 'fazenda' | 'pasto' | 'estabulo' | 'mercado' | 'medicina' | 'pub' | 'floresta' | 'mina' | 'arena';

export interface GameState {
  playerName: string;
  level: number;
  xp: number;
  gold: number;
  diamonds: number;
  influence: number;
  maxInfluence: number;
  horses: Horse[];
  mountedHorseId: string | null;
  animals: Animal[];
  inventory: Record<string, number>;
  trees: { available: boolean; cooldownEnd: number | null }[];
  herbs: HerbNode[];
  crops: CropPlot[];
  mineSlots: MineSlot[];
  currentLocation: LocationId | null;
  travelingTo: LocationId | null;
  travelEndTime: number | null;
  weather: Weather;
  surpriseBoxAvailableAt: number;
  // Scroll quest system
  activeScrollQuest: ScrollQuest | null;
  scrollNextSpawnAt: number;
  // Raid system
  activeRaids: Raid[];
  raidNextCheckAt: number;
  // Notifications
  lastNotification: { message: string; type: 'success' | 'error' | 'warning'; at: number } | null;
}

const TRAVEL_TIME_BASE = 10000;

const raritySpeedMultiplier: Record<HorseRarity, number> = {
  'comum': 0.8, 'raro': 0.6, 'épico': 0.4, 'lendário': 0.25,
};

const rarityWoodBonus: Record<HorseRarity, number> = {
  'comum': 1, 'raro': 2, 'épico': 3, 'lendário': 5,
};

const rarityMineBonus: Record<HorseRarity, number> = {
  'comum': 1, 'raro': 2, 'épico': 3, 'lendário': 5,
};

export const CROP_GROW_TIMES: Record<CropType, number> = {
  'trigo': 30000, 'milho': 60000, 'cenoura': 45000,
};

const CROP_YIELDS: Record<CropType, { item: string; amount: number }> = {
  'trigo': { item: 'Trigo', amount: 2 },
  'milho': { item: 'Milho', amount: 3 },
  'cenoura': { item: 'Cenoura', amount: 2 },
};

export const SEED_NAMES: Record<CropType, string> = {
  'trigo': 'Semente Trigo',
  'milho': 'Semente Milho',
  'cenoura': 'Semente Cenoura',
};

const MINE_COOLDOWN = 120000;
const HORSE_HUNGER_DEATH = 30 * 60 * 1000; // 30 min
const RAID_DURATION = 30 * 60 * 1000; // 30 min lock

function randomCooldown() {
  const options = [10, 15, 20, 25, 30];
  return options[Math.floor(Math.random() * options.length)] * 60 * 1000;
}

const SCROLL_SPAWN_INTERVALS = [10, 15, 20, 30, 60];
function randomScrollInterval() {
  return SCROLL_SPAWN_INTERVALS[Math.floor(Math.random() * SCROLL_SPAWN_INTERVALS.length)] * 60 * 1000;
}

const QUEST_OBJECTIVES: { type: QuestObjectiveType; label: string; target: number }[] = [
  { type: 'collect_wood', label: 'Colete 2 madeiras', target: 2 },
  { type: 'mine_ore', label: 'Minere 1 minério', target: 1 },
  { type: 'collect_herbs', label: 'Colete 2 ervas', target: 2 },
  { type: 'travel_estabulo', label: 'Viaje ao Estábulo', target: 1 },
  { type: 'travel_pub', label: 'Viaje ao Pub', target: 1 },
  { type: 'travel_fazenda', label: 'Viaje à Fazenda', target: 1 },
];

const SCROLL_REWARDS: Record<ScrollRarity, number> = {
  'comum': 15, 'raro': 35, 'épico': 75,
};

const WEATHERS: Weather[] = ['clear', 'rain', 'snow', 'drought'];

const RAIDABLE_AREAS: LocationId[] = ['fazenda', 'floresta', 'mercado', 'pasto'];

// Market items with costs
export const MARKET_ITEMS = [
  { item: 'Semente Trigo', cost: 3, icon: '🌾' },
  { item: 'Semente Milho', cost: 5, icon: '🌽' },
  { item: 'Semente Cenoura', cost: 4, icon: '🥕' },
  { item: 'Frutas', cost: 8, icon: '🍇' },
  { item: 'Picareta', cost: 25, icon: '⛏️' },
  { item: 'Escudo', cost: 40, icon: '🛡️' },
  { item: 'Ração', cost: 10, icon: '🌾' },
];

const initialState: GameState = {
  playerName: 'Jogador',
  level: 1,
  xp: 0,
  gold: 80,
  diamonds: 5,
  influence: 20,
  maxInfluence: 100,
  horses: [],
  mountedHorseId: null,
  animals: [
    { id: '1', type: 'vaca', hungry: false },
    { id: '2', type: 'galinha', hungry: true },
  ],
  inventory: { 'Madeira': 3 },
  trees: [
    { available: true, cooldownEnd: null },
    { available: true, cooldownEnd: null },
    { available: true, cooldownEnd: null },
  ],
  herbs: [
    { id: 0, type: 'erva', available: true, cooldownEnd: null },
    { id: 1, type: 'semente-medicinal', available: true, cooldownEnd: null },
    { id: 2, type: 'erva', available: true, cooldownEnd: null },
  ],
  crops: [
    { id: 0, crop: null, plantedAt: null, growTime: 0, ready: false },
    { id: 1, crop: null, plantedAt: null, growTime: 0, ready: false },
    { id: 2, crop: null, plantedAt: null, growTime: 0, ready: false },
    { id: 3, crop: null, plantedAt: null, growTime: 0, ready: false },
  ],
  mineSlots: [
    { id: 0, available: true, cooldownEnd: null },
    { id: 1, available: true, cooldownEnd: null },
    { id: 2, available: true, cooldownEnd: null },
  ],
  currentLocation: null,
  travelingTo: null,
  travelEndTime: null,
  weather: 'clear',
  surpriseBoxAvailableAt: Date.now() + 5000,
  activeScrollQuest: null,
  scrollNextSpawnAt: Date.now() + 60000, // first scroll in 1 min
  activeRaids: [],
  raidNextCheckAt: Date.now() + 5 * 60 * 1000,
  lastNotification: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const notify = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setState(s => ({ ...s, lastNotification: { message, type, at: Date.now() } }));
  }, []);

  // Weather cycle
  useEffect(() => {
    const updateWeather = () => {
      const hourIndex = Math.floor(Date.now() / 3600000) % WEATHERS.length;
      setState(s => ({ ...s, weather: WEATHERS[hourIndex] }));
    };
    updateWeather();
    const interval = setInterval(updateWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  // Main tick: cooldowns, crop growth, horse hunger, scroll spawns, raids
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setState(s => {
        let newState = { ...s };

        // Tree cooldowns
        newState.trees = s.trees.map(t =>
          !t.available && t.cooldownEnd && now >= t.cooldownEnd
            ? { available: true, cooldownEnd: null } : t
        );

        // Herb cooldowns
        newState.herbs = s.herbs.map(h =>
          !h.available && h.cooldownEnd && now >= h.cooldownEnd
            ? { ...h, available: true, cooldownEnd: null } : h
        );

        // Mine cooldowns
        newState.mineSlots = s.mineSlots.map(m =>
          !m.available && m.cooldownEnd && now >= m.cooldownEnd
            ? { ...m, available: true, cooldownEnd: null } : m
        );

        // Crop growth
        newState.crops = s.crops.map(c =>
          c.crop && c.plantedAt && !c.ready && now >= c.plantedAt + c.growTime
            ? { ...c, ready: true } : c
        );

        // Horse hunger - kill starved horses
        newState.horses = s.horses.map(h => {
          if (h.dead) return h;
          if (now - h.lastFedAt >= HORSE_HUNGER_DEATH) {
            return { ...h, dead: true };
          }
          return h;
        });
        // Unmount dead horse
        const mounted = newState.horses.find(h => h.id === newState.mountedHorseId);
        if (mounted?.dead) {
          newState.mountedHorseId = null;
        }

        // Scroll quest expiry
        if (s.activeScrollQuest && !s.activeScrollQuest.completed && now >= s.activeScrollQuest.expiresAt) {
          newState.activeScrollQuest = null;
        }

        // Scroll quest spawn
        if (!newState.activeScrollQuest && now >= s.scrollNextSpawnAt) {
          const rarities: ScrollRarity[] = ['comum', 'comum', 'comum', 'raro', 'raro', 'épico'];
          const rarity = rarities[Math.floor(Math.random() * rarities.length)];
          const obj = QUEST_OBJECTIVES[Math.floor(Math.random() * QUEST_OBJECTIVES.length)];
          newState.activeScrollQuest = {
            id: now.toString(),
            rarity,
            mapX: 20 + Math.random() * 60,
            mapY: 20 + Math.random() * 60,
            expiresAt: now + 2 * 60 * 1000, // 2 min visible
            objective: { ...obj },
            progress: 0,
            completed: false,
            goldReward: SCROLL_REWARDS[rarity],
          };
        }

        // Raid check
        if (now >= s.raidNextCheckAt) {
          newState.raidNextCheckAt = now + (5 + Math.random() * 10) * 60 * 1000;
          // 30% chance of raid
          if (Math.random() < 0.3) {
            const area = RAIDABLE_AREAS[Math.floor(Math.random() * RAIDABLE_AREAS.length)];
            const alreadyRaided = newState.activeRaids.some(r => r.area === area);
            if (!alreadyRaided) {
              newState.activeRaids = [...newState.activeRaids, {
                area,
                startedAt: now,
                endsAt: now + RAID_DURATION,
              }];
              newState.lastNotification = {
                message: `⚠️ Sua ${area === 'fazenda' ? 'Fazenda' : area === 'floresta' ? 'Floresta' : area === 'mercado' ? 'Mercado' : 'Pasto'} está sob ataque!`,
                type: 'warning',
                at: now,
              };
            }
          }
        }

        // Expire raids
        newState.activeRaids = newState.activeRaids.filter(r => now < r.endsAt);

        return newState;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getMountedHorse = useCallback((): Horse | null => {
    const h = stateRef.current.horses.find(h => h.id === stateRef.current.mountedHorseId);
    return h && !h.dead ? h : null;
  }, []);

  const getTravelTime = useCallback(() => {
    const horse = getMountedHorse();
    if (!horse) return TRAVEL_TIME_BASE;
    return TRAVEL_TIME_BASE * raritySpeedMultiplier[horse.rarity];
  }, [getMountedHorse]);

  const isAreaRaided = useCallback((area: LocationId) => {
    return stateRef.current.activeRaids.some(r => r.area === area);
  }, []);

  const startTravel = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (s.currentLocation === locationId) return;
    if (!s.mountedHorseId) {
      notify('🐎 Você precisa montar um cavalo para viajar!', 'error');
      return;
    }
    const mounted = s.horses.find(h => h.id === s.mountedHorseId);
    if (!mounted || mounted.dead) {
      notify('💀 Seu cavalo morreu de fome!', 'error');
      return;
    }
    if (locationId === 'medicina') {
      notify('🔒 Área não desbloqueada ainda.', 'error');
      return;
    }
    if (isAreaRaided(locationId)) {
      notify('⚔️ Essa área está sob ataque! Use um Escudo ou aguarde.', 'error');
      return;
    }
    const travelTime = getTravelTime();
    setState(s => ({
      ...s,
      travelingTo: locationId,
      travelEndTime: Date.now() + travelTime,
    }));
  }, [getTravelTime, notify, isAreaRaided]);

  const completeTravel = useCallback(() => {
    setState(s => {
      const dest = s.travelingTo;
      let newState = {
        ...s,
        currentLocation: dest,
        travelingTo: null,
        travelEndTime: null,
      };
      // Track quest progress for travel objectives
      if (dest && s.activeScrollQuest && !s.activeScrollQuest.completed) {
        const q = s.activeScrollQuest;
        if (
          (q.objective.type === 'travel_estabulo' && dest === 'estabulo') ||
          (q.objective.type === 'travel_pub' && dest === 'pub') ||
          (q.objective.type === 'travel_fazenda' && dest === 'fazenda')
        ) {
          const newProgress = Math.min(q.progress + 1, q.objective.target);
          const completed = newProgress >= q.objective.target;
          newState.activeScrollQuest = { ...q, progress: newProgress, completed };
          if (completed) {
            newState.gold = newState.gold + q.goldReward;
            newState.xp = newState.xp + 20;
            newState.scrollNextSpawnAt = Date.now() + randomScrollInterval();
            newState.lastNotification = {
              message: `✅ Quest completa! +${q.goldReward} ouro`,
              type: 'success',
              at: Date.now(),
            };
          }
        }
      }
      return newState;
    });
  }, []);

  const accelerateTravel = useCallback(() => {
    if (stateRef.current.diamonds >= 1) {
      setState(s => {
        const dest = s.travelingTo;
        let newState = {
          ...s,
          diamonds: s.diamonds - 1,
          currentLocation: dest,
          travelingTo: null,
          travelEndTime: null,
        };
        return newState;
      });
    }
  }, []);

  const collectTree = useCallback((index: number) => {
    const horse = getMountedHorse();
    const woodAmount = horse ? rarityWoodBonus[horse.rarity] : 1;
    setState(s => {
      if (!s.trees[index]?.available) return s;
      const newInv = { ...s.inventory, 'Madeira': (s.inventory['Madeira'] || 0) + woodAmount };
      let newState = {
        ...s,
        trees: s.trees.map((t, i) => i === index ? { available: false, cooldownEnd: Date.now() + randomCooldown() } : t),
        inventory: newInv,
        xp: s.xp + 5,
        lastNotification: { message: `🪵 +${woodAmount} Madeira`, type: 'success' as const, at: Date.now() },
      };
      // Quest progress
      if (s.activeScrollQuest && !s.activeScrollQuest.completed && s.activeScrollQuest.objective.type === 'collect_wood') {
        const q = s.activeScrollQuest;
        const newP = Math.min(q.progress + woodAmount, q.objective.target);
        const done = newP >= q.objective.target;
        newState.activeScrollQuest = { ...q, progress: newP, completed: done };
        if (done) {
          newState.gold += q.goldReward;
          newState.xp += 20;
          newState.scrollNextSpawnAt = Date.now() + randomScrollInterval();
          newState.lastNotification = { message: `✅ Quest completa! +${q.goldReward} ouro`, type: 'success', at: Date.now() };
        }
      }
      return newState;
    });
  }, [getMountedHorse]);

  const collectHerb = useCallback((herbId: number) => {
    setState(s => {
      const herb = s.herbs.find(h => h.id === herbId);
      if (!herb || !herb.available) return s;
      const itemName = herb.type === 'erva' ? 'Erva' : 'Semente Medicinal';
      const newInv = { ...s.inventory, [itemName]: (s.inventory[itemName] || 0) + 1 };
      let newState = {
        ...s,
        herbs: s.herbs.map(h => h.id === herbId ? { ...h, available: false, cooldownEnd: Date.now() + randomCooldown() } : h),
        inventory: newInv,
        xp: s.xp + 3,
        lastNotification: { message: `🌿 +1 ${itemName}`, type: 'success' as const, at: Date.now() },
      };
      // Quest
      if (s.activeScrollQuest && !s.activeScrollQuest.completed && s.activeScrollQuest.objective.type === 'collect_herbs') {
        const q = s.activeScrollQuest;
        const newP = Math.min(q.progress + 1, q.objective.target);
        const done = newP >= q.objective.target;
        newState.activeScrollQuest = { ...q, progress: newP, completed: done };
        if (done) {
          newState.gold += q.goldReward;
          newState.xp += 20;
          newState.scrollNextSpawnAt = Date.now() + randomScrollInterval();
          newState.lastNotification = { message: `✅ Quest completa! +${q.goldReward} ouro`, type: 'success', at: Date.now() };
        }
      }
      return newState;
    });
  }, []);

  const plantCrop = useCallback((plotId: number, cropType: CropType) => {
    const seedName = SEED_NAMES[cropType];
    setState(s => {
      const seedCount = s.inventory[seedName] || 0;
      if (seedCount <= 0) {
        return { ...s, lastNotification: { message: `❌ Você não tem ${seedName}.`, type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        inventory: { ...s.inventory, [seedName]: seedCount - 1 },
        crops: s.crops.map(c => c.id === plotId ? {
          ...c, crop: cropType, plantedAt: Date.now(), growTime: CROP_GROW_TIMES[cropType], ready: false,
        } : c),
      };
    });
  }, []);

  const harvestCrop = useCallback((plotId: number) => {
    setState(s => {
      const plot = s.crops.find(c => c.id === plotId);
      if (!plot || !plot.crop || !plot.ready) return s;
      const yield_ = CROP_YIELDS[plot.crop];
      return {
        ...s,
        crops: s.crops.map(c => c.id === plotId ? { ...c, crop: null, plantedAt: null, growTime: 0, ready: false } : c),
        inventory: { ...s.inventory, [yield_.item]: (s.inventory[yield_.item] || 0) + yield_.amount },
        xp: s.xp + 10,
        lastNotification: { message: `🌾 +${yield_.amount} ${yield_.item}`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  const mineGold = useCallback((slotId: number) => {
    setState(s => {
      const pickaxeCount = s.inventory['Picareta'] || 0;
      if (pickaxeCount <= 0) {
        return { ...s, lastNotification: { message: '❌ Você precisa de uma picareta para minerar.', type: 'error' as const, at: Date.now() } };
      }
      const slot = s.mineSlots.find(m => m.id === slotId);
      if (!slot || !slot.available) return s;
      const horse = s.horses.find(h => h.id === s.mountedHorseId && !h.dead);
      const diamondAmount = 1 + (horse ? rarityMineBonus[horse.rarity] : 0);
      let newState = {
        ...s,
        mineSlots: s.mineSlots.map(m => m.id === slotId ? { ...m, available: false, cooldownEnd: Date.now() + MINE_COOLDOWN } : m),
        diamonds: s.diamonds + diamondAmount,
        xp: s.xp + 8,
        influence: Math.min(s.maxInfluence, s.influence + 2),
        lastNotification: { message: `💎 +${diamondAmount} Diamantes`, type: 'success' as const, at: Date.now() },
      };
      // Quest
      if (s.activeScrollQuest && !s.activeScrollQuest.completed && s.activeScrollQuest.objective.type === 'mine_ore') {
        const q = s.activeScrollQuest;
        const newP = Math.min(q.progress + 1, q.objective.target);
        const done = newP >= q.objective.target;
        newState.activeScrollQuest = { ...q, progress: newP, completed: done };
        if (done) {
          newState.gold = (newState.gold || s.gold) + q.goldReward;
          newState.xp += 20;
          newState.scrollNextSpawnAt = Date.now() + randomScrollInterval();
          newState.lastNotification = { message: `✅ Quest completa! +${q.goldReward} ouro`, type: 'success', at: Date.now() };
        }
      }
      return newState;
    });
  }, []);

  const buyHorse = useCallback((rarity: HorseRarity) => {
    const costs: Record<HorseRarity, number> = { 'comum': 20, 'raro': 50, 'épico': 100, 'lendário': 200 };
    const cost = costs[rarity];
    setState(s => {
      if (s.gold < cost) {
        return { ...s, lastNotification: { message: '❌ Ouro insuficiente.', type: 'error' as const, at: Date.now() } };
      }
      const aliveHorses = s.horses.filter(h => !h.dead);
      if (aliveHorses.length >= 2) {
        return { ...s, lastNotification: { message: '❌ Você já tem 2 cavalos vivos.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        gold: s.gold - cost,
        horses: [...s.horses, {
          id: Date.now().toString(), name: `Potro ${rarity}`, rarity, isAdult: false,
          lastFedAt: Date.now(), dead: false,
        }],
        lastNotification: { message: `🐴 Novo potro ${rarity} comprado!`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  const evolveHorse = useCallback((horseId: string) => {
    setState(s => ({
      ...s,
      horses: s.horses.map(h => h.id === horseId && !h.dead ? { ...h, isAdult: true, name: h.name.replace('Potro', 'Cavalo') } : h),
    }));
  }, []);

  const mountHorse = useCallback((horseId: string | null) => {
    setState(s => {
      if (horseId) {
        const horse = s.horses.find(h => h.id === horseId);
        if (!horse || horse.dead) {
          return { ...s, lastNotification: { message: '❌ Cavalo morto.', type: 'error' as const, at: Date.now() } };
        }
      }
      return { ...s, mountedHorseId: horseId };
    });
  }, []);

  const feedHorse = useCallback((horseId: string) => {
    setState(s => {
      const food = s.inventory['Ração'] || 0;
      if (food <= 0) {
        return { ...s, lastNotification: { message: '❌ Sem ração! Compre no Mercado.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        inventory: { ...s.inventory, 'Ração': food - 1 },
        horses: s.horses.map(h => h.id === horseId && !h.dead ? { ...h, lastFedAt: Date.now() } : h),
        lastNotification: { message: '🌾 Cavalo alimentado!', type: 'success', at: Date.now() },
      };
    });
  }, []);

  const removeDeadHorse = useCallback((horseId: string) => {
    setState(s => ({
      ...s,
      horses: s.horses.filter(h => h.id !== horseId),
      mountedHorseId: s.mountedHorseId === horseId ? null : s.mountedHorseId,
    }));
  }, []);

  const collectSurpriseBox = useCallback(() => {
    setState(s => ({
      ...s,
      gold: s.gold + 10,
      diamonds: s.diamonds + 1,
      inventory: { ...s.inventory, 'Frutas': (s.inventory['Frutas'] || 0) + 3 },
      surpriseBoxAvailableAt: Date.now() + 7200000,
    }));
  }, []);

  const buyItem = useCallback((item: string, cost: number) => {
    setState(s => {
      if (s.gold < cost) {
        return { ...s, lastNotification: { message: '❌ Ouro insuficiente.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        gold: s.gold - cost,
        inventory: { ...s.inventory, [item]: (s.inventory[item] || 0) + 1 },
        lastNotification: { message: `✅ ${item} comprado! (-${cost} ouro)`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  const useShield = useCallback((area: LocationId) => {
    setState(s => {
      const shields = s.inventory['Escudo'] || 0;
      if (shields <= 0) {
        return { ...s, lastNotification: { message: '❌ Sem escudos! Compre no Mercado.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        inventory: { ...s.inventory, 'Escudo': shields - 1 },
        activeRaids: s.activeRaids.filter(r => r.area !== area),
        lastNotification: { message: `🛡️ Ataque em ${area} cancelado!`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  const pickupScroll = useCallback(() => {
    // Player "accepts" the scroll quest - must travel there first handled by map click
    // Just mark as picked up (keep it active, remove from map)
    setState(s => {
      if (!s.activeScrollQuest) return s;
      return {
        ...s,
        lastNotification: {
          message: `📜 Quest: ${s.activeScrollQuest.objective.label} (${s.activeScrollQuest.rarity})`,
          type: 'success',
          at: Date.now(),
        },
      };
    });
  }, []);

  const goToMap = useCallback(() => {
    setState(s => ({ ...s, currentLocation: null }));
  }, []);

  return {
    state,
    startTravel, completeTravel, accelerateTravel,
    collectTree, collectHerb,
    plantCrop, harvestCrop, mineGold,
    buyHorse, evolveHorse, mountHorse, feedHorse, removeDeadHorse,
    collectSurpriseBox, buyItem,
    useShield, pickupScroll,
    goToMap, getMountedHorse, getTravelTime, isAreaRaided,
  };
}
