import { useState, useCallback, useEffect } from 'react';

export type HorseRarity = 'comum' | 'raro' | 'épico' | 'lendário';

export interface Horse {
  id: string;
  name: string;
  rarity: HorseRarity;
  isAdult: boolean;
}

export interface Animal {
  id: string;
  type: 'vaca' | 'ovelha' | 'galinha';
  hungry: boolean;
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
  currentLocation: LocationId | null;
  travelingTo: LocationId | null;
  travelEndTime: number | null;
  weather: Weather;
  surpriseBoxAvailableAt: number;
  questLocations: LocationId[];
}

const TRAVEL_TIME_BASE = 10000; // 10 seconds

const raritySpeedMultiplier: Record<HorseRarity, number> = {
  'comum': 0.8,
  'raro': 0.6,
  'épico': 0.4,
  'lendário': 0.25,
};

const rarityWoodBonus: Record<HorseRarity, number> = {
  'comum': 1,
  'raro': 2,
  'épico': 3,
  'lendário': 5,
};

const WEATHERS: Weather[] = ['clear', 'rain', 'snow', 'drought'];

const initialState: GameState = {
  playerName: 'Jogador',
  level: 1,
  xp: 0,
  gold: 50,
  diamonds: 7,
  influence: 20,
  maxInfluence: 100,
  horses: [],
  mountedHorseId: null,
  animals: [
    { id: '1', type: 'vaca', hungry: false },
    { id: '2', type: 'galinha', hungry: true },
  ],
  inventory: { 'Madeira': 5, 'Maçã': 3, 'Frutas': 2 },
  trees: [
    { available: true, cooldownEnd: null },
    { available: true, cooldownEnd: null },
    { available: true, cooldownEnd: null },
  ],
  currentLocation: null,
  travelingTo: null,
  travelEndTime: null,
  weather: 'clear',
  surpriseBoxAvailableAt: Date.now() + 5000, // available shortly for demo
  questLocations: ['pub', 'mercado', 'arena'],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  // Weather cycle every hour
  useEffect(() => {
    const updateWeather = () => {
      const hourIndex = Math.floor(Date.now() / 3600000) % WEATHERS.length;
      setState(s => ({ ...s, weather: WEATHERS[hourIndex] }));
    };
    updateWeather();
    const interval = setInterval(updateWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check tree cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setState(s => ({
        ...s,
        trees: s.trees.map(t => {
          if (!t.available && t.cooldownEnd && Date.now() >= t.cooldownEnd) {
            return { available: true, cooldownEnd: null };
          }
          return t;
        }),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getMountedHorse = useCallback(() => {
    return state.horses.find(h => h.id === state.mountedHorseId) || null;
  }, [state.horses, state.mountedHorseId]);

  const getTravelTime = useCallback(() => {
    const horse = getMountedHorse();
    if (!horse) return TRAVEL_TIME_BASE;
    return TRAVEL_TIME_BASE * raritySpeedMultiplier[horse.rarity];
  }, [getMountedHorse]);

  const startTravel = useCallback((locationId: LocationId) => {
    const travelTime = getTravelTime();
    setState(s => ({
      ...s,
      travelingTo: locationId,
      travelEndTime: Date.now() + travelTime,
    }));
  }, [getTravelTime]);

  const completeTravel = useCallback(() => {
    setState(s => ({
      ...s,
      currentLocation: s.travelingTo,
      travelingTo: null,
      travelEndTime: null,
    }));
  }, []);

  const accelerateTravel = useCallback(() => {
    if (state.diamonds >= 1) {
      setState(s => ({
        ...s,
        diamonds: s.diamonds - 1,
        currentLocation: s.travelingTo,
        travelingTo: null,
        travelEndTime: null,
      }));
    }
  }, [state.diamonds]);

  const collectTree = useCallback((index: number) => {
    const horse = getMountedHorse();
    const woodAmount = horse ? rarityWoodBonus[horse.rarity] : 1;
    setState(s => ({
      ...s,
      trees: s.trees.map((t, i) => i === index ? { available: false, cooldownEnd: Date.now() + 3600000 } : t),
      inventory: { ...s.inventory, 'Madeira': (s.inventory['Madeira'] || 0) + woodAmount },
    }));
  }, [getMountedHorse]);

  const buyHorse = useCallback((rarity: HorseRarity) => {
    const costs: Record<HorseRarity, number> = { 'comum': 20, 'raro': 50, 'épico': 100, 'lendário': 200 };
    const cost = costs[rarity];
    if (state.gold >= cost && state.horses.length < 2) {
      setState(s => ({
        ...s,
        gold: s.gold - cost,
        horses: [...s.horses, { id: Date.now().toString(), name: `Potro ${rarity}`, rarity, isAdult: false }],
      }));
    }
  }, [state.gold, state.horses.length]);

  const evolveHorse = useCallback((horseId: string) => {
    setState(s => ({
      ...s,
      horses: s.horses.map(h => h.id === horseId ? { ...h, isAdult: true, name: h.name.replace('Potro', 'Cavalo') } : h),
    }));
  }, []);

  const mountHorse = useCallback((horseId: string | null) => {
    setState(s => ({ ...s, mountedHorseId: horseId }));
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
    if (state.gold >= cost) {
      setState(s => ({
        ...s,
        gold: s.gold - cost,
        inventory: { ...s.inventory, [item]: (s.inventory[item] || 0) + 1 },
      }));
    }
  }, [state.gold]);

  const goToMap = useCallback(() => {
    setState(s => ({ ...s, currentLocation: null }));
  }, []);

  return {
    state,
    startTravel,
    completeTravel,
    accelerateTravel,
    collectTree,
    buyHorse,
    evolveHorse,
    mountHorse,
    collectSurpriseBox,
    buyItem,
    goToMap,
    getMountedHorse,
    getTravelTime,
  };
}
