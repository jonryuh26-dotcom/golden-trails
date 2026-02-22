import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LocationId, GameState, ScrollRarity, MapId } from '@/hooks/useGameState';
import mapBg from '@/assets/map-bg.jpg';
import map2Bg from '@/assets/map2-bg.jpg';
import map3Bg from '@/assets/map3-bg.jpg';
import gameIcons from '@/assets/game-icons.png';
import horsesImg from '@/assets/horses-rarity.png';

interface LocationDef {
  id: LocationId;
  name: string;
  icon: string;
  x: number;
  y: number;
  locked?: boolean;
  spritePos?: { row: number; col: number };
}

// Icon positions matched to scene elements on each map
const MAP1_LOCATIONS: LocationDef[] = [
  { id: 'fazenda', name: 'Fazenda', icon: '🏠', x: 15, y: 18 },
  { id: 'mercado', name: 'Mercado', icon: '🏪', x: 50, y: 38, spritePos: { row: 2, col: 2 } },
  { id: 'estabulo', name: 'Estábulo', icon: '🐴', x: 80, y: 20, spritePos: { row: 1, col: 1 } },
  { id: 'pasto', name: 'Pasto', icon: '🐄', x: 82, y: 12, spritePos: { row: 1, col: 0 } },
  { id: 'pub', name: 'Pub', icon: '🍺', x: 70, y: 82, spritePos: { row: 3, col: 2 } },
  { id: 'medicina', name: 'Medicina', icon: '🔒', x: 30, y: 60, locked: true },
  { id: 'floresta', name: 'Floresta', icon: '🌲', x: 12, y: 42, spritePos: { row: 0, col: 2 } },
  { id: 'mina', name: 'Mina', icon: '⛏️', x: 18, y: 72, spritePos: { row: 3, col: 0 } },
  { id: 'arena', name: 'Arena', icon: '⚔️', x: 85, y: 55, spritePos: { row: 1, col: 2 } },
];

const MAP2_LOCATIONS: LocationDef[] = [
  { id: 'fazenda', name: 'Fazenda', icon: '🏠', x: 14, y: 20 },
  { id: 'mercado', name: 'Mercado', icon: '🏪', x: 48, y: 35, spritePos: { row: 2, col: 2 } },
  { id: 'estabulo', name: 'Estábulo', icon: '🐴', x: 78, y: 22, spritePos: { row: 1, col: 1 } },
  { id: 'pasto', name: 'Pasto', icon: '🐄', x: 80, y: 14, spritePos: { row: 1, col: 0 } },
  { id: 'pub', name: 'Pub', icon: '🍺', x: 68, y: 84, spritePos: { row: 3, col: 2 } },
  { id: 'medicina', name: 'Medicina', icon: '🔒', x: 32, y: 58, locked: true },
  { id: 'floresta', name: 'Floresta', icon: '🌲', x: 10, y: 40, spritePos: { row: 0, col: 2 } },
  { id: 'mina', name: 'Mina', icon: '⛏️', x: 20, y: 70, spritePos: { row: 3, col: 0 } },
  { id: 'arena', name: 'Arena', icon: '⚔️', x: 82, y: 52, spritePos: { row: 1, col: 2 } },
];

const MAP3_LOCATIONS: LocationDef[] = [
  { id: 'fazenda', name: 'Fazenda', icon: '🏠', x: 16, y: 22 },
  { id: 'mercado', name: 'Mercado', icon: '🏪', x: 52, y: 40, spritePos: { row: 2, col: 2 } },
  { id: 'estabulo', name: 'Estábulo', icon: '🐴', x: 76, y: 18, spritePos: { row: 1, col: 1 } },
  { id: 'pasto', name: 'Pasto', icon: '🐄', x: 78, y: 10, spritePos: { row: 1, col: 0 } },
  { id: 'pub', name: 'Pub', icon: '🍺', x: 65, y: 86, spritePos: { row: 3, col: 2 } },
  { id: 'medicina', name: 'Medicina', icon: '🔒', x: 28, y: 55, locked: true },
  { id: 'floresta', name: 'Floresta', icon: '🌲', x: 14, y: 38, spritePos: { row: 0, col: 2 } },
  { id: 'mina', name: 'Mina', icon: '⛏️', x: 22, y: 68, spritePos: { row: 3, col: 0 } },
  { id: 'arena', name: 'Arena', icon: '⚔️', x: 84, y: 50, spritePos: { row: 1, col: 2 } },
];

