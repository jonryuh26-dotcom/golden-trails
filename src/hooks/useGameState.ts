import { useState, useCallback, useEffect, useRef } from 'react';

export type HorseRarity = 'comum' | 'raro' | 'épico' | 'lendário' | 'mítico';

export interface Horse {
  id: string;
  name: string;
  rarity: HorseRarity;
  speed: number;
  isAdult: boolean;
  lastFedAt: number;
  dead: boolean;
}

export type PastureAnimalType = 'vaca' | 'ovelha' | 'galinha';

export interface PastureAnimal {
  id: string;
  type: PastureAnimalType;
  lastFedAt: number;
  sickAt: number | null;
  dead: boolean;
  lastMilkAt?: number;
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

export type ScrollRarity = 'comum' | 'raro' | 'épico' | 'lendário' | 'mítico';

export type QuestObjectiveType =
  | 'collect_wood'
  | 'mine_ore'
  | 'collect_herbs'
  | 'travel_estabulo'
  | 'travel_pub'
  | 'travel_fazenda'
  | 'find_npc';

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
  diamondReward: number;
  story?: string;
  npcName?: string;
}

export interface Raid {
  area: LocationId;
  startedAt: number;
  endsAt: number;
}

export interface CollectionProgress {
  type: 'tree' | 'herb' | 'mine';
  index: number;
  startedAt: number;
  duration: number;
}

export type Weather = 'clear' | 'rain' | 'snow' | 'drought';
export type LocationId = 'fazenda' | 'pasto' | 'estabulo' | 'mercado' | 'medicina' | 'pub' | 'floresta' | 'mina' | 'arena';
export type MapId = 'map1' | 'map2' | 'map3';

export type CardRarity = 'comum' | 'raro' | 'épico' | 'lendário' | 'mítico';
export type CardBonusType = 'resource_production' | 'morale_boost' | 'gold_find' | 'defense' | 'speed';

export interface ExplorationCard {
  id: string;
  name: string;
  rarity: CardRarity;
  bonusType: CardBonusType;
  bonusValue: number;
  description: string;
  image: string; // 'pub' | 'coffee' | 'mystery' etc
}

export const CARD_DEFINITIONS: ExplorationCard[] = [
  { id: 'card_pub', name: 'Pub', rarity: 'raro', bonusType: 'morale_boost', bonusValue: 40, description: 'O moral da tropa aumenta com bebidas!', image: 'pub' },
  { id: 'card_coffee', name: 'Coffee', rarity: 'comum', bonusType: 'resource_production', bonusValue: 7, description: 'Café acelera a produção de recursos.', image: 'coffee' },
  { id: 'card_shield_master', name: 'Mestre Escudo', rarity: 'épico', bonusType: 'defense', bonusValue: 25, description: 'Defesa aprimorada contra invasões.', image: 'mystery' },
  { id: 'card_swift_wind', name: 'Vento Veloz', rarity: 'lendário', bonusType: 'speed', bonusValue: 30, description: 'Cavalos se movem mais rápido.', image: 'mystery' },
  { id: 'card_gold_touch', name: 'Toque Dourado', rarity: 'épico', bonusType: 'gold_find', bonusValue: 15, description: 'Encontre mais ouro em expedições.', image: 'mystery' },
  { id: 'card_harvest_moon', name: 'Lua da Colheita', rarity: 'raro', bonusType: 'resource_production', bonusValue: 12, description: 'Colheitas rendem mais.', image: 'mystery' },
  { id: 'card_war_horn', name: 'Corneta de Guerra', rarity: 'mítico', bonusType: 'morale_boost', bonusValue: 60, description: 'O som ecoa por toda a terra.', image: 'mystery' },
];

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
  pastureAnimals: PastureAnimal[];
  inventory: Record<string, number>;
  cards: Record<string, number>; // cardId -> quantity
  equippedCardId: string | null;
  explorationSlotDestroyed: boolean;
  trees: { available: boolean; cooldownEnd: number | null }[];
  herbs: HerbNode[];
  crops: CropPlot[];
  mineSlots: MineSlot[];
  currentLocation: LocationId | null;
  travelingTo: LocationId | null;
  travelEndTime: number | null;
  weather: Weather;
  surpriseBoxAvailableAt: number;
  activeScrollQuest: ScrollQuest | null;
  scrollNextSpawnAt: number;
  activeRaids: Raid[];
  raidNextCheckAt: number;
  activeCollection: CollectionProgress | null;
  lastNotification: { message: string; type: 'success' | 'error' | 'warning'; at: number } | null;
  currentMap: MapId;
  completedScrollQuests: number;
  animals: { id: string; type: string; hungry: boolean }[];
}