const MAP_LOCATIONS: Record<MapId, LocationDef[]> = {
  map1: MAP1_LOCATIONS,
  map2: MAP2_LOCATIONS,
  map3: MAP3_LOCATIONS,
};

const MAP_IMAGES: Record<MapId, string> = {
  map1: mapBg,
  map2: map2Bg,
  map3: map3Bg,
};

const SCROLL_AURA: Record<ScrollRarity, string> = {
  'comum': 'drop-shadow(0 0 8px #9ca3af)',
  'raro': 'drop-shadow(0 0 10px #3b82f6)',
  'épico': 'drop-shadow(0 0 12px #a855f7)',
  'lendário': 'drop-shadow(0 0 14px #f59e0b)',
  'mítico': 'drop-shadow(0 0 16px #ef4444)',
};

const SCROLL_BG_GLOW: Record<ScrollRarity, string> = {
  'comum': 'shadow-[0_0_20px_rgba(156,163,175,0.5)]',
  'raro': 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  'épico': 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  'lendário': 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
  'mítico': 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
};

const HORSE_SPRITE: Record<string, { row: number; col: number }> = {
  'comum': { row: 0, col: 0 },
  'raro': { row: 0, col: 1 },
  'épico': { row: 1, col: 0 },
  'lendário': { row: 1, col: 1 },
  'mítico': { row: 1, col: 1 },
};

// Cooldown keys for localStorage
const COOLDOWN_KEY_FOREST = 'game_cooldown_forest';
const COOLDOWN_KEY_MINE = 'game_cooldown_mine';
const COOLDOWN_DURATION = 10 * 60 * 1000; // 10 minutes

function getCooldownEnd(key: string): number {
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
}

function setCooldownEnd(key: string, end: number) {
  localStorage.setItem(key, end.toString());
}

interface Props {
  state: GameState;
  onLocationClick: (id: LocationId) => void;
  onSurpriseBox: () => void;
  onScrollClick: () => void;
  onTeleport: (mapId: MapId) => void;
  onUseShield: (area: LocationId) => void;
}

export default function MapView({ state, onLocationClick, onSurpriseBox, onScrollClick, onTeleport, onUseShield }: Props) {
  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
  const surpriseReady = Date.now() >= state.surpriseBoxAvailableAt;

  // Cooldown state for forest/mine icons
  const [forestCooldownEnd, setForestCooldownEnd] = useState(() => getCooldownEnd(COOLDOWN_KEY_FOREST));
  const [mineCooldownEnd, setMineCooldownEnd] = useState(() => getCooldownEnd(COOLDOWN_KEY_MINE));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const forestOnCooldown = forestCooldownEnd > now;
  const mineOnCooldown = mineCooldownEnd > now;

  // Invasion shield modal
  const [shieldPromptArea, setShieldPromptArea] = useState<LocationId | null>(null);

  const weatherOverlay = () => {
    switch (state.weather) {
      case 'rain': return 'bg-blue-900/20';
      case 'snow': return 'bg-blue-100/10';
      case 'drought': return 'bg-orange-900/15';
      default: return '';
    }
  };

  const locations = MAP_LOCATIONS[state.currentMap] || MAP1_LOCATIONS;
  const bgImage = MAP_IMAGES[state.currentMap] || mapBg;

  const currentLocDef = state.currentLocation
    ? locations.find(l => l.id === state.currentLocation)
    : null;

  const mountedHorse = state.horses.find(h => h.id === state.mountedHorseId && !h.dead);

  const handleLocationClick = (loc: LocationDef) => {
    if (loc.locked) return;

    // Check cooldown for forest/mine
    if (loc.id === 'floresta' && forestOnCooldown) return;
    if (loc.id === 'mina' && mineOnCooldown) return;

    // Check if area is raided - show shield prompt instead of blocking
    const isRaided = state.activeRaids.some(r => r.area === loc.id);
    if (isRaided) {
      setShieldPromptArea(loc.id);
      return;
    }

    onLocationClick(loc.id);
  };

  const handleUseShield = () => {
    if (!shieldPromptArea) return;
    const shields = state.inventory['Escudo'] || 0;
    if (shields <= 0) return;
    onUseShield(shieldPromptArea);
    setShieldPromptArea(null);
  };

  // Track when player visits forest/mine to start cooldown
  const handleCollectionCooldown = (locId: LocationId) => {
    if (locId === 'floresta') {
      const end = Date.now() + COOLDOWN_DURATION;
      setCooldownEnd(COOLDOWN_KEY_FOREST, end);
      setForestCooldownEnd(end);
    } else if (locId === 'mina') {
      const end = Date.now() + COOLDOWN_DURATION;
      setCooldownEnd(COOLDOWN_KEY_MINE, end);
      setMineCooldownEnd(end);
    }
  };

  const formatCooldown = (endTime: number) => {
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const mapOptions: MapId[] = ['map1', 'map2', 'map3'];
  const otherMaps = mapOptions.filter(m => m !== state.currentMap);

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden">
      {/* Map container - image as background, scrollable */}
      <div
        className="relative w-full"
        style={{ paddingBottom: '150%' /* approximate portrait ratio */ }}
      >
        <img
          src={bgImage}
          alt="Mapa"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: isDay ? 'brightness(1)' : 'brightness(0.5) saturate(0.7)',
          }}
        />

        {/* Overlays positioned over the image */}
        <div className={`absolute inset-0 transition-all duration-[3000ms] ${weatherOverlay()}`} />
        {!isDay && <div className="absolute inset-0 bg-blue-950/30 transition-all duration-[3000ms]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30" />

      {/* Map teleport buttons */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
        {otherMaps.map(mapId => {
          const mapLabel = mapId === 'map1' ? 'Mapa 1' : mapId === 'map2' ? 'Mapa 2' : 'Mapa 3';
          const isFree = mapId === 'map1';
          return (
            <button
              key={mapId}
              onClick={() => onTeleport(mapId)}
              className="glass rounded-xl px-3 py-1.5 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="text-sm">🌀</span>
              <span className="text-[9px] font-display text-foreground">{mapLabel}</span>
              {isFree ? (
                <span className="text-[8px] text-muted-foreground font-display">Grátis</span>
              ) : (
                <span className="text-[8px] text-diamond font-display">💎5</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Player position marker */}
      {currentLocDef && (
        <motion.div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{ left: `${currentLocDef.x}%`, top: `${currentLocDef.y - 6}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {mountedHorse ? (
            <div
              className="w-10 h-10 rounded-full border-2 border-gold overflow-hidden"
              style={{ filter: 'drop-shadow(0 0 6px #22c55e)', boxShadow: '0 0 12px rgba(34,197,94,0.4)' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${horsesImg})`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: `${HORSE_SPRITE[mountedHorse.rarity].col * 100}% ${HORSE_SPRITE[mountedHorse.rarity].row * 100}%`,
                }}
              />
            </div>
          ) : (
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }}>🤠</span>
          )}
          <span className="text-[8px] font-display text-green-400 bg-background/70 px-1.5 py-0.5 rounded-full mt-0.5">
            📍 Você está aqui
          </span>
        </motion.div>
      )}

      {/* Location markers */}
      {locations.map((loc, i) => {
        const isRaided = state.activeRaids.some(r => r.area === loc.id);
        const isCooldown = (loc.id === 'floresta' && forestOnCooldown) || (loc.id === 'mina' && mineOnCooldown);
        const cooldownTime = loc.id === 'floresta' ? forestCooldownEnd : loc.id === 'mina' ? mineCooldownEnd : 0;

        return (
          <motion.button
            key={loc.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            className="location-marker absolute flex flex-col items-center"
            style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => handleLocationClick(loc)}
            whileTap={loc.locked || isCooldown ? {} : { scale: 0.9 }}
            disabled={isCooldown}
          >
            {isRaided && (
              <span className="absolute -top-5 text-lg animate-bounce-gentle" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }}>
                ♟️
              </span>
            )}
            {loc.spritePos && !isCooldown ? (
              <div
                className={`w-14 h-14 rounded-full overflow-hidden border-[3px] border-gold/70 ${loc.locked ? 'grayscale opacity-50' : ''} ${isRaided ? 'opacity-50' : ''}`}
                style={{
                  backgroundImage: `url(${gameIcons})`,
                  backgroundSize: '300% 400%',
                  backgroundPosition: `${loc.spritePos.col * 50}% ${loc.spritePos.row * 33.33}%`,
                  filter: loc.locked ? 'grayscale(1)' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
                  boxShadow: !loc.locked && !isRaided ? '0 0 12px hsla(40, 80%, 50%, 0.4)' : undefined,
                }}
              />
            ) : (
              <span
                className={`text-3xl ${loc.locked ? 'grayscale opacity-50' : ''} ${isRaided ? 'opacity-50' : ''} ${isCooldown ? 'grayscale opacity-40' : ''}`}
                style={{ filter: loc.locked || isCooldown ? 'none' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
              >
                {isCooldown ? '⏳' : loc.icon}
              </span>
            )}
            <span className={`glass px-2 py-0.5 rounded-md text-[10px] font-display text-foreground mt-1 whitespace-nowrap ${loc.locked || isCooldown ? 'opacity-50' : ''}`}>
              {loc.locked ? '🔒 Bloqueado' : isCooldown ? `⏳ ${formatCooldown(cooldownTime)}` : loc.name}
            </span>
            {isRaided && (
              <span className="text-[9px] text-red-400 font-display mt-0.5">Sob ataque!</span>
            )}
          </motion.button>
        );
      })}

      {/* Scroll quest on map */}
      <AnimatePresence>
        {state.activeScrollQuest && !state.activeScrollQuest.completed && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onScrollClick}
            className={`absolute z-10 animate-float rounded-full ${SCROLL_BG_GLOW[state.activeScrollQuest.rarity]}`}
            style={{
              left: `${state.activeScrollQuest.mapX}%`,
              top: `${state.activeScrollQuest.mapY}%`,
              transform: 'translate(-50%, -50%)',
            }}
            whileTap={{ scale: 0.85 }}
          >
            <span
              className="text-4xl"
              style={{ filter: SCROLL_AURA[state.activeScrollQuest.rarity] }}
            >
              📜
            </span>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-display text-gold whitespace-nowrap">
              {state.activeScrollQuest.rarity.charAt(0).toUpperCase() + state.activeScrollQuest.rarity.slice(1)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Surprise box */}
      <AnimatePresence>
        {surpriseReady && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={onSurpriseBox}
            className="absolute animate-float"
            style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)' }}
            whileTap={{ scale: 0.85 }}
          >
            <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 12px hsl(var(--gold-glow)))' }}>
              🎁
            </span>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-display text-gold whitespace-nowrap">
              Surpresa!
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Shield prompt modal for raids */}
      <AnimatePresence>
        {shieldPromptArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80"
            onClick={() => setShieldPromptArea(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="glass rounded-2xl p-6 mx-4 max-w-sm w-full flex flex-col items-center gap-4"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-5xl">♟️</span>
              <p className="font-display text-sm text-red-400 text-center">
                Esta área está sob ataque!
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Você possui um escudo?
              </p>
              <p className="text-xs text-foreground font-display">
                🛡️ Escudos: {state.inventory['Escudo'] || 0}
              </p>
              {(state.inventory['Escudo'] || 0) > 0 ? (
                <button
                  onClick={handleUseShield}
                  className="btn-game text-sm px-6 py-2 flex items-center gap-2"
                >
                  🛡️ Usar Escudo
                </button>
              ) : (
                <p className="text-xs text-red-400 text-center">
                  Sem escudo disponível! Compre no Mercado.
                </p>
              )}
              <button
                onClick={() => setShieldPromptArea(null)}
                className="text-xs text-muted-foreground underline"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather particles */}
      {state.weather === 'rain' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-accent/30"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${10 + Math.random() * 20}px`,
                animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                top: `-20px`,
              }}
            />
          ))}
        </div>
      )}
      {state.weather === 'snow' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-foreground/20"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
                top: `-10px`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh); }
        }
      `}</style>
      </div>
    </div>
  );
}