const TRAVEL_TIME_BASE = 12000;

export const HORSE_SPEED: Record<HorseRarity, number> = {
  'comum': 15, 'raro': 25, 'épico': 40, 'lendário': 60, 'mítico': 80,
};

function calcTravelTime(speed: number) {
  return Math.round(TRAVEL_TIME_BASE / (1 + speed / 20));
}

const rarityWoodBonus: Record<HorseRarity, number> = {
  'comum': 1, 'raro': 2, 'épico': 3, 'lendário': 5, 'mítico': 8,
};

const rarityMineBonus: Record<HorseRarity, number> = {
  'comum': 1, 'raro': 2, 'épico': 3, 'lendário': 5, 'mítico': 8,
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
const HORSE_HUNGER_DEATH = 30 * 60 * 1000;
const ANIMAL_HUNGER_DEATH = 60 * 60 * 1000; // 1 hour
const ANIMAL_SICK_INTERVAL = 60 * 60 * 1000; // 1 hour
const RAID_DURATION = 30 * 60 * 1000;

const COLLECT_TREE_DURATION = 3000;
const COLLECT_HERB_DURATION = 2000;
const COLLECT_MINE_DURATION = 4000;

function randomCooldown() {
  const options = [10, 15, 20, 25, 30];
  return options[Math.floor(Math.random() * options.length)] * 60 * 1000;
}

// Scroll spawns every 10 minutes
function randomScrollInterval() {
  return 10 * 60 * 1000;
}

// Quest stories
const QUEST_STORIES: { story: string; npcName: string; objective: { type: QuestObjectiveType; label: string; target: number } }[] = [
  { story: 'Thomas está procurando Ada. Contrabandistas roubaram pérolas.', npcName: 'Thomas', objective: { type: 'find_npc', label: 'Encontre Ada no Pub', target: 1 } },
  { story: 'Arthur perdeu seu cavalo. Ajude-o a encontrar!', npcName: 'Arthur', objective: { type: 'travel_estabulo', label: 'Vá ao Estábulo por Arthur', target: 1 } },
  { story: 'John está esperando no pasto. Ele precisa de ajuda!', npcName: 'John', objective: { type: 'travel_fazenda', label: 'Encontre John na Fazenda', target: 1 } },
  { story: 'Nina precisa de madeira para construir um abrigo.', npcName: 'Nina', objective: { type: 'collect_wood', label: 'Colete 2 madeiras para Nina', target: 2 } },
  { story: 'Thomas precisa de minérios para forjar uma espada.', npcName: 'Thomas', objective: { type: 'mine_ore', label: 'Minere 1 minério para Thomas', target: 1 } },
  { story: 'Nina está doente e precisa de ervas medicinais.', npcName: 'Nina', objective: { type: 'collect_herbs', label: 'Colete 2 ervas para Nina', target: 2 } },
  { story: 'Arthur quer celebrar no Pub. Encontre-o lá!', npcName: 'Arthur', objective: { type: 'travel_pub', label: 'Vá ao Pub encontrar Arthur', target: 1 } },
  { story: 'John precisa de suprimentos da Fazenda.', npcName: 'John', objective: { type: 'travel_fazenda', label: 'Viaje à Fazenda para John', target: 1 } },
];

// Scroll rewards by rarity
function getScrollRewards(rarity: ScrollRarity): { gold: number; diamonds: number } {
  switch (rarity) {
    case 'comum': return { gold: 250 + Math.floor(Math.random() * 251), diamonds: 0 };
    case 'raro': return { gold: 50 + Math.floor(Math.random() * 101), diamonds: 1 + Math.floor(Math.random() * 2) };
    case 'épico': return { gold: 150 + Math.floor(Math.random() * 201), diamonds: 2 + Math.floor(Math.random() * 3) };
    case 'lendário': return { gold: 350 + Math.floor(Math.random() * 401), diamonds: 3 + Math.floor(Math.random() * 4) };
    case 'mítico': return { gold: 750 + Math.floor(Math.random() * 751), diamonds: 5 + Math.floor(Math.random() * 6) };
  }
}

// Horse rarity influences scroll rarity
function getScrollRarityByHorse(horseRarity: HorseRarity | null): ScrollRarity {
  const rates: Record<string, number[]> = {
    'none':      [70, 20, 8, 2, 0],
    'comum':     [70, 20, 8, 2, 0],
    'raro':      [50, 30, 15, 4, 1],
    'épico':     [35, 30, 20, 10, 5],
    'lendário':  [20, 30, 25, 15, 10],
    'mítico':    [10, 20, 30, 25, 15],
  };
  const key = horseRarity || 'none';
  const r = rates[key];
  const roll = Math.random() * 100;
  const rarities: ScrollRarity[] = ['comum', 'raro', 'épico', 'lendário', 'mítico'];
  let acc = 0;
  for (let i = 0; i < r.length; i++) {
    acc += r[i];
    if (roll < acc) return rarities[i];
  }
  return 'comum';
}

const WEATHERS: Weather[] = ['clear', 'rain', 'snow', 'drought'];
const RAIDABLE_AREAS: LocationId[] = ['fazenda', 'floresta', 'mercado', 'pasto', 'mina', 'estabulo', 'pub', 'arena'];

export const MARKET_ITEMS = [
  { item: 'Semente Trigo', cost: 3, icon: '🌾' },
  { item: 'Semente Milho', cost: 5, icon: '🌽' },
  { item: 'Semente Cenoura', cost: 4, icon: '🥕' },
  { item: 'Frutas', cost: 8, icon: '🍇' },
  { item: 'Picareta', cost: 25, icon: '⛏️' },
  { item: 'Escudo', cost: 40, icon: '🛡️' },
  { item: 'Ração', cost: 10, icon: '🌾' },
  { item: 'Ração Animal', cost: 8, icon: '🥬' },
  { item: 'Vacina Cavalos', cost: 30, icon: '💉' },
  { item: 'Vacina Animais', cost: 25, icon: '💊' },
];

export const PASTURE_ANIMAL_COSTS: Record<PastureAnimalType, number> = {
  'vaca': 50, 'ovelha': 30, 'galinha': 15,
};

export const GACHA_WEIGHTS: { rarity: HorseRarity; weight: number; name: string }[] = [
  { rarity: 'comum', weight: 50, name: 'Cavalo Comum' },
  { rarity: 'raro', weight: 30, name: 'Cavalo Raro' },
  { rarity: 'épico', weight: 15, name: 'Cavalo Épico' },
  { rarity: 'lendário', weight: 4, name: 'Cavalo Lendário' },
  { rarity: 'mítico', weight: 1, name: 'Cavalo Mítico' },
];

export function rollGacha(): { rarity: HorseRarity; name: string } {
  const total = GACHA_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * total;
  for (const g of GACHA_WEIGHTS) {
    roll -= g.weight;
    if (roll <= 0) return { rarity: g.rarity, name: g.name };
  }
  return GACHA_WEIGHTS[0];
}

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
  pastureAnimals: [],
  animals: [],
  inventory: { 'Madeira': 3, 'Caixa Gacha Cavalo': 1 },
  cards: { 'card_coffee': 1, 'card_pub': 1 },
  equippedCardId: null,
  explorationSlotDestroyed: false,
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
  scrollNextSpawnAt: Date.now() + 30000, // first spawn in 30s
  activeRaids: [],
  raidNextCheckAt: Date.now() + 5 * 60 * 1000,
  activeCollection: null,
  lastNotification: null,
  currentMap: 'map1',
  completedScrollQuests: 0,
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

  // Main tick
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

        // Horse hunger
        newState.horses = s.horses.map(h => {
          if (h.dead) return h;
          if (now - h.lastFedAt >= HORSE_HUNGER_DEATH) {
            return { ...h, dead: true };
          }
          return h;
        });
        const mounted = newState.horses.find(h => h.id === newState.mountedHorseId);
        if (mounted?.dead) {
          newState.mountedHorseId = null;
        }

        // Pasture animal hunger & sickness
        newState.pastureAnimals = s.pastureAnimals.map(a => {
          if (a.dead) return a;
          if (now - a.lastFedAt >= ANIMAL_HUNGER_DEATH) {
            return { ...a, dead: true };
          }
          // Random sickness
          if (!a.sickAt && now - a.lastFedAt > ANIMAL_SICK_INTERVAL * 0.5 && Math.random() < 0.001) {
            return { ...a, sickAt: now };
          }
          return a;
        });

        // Collection progress completion
        if (s.activeCollection && now >= s.activeCollection.startedAt + s.activeCollection.duration) {
          const col = s.activeCollection;
          newState.activeCollection = null;
          if (col.type === 'tree') {
            const horse = newState.horses.find(h => h.id === newState.mountedHorseId && !h.dead);
            const woodAmount = horse ? rarityWoodBonus[horse.rarity] : 1;
            newState.inventory = { ...newState.inventory, 'Madeira': (newState.inventory['Madeira'] || 0) + woodAmount };
            newState.xp = newState.xp + 5;
            newState.lastNotification = { message: `🪵 +${woodAmount} Madeira`, type: 'success', at: now };
            if (newState.activeScrollQuest && !newState.activeScrollQuest.completed && newState.activeScrollQuest.objective.type === 'collect_wood') {
              const q = newState.activeScrollQuest;
              const newP = Math.min(q.progress + woodAmount, q.objective.target);
              const done = newP >= q.objective.target;
              newState.activeScrollQuest = { ...q, progress: newP, completed: done };
              if (done) {
                newState.gold += q.goldReward;
                newState.diamonds += q.diamondReward;
                newState.xp += 20;
                newState.completedScrollQuests += 1;
                newState.scrollNextSpawnAt = now + randomScrollInterval();
                newState.lastNotification = { message: `✅ Quest completa! +${q.goldReward}🪙 +${q.diamondReward}💎`, type: 'success', at: now };
              }
            }
          } else if (col.type === 'herb') {
            const herb = newState.herbs.find(h => h.id === col.index);
            if (herb) {
              const itemName = herb.type === 'erva' ? 'Erva' : 'Semente Medicinal';
              newState.inventory = { ...newState.inventory, [itemName]: (newState.inventory[itemName] || 0) + 1 };
              newState.xp = newState.xp + 3;
              newState.lastNotification = { message: `🌿 +1 ${itemName}`, type: 'success', at: now };
              if (newState.activeScrollQuest && !newState.activeScrollQuest.completed && newState.activeScrollQuest.objective.type === 'collect_herbs') {
                const q = newState.activeScrollQuest;
                const newP = Math.min(q.progress + 1, q.objective.target);
                const done = newP >= q.objective.target;
                newState.activeScrollQuest = { ...q, progress: newP, completed: done };
                if (done) {
                  newState.gold += q.goldReward;
                  newState.diamonds += q.diamondReward;
                  newState.xp += 20;
                  newState.completedScrollQuests += 1;
                  newState.scrollNextSpawnAt = now + randomScrollInterval();
                  newState.lastNotification = { message: `✅ Quest completa! +${q.goldReward}🪙 +${q.diamondReward}💎`, type: 'success', at: now };
                }
              }
            }
          } else if (col.type === 'mine') {
            const horse = newState.horses.find(h => h.id === newState.mountedHorseId && !h.dead);
            const diamondAmount = 1 + (horse ? rarityMineBonus[horse.rarity] : 0);
            newState.diamonds = newState.diamonds + diamondAmount;
            newState.xp = newState.xp + 8;
            newState.influence = Math.min(newState.maxInfluence, newState.influence + 2);
            newState.lastNotification = { message: `💎 +${diamondAmount} Diamantes`, type: 'success', at: now };
            if (newState.activeScrollQuest && !newState.activeScrollQuest.completed && newState.activeScrollQuest.objective.type === 'mine_ore') {
              const q = newState.activeScrollQuest;
              const newP = Math.min(q.progress + 1, q.objective.target);
              const done = newP >= q.objective.target;
              newState.activeScrollQuest = { ...q, progress: newP, completed: done };
              if (done) {
                newState.gold += q.goldReward;
                newState.diamonds += q.diamondReward;
                newState.xp += 20;
                newState.completedScrollQuests += 1;
                newState.scrollNextSpawnAt = now + randomScrollInterval();
                newState.lastNotification = { message: `✅ Quest completa! +${q.goldReward}🪙 +${q.diamondReward}💎`, type: 'success', at: now };
              }
            }
          }
        }

        // Scroll quest expiry
        if (s.activeScrollQuest && !s.activeScrollQuest.completed && now >= s.activeScrollQuest.expiresAt) {
          newState.activeScrollQuest = null;
        }

        // Scroll quest spawn every 10 min
        if (!newState.activeScrollQuest && now >= s.scrollNextSpawnAt) {
          const mountedHorse = newState.horses.find(h => h.id === newState.mountedHorseId && !h.dead);
          const rarity = getScrollRarityByHorse(mountedHorse?.rarity || null);
          const questStory = QUEST_STORIES[Math.floor(Math.random() * QUEST_STORIES.length)];
          const rewards = getScrollRewards(rarity);
          newState.activeScrollQuest = {
            id: now.toString(),
            rarity,
            mapX: 15 + Math.random() * 70,
            mapY: 15 + Math.random() * 70,
            expiresAt: now + 2 * 60 * 1000,
            objective: { ...questStory.objective },
            progress: 0,
            completed: false,
            goldReward: rewards.gold,
            diamondReward: rewards.diamonds,
            story: questStory.story,
            npcName: questStory.npcName,
          };
        }

        // Raid check every 10 min
        if (now >= s.raidNextCheckAt) {
          newState.raidNextCheckAt = now + 10 * 60 * 1000;
          if (Math.random() < 0.35) {
            const area = RAIDABLE_AREAS[Math.floor(Math.random() * RAIDABLE_AREAS.length)];
            const alreadyRaided = newState.activeRaids.some(r => r.area === area);
            if (!alreadyRaided) {
              newState.activeRaids = [...newState.activeRaids, {
                area,
                startedAt: now,
                endsAt: now + RAID_DURATION,
              }];
              const areaNames: Record<string, string> = {
                fazenda: 'Fazenda', floresta: 'Floresta', mercado: 'Mercado', pasto: 'Pasto',
                mina: 'Mina', estabulo: 'Estábulo', pub: 'Pub', arena: 'Arena'
              };
              newState.lastNotification = {
                message: `⚠️ Sua ${areaNames[area] || area} está sob ataque!`,
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
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getMountedHorse = useCallback((): Horse | null => {
    const h = stateRef.current.horses.find(h => h.id === stateRef.current.mountedHorseId);
    return h && !h.dead ? h : null;
  }, []);

  const getTravelTime = useCallback(() => {
    const horse = getMountedHorse();
    if (!horse) return TRAVEL_TIME_BASE;
    return calcTravelTime(horse.speed);
  }, [getMountedHorse]);

  const isAreaRaided = useCallback((area: LocationId) => {
    return stateRef.current.activeRaids.some(r => r.area === area);
  }, []);

  const startTravel = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (s.currentLocation === locationId) return;
    if (locationId === 'medicina') {
      notify('🔒 Área não desbloqueada ainda.', 'error');
      return;
    }
    // Raid check moved to MapView shield prompt
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
      if (dest && s.activeScrollQuest && !s.activeScrollQuest.completed) {
        const q = s.activeScrollQuest;
        let matched = false;
        if (q.objective.type === 'travel_estabulo' && dest === 'estabulo') matched = true;
        if (q.objective.type === 'travel_pub' && dest === 'pub') matched = true;
        if (q.objective.type === 'travel_fazenda' && dest === 'fazenda') matched = true;
        if (q.objective.type === 'find_npc') {
          // NPC found at destination
          matched = true;
        }
        if (matched) {
          const newProgress = Math.min(q.progress + 1, q.objective.target);
          const completed = newProgress >= q.objective.target;
          newState.activeScrollQuest = { ...q, progress: newProgress, completed };
          if (completed) {
            newState.gold = newState.gold + q.goldReward;
            newState.diamonds = newState.diamonds + q.diamondReward;
            newState.xp = newState.xp + 20;
            newState.completedScrollQuests = (newState.completedScrollQuests || 0) + 1;
            newState.scrollNextSpawnAt = Date.now() + randomScrollInterval();
            newState.lastNotification = {
              message: `✅ Quest completa! +${q.goldReward}🪙 +${q.diamondReward}💎`,
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
      setState(s => ({
        ...s,
        diamonds: s.diamonds - 1,
        currentLocation: s.travelingTo,
        travelingTo: null,
        travelEndTime: null,
      }));
    }
  }, []);

  const collectTree = useCallback((index: number) => {
    setState(s => {
      if (!s.trees[index]?.available) return s;
      if (s.activeCollection) {
        return { ...s, lastNotification: { message: '⏳ Já está coletando algo!', type: 'warning', at: Date.now() } };
      }
      return {
        ...s,
        trees: s.trees.map((t, i) => i === index ? { available: false, cooldownEnd: Date.now() + randomCooldown() } : t),
        activeCollection: { type: 'tree', index, startedAt: Date.now(), duration: COLLECT_TREE_DURATION },
      };
    });
  }, []);

  const collectHerb = useCallback((herbId: number) => {
    setState(s => {
      const herb = s.herbs.find(h => h.id === herbId);
      if (!herb || !herb.available) return s;
      if (s.activeCollection) {
        return { ...s, lastNotification: { message: '⏳ Já está coletando algo!', type: 'warning', at: Date.now() } };
      }
      return {
        ...s,
        herbs: s.herbs.map(h => h.id === herbId ? { ...h, available: false, cooldownEnd: Date.now() + randomCooldown() } : h),
        activeCollection: { type: 'herb', index: herbId, startedAt: Date.now(), duration: COLLECT_HERB_DURATION },
      };
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
      if (s.activeCollection) {
        return { ...s, lastNotification: { message: '⏳ Já está coletando algo!', type: 'warning', at: Date.now() } };
      }
      return {
        ...s,
        mineSlots: s.mineSlots.map(m => m.id === slotId ? { ...m, available: false, cooldownEnd: Date.now() + MINE_COOLDOWN } : m),
        activeCollection: { type: 'mine', index: slotId, startedAt: Date.now(), duration: COLLECT_MINE_DURATION },
      };
    });
  }, []);

  const buyHorse = useCallback((rarity: HorseRarity) => {
    const costs: Record<HorseRarity, number> = { 'comum': 20, 'raro': 50, 'épico': 100, 'lendário': 200, 'mítico': 500 };
    const cost = costs[rarity];
    setState(s => {
      if (s.gold < cost) {
        return { ...s, lastNotification: { message: '❌ Ouro insuficiente.', type: 'error' as const, at: Date.now() } };
      }
      const aliveHorses = s.horses.filter(h => !h.dead);
      if (aliveHorses.length >= 3) {
        return { ...s, lastNotification: { message: '❌ Você já tem 3 cavalos vivos.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        gold: s.gold - cost,
        horses: [...s.horses, {
          id: Date.now().toString(), name: `Potro ${rarity}`, rarity,
          speed: HORSE_SPEED[rarity],
          isAdult: false,
          lastFedAt: Date.now(), dead: false,
        }],
        lastNotification: { message: `🐴 Novo potro ${rarity} comprado!`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  const addGachaHorse = useCallback((rarity: HorseRarity, name: string) => {
    setState(s => {
      const aliveHorses = s.horses.filter(h => !h.dead);
      if (aliveHorses.length >= 3) {
        return { ...s, lastNotification: { message: '❌ Você já tem 3 cavalos vivos.', type: 'error' as const, at: Date.now() } };
      }
      const boxCount = s.inventory['Caixa Gacha Cavalo'] || 0;
      if (boxCount <= 0) return s;
      return {
        ...s,
        inventory: { ...s.inventory, 'Caixa Gacha Cavalo': boxCount - 1 },
        horses: [...s.horses, {
          id: Date.now().toString(), name, rarity,
          speed: HORSE_SPEED[rarity],
          isAdult: true,
          lastFedAt: Date.now(), dead: false,
        }],
        lastNotification: { message: `🎉 Você ganhou um ${name}!`, type: 'success', at: Date.now() },
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
    setState(s => {
      if (!s.activeScrollQuest) return s;
      const q = s.activeScrollQuest;
      return {
        ...s,
        lastNotification: {
          message: `📜 ${q.story || `Quest: ${q.objective.label}`} (${q.rarity})`,
          type: 'success',
          at: Date.now(),
        },
      };
    });
  }, []);

  const goToMap = useCallback(() => {
    setState(s => ({ ...s, currentLocation: null }));
  }, []);

  // Teleport to another map (costs 5 diamonds except returning to map1)
  const teleportToMap = useCallback((mapId: MapId) => {
    setState(s => {
      if (s.currentMap === mapId) return s;
      const cost = mapId === 'map1' ? 0 : 5;
      if (cost > 0 && s.diamonds < cost) {
        return { ...s, lastNotification: { message: '❌ Você precisa de 5 diamantes para teleportar!', type: 'error' as const, at: Date.now() } };
      }
      const mapNames: Record<MapId, string> = { map1: 'Mapa 1', map2: 'Mapa 2', map3: 'Mapa 3' };
      return {
        ...s,
        diamonds: s.diamonds - cost,
        currentMap: mapId,
        currentLocation: null,
        lastNotification: { message: `🌀 Teleportado para ${mapNames[mapId]}!`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  // Buy pasture animal
  const buyPastureAnimal = useCallback((type: PastureAnimalType) => {
    const cost = PASTURE_ANIMAL_COSTS[type];
    setState(s => {
      if (s.gold < cost) {
        return { ...s, lastNotification: { message: '❌ Ouro insuficiente.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        gold: s.gold - cost,
        pastureAnimals: [...s.pastureAnimals, {
          id: Date.now().toString(),
          type,
          lastFedAt: Date.now(),
          sickAt: null,
          dead: false,
        }],
        lastNotification: { message: `🐄 ${type} comprado(a)!`, type: 'success', at: Date.now() },
      };
    });
  }, []);

  const feedPastureAnimal = useCallback((animalId: string) => {
    setState(s => {
      const food = s.inventory['Ração Animal'] || 0;
      if (food <= 0) {
        return { ...s, lastNotification: { message: '❌ Sem ração animal! Compre no Mercado.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        inventory: { ...s.inventory, 'Ração Animal': food - 1 },
        pastureAnimals: s.pastureAnimals.map(a => a.id === animalId && !a.dead ? { ...a, lastFedAt: Date.now() } : a),
        lastNotification: { message: '🥬 Animal alimentado!', type: 'success', at: Date.now() },
      };
    });
  }, []);

  const vaccinateAnimal = useCallback((animalId: string) => {
    setState(s => {
      if ((s.completedScrollQuests || 0) < 10) {
        return { ...s, lastNotification: { message: '❌ Complete 10 quests para desbloquear vacinas.', type: 'error' as const, at: Date.now() } };
      }
      const vaccines = s.inventory['Vacina Animais'] || 0;
      if (vaccines <= 0) {
        return { ...s, lastNotification: { message: '❌ Sem vacinas! Compre no Mercado.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        inventory: { ...s.inventory, 'Vacina Animais': vaccines - 1 },
        pastureAnimals: s.pastureAnimals.map(a => a.id === animalId ? { ...a, sickAt: null } : a),
        lastNotification: { message: '💊 Animal vacinado!', type: 'success', at: Date.now() },
      };
    });
  }, []);

  const collectMilk = useCallback((animalId: string) => {
    setState(s => {
      const cow = s.pastureAnimals.find(a => a.id === animalId && a.type === 'vaca' && !a.dead);
      if (!cow) return s;
      const lastMilk = cow.lastMilkAt || 0;
      if (Date.now() - lastMilk < 10 * 60 * 1000) {
        return { ...s, lastNotification: { message: '⏳ Vaca ainda não produziu leite.', type: 'warning', at: Date.now() } };
      }
      return {
        ...s,
        pastureAnimals: s.pastureAnimals.map(a => a.id === animalId ? { ...a, lastMilkAt: Date.now() } : a),
        inventory: { ...s.inventory, 'Leite': (s.inventory['Leite'] || 0) + 1 },
        lastNotification: { message: '🥛 +1 Leite coletado!', type: 'success', at: Date.now() },
      };
    });
  }, []);

  const removeDeadAnimal = useCallback((animalId: string) => {
    setState(s => ({
      ...s,
      pastureAnimals: s.pastureAnimals.filter(a => a.id !== animalId),
    }));
  }, []);

  const equipCard = useCallback((cardId: string | null) => {
    setState(s => {
      if (s.explorationSlotDestroyed) {
        return { ...s, lastNotification: { message: '❌ Slot de exploração destruído! Reconstrua primeiro.', type: 'error' as const, at: Date.now() } };
      }
      if (cardId && !(s.cards[cardId] > 0)) {
        return { ...s, lastNotification: { message: '❌ Você não possui essa carta.', type: 'error' as const, at: Date.now() } };
      }
      const card = cardId ? CARD_DEFINITIONS.find(c => c.id === cardId) : null;
      return {
        ...s,
        equippedCardId: cardId,
        lastNotification: card
          ? { message: `🃏 ${card.name} equipada! +${card.bonusValue}% ${card.bonusType.replace('_', ' ')}`, type: 'success' as const, at: Date.now() }
          : { message: '🃏 Carta removida do slot.', type: 'success' as const, at: Date.now() },
      };
    });
  }, []);

  const repairExplorationSlot = useCallback(() => {
    setState(s => {
      const cost = 50;
      if (s.gold < cost) {
        return { ...s, lastNotification: { message: '❌ 50 ouro necessários para reparar o slot.', type: 'error' as const, at: Date.now() } };
      }
      return {
        ...s,
        gold: s.gold - cost,
        explorationSlotDestroyed: false,
        lastNotification: { message: '🔧 Slot de exploração reparado!', type: 'success' as const, at: Date.now() },
      };
    });
  }, []);

  // Card loss on raid (called when raid hits and card is equipped)
  const raidCardLoss = useCallback(() => {
    setState(s => {
      if (!s.equippedCardId) return s;
      const roll = Math.random();
      if (roll < 0.4) {
        // Lose card only
        const cardId = s.equippedCardId;
        const newCards = { ...s.cards, [cardId]: Math.max(0, (s.cards[cardId] || 0) - 1) };
        return {
          ...s,
          cards: newCards,
          equippedCardId: null,
          lastNotification: { message: '💔 Sua carta equipada foi perdida no ataque!', type: 'error' as const, at: Date.now() },
        };
      } else if (roll < 0.6) {
        // Destroy slot
        const cardId = s.equippedCardId;
        const newCards = { ...s.cards, [cardId]: Math.max(0, (s.cards[cardId] || 0) - 1) };
        return {
          ...s,
          cards: newCards,
          equippedCardId: null,
          explorationSlotDestroyed: true,
          lastNotification: { message: '💥 Seu slot de exploração foi destruído!', type: 'error' as const, at: Date.now() },
        };
      }
      return s;
    });
  }, []);

  return {
    state,
    startTravel, completeTravel, accelerateTravel,
    collectTree, collectHerb,
    plantCrop, harvestCrop, mineGold,
    buyHorse, evolveHorse, mountHorse, feedHorse, removeDeadHorse,
    addGachaHorse,
    collectSurpriseBox, buyItem,
    useShield, pickupScroll,
    goToMap, getMountedHorse, getTravelTime, isAreaRaided,
    teleportToMap,
    buyPastureAnimal, feedPastureAnimal, vaccinateAnimal, collectMilk, removeDeadAnimal,
    equipCard, repairExplorationSlot, raidCardLoss,
  };
}
