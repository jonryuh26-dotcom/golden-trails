import { motion, AnimatePresence } from 'framer-motion';
import type { LocationId, GameState, ScrollRarity } from '@/hooks/useGameState';
import mapBg from '@/assets/map-bg.jpg';

interface LocationDef {
  id: LocationId;
  name: string;
  icon: string;
  x: number;
  y: number;
  locked?: boolean;
}

const locations: LocationDef[] = [
  { id: 'fazenda', name: 'Fazenda', icon: '🏠', x: 18, y: 22 },
  { id: 'mercado', name: 'Mercado', icon: '🏪', x: 65, y: 18 }, // moved to old pasto
  { id: 'estabulo', name: 'Estábulo', icon: '🐴', x: 12, y: 40 },
  { id: 'pasto', name: 'Pasto', icon: '🐄', x: 30, y: 52 }, // moved to old mercado
  { id: 'pub', name: 'Pub', icon: '🍺', x: 62, y: 48 },
  { id: 'medicina', name: 'Medicina', icon: '🔒', x: 78, y: 35, locked: true },
  { id: 'floresta', name: 'Floresta', icon: '🌲', x: 20, y: 68 },
  { id: 'mina', name: 'Mina', icon: '⛏️', x: 75, y: 65 },
  { id: 'arena', name: 'Arena', icon: '⚔️', x: 55, y: 75 },
];

const SCROLL_AURA: Record<ScrollRarity, string> = {
  'comum': 'drop-shadow(0 0 8px #22c55e)',
  'raro': 'drop-shadow(0 0 10px #3b82f6)',
  'épico': 'drop-shadow(0 0 12px #a855f7)',
};

interface Props {
  state: GameState;
  onLocationClick: (id: LocationId) => void;
  onSurpriseBox: () => void;
  onScrollClick: () => void;
}

export default function MapView({ state, onLocationClick, onSurpriseBox, onScrollClick }: Props) {
  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
  const surpriseReady = Date.now() >= state.surpriseBoxAvailableAt;

  const weatherOverlay = () => {
    switch (state.weather) {
      case 'rain': return 'bg-blue-900/20';
      case 'snow': return 'bg-blue-100/10';
      case 'drought': return 'bg-orange-900/15';
      default: return '';
    }
  };

  // Find location def for current position
  const currentLocDef = state.currentLocation
    ? locations.find(l => l.id === state.currentLocation)
    : null;

  const mountedHorse = state.horses.find(h => h.id === state.mountedHorseId && !h.dead);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={mapBg}
        alt="Mapa"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: isDay ? 'brightness(1)' : 'brightness(0.5) saturate(0.7)' }}
      />

      <div className={`absolute inset-0 transition-all duration-[3000ms] ${weatherOverlay()}`} />
      {!isDay && <div className="absolute inset-0 bg-blue-950/30 transition-all duration-[3000ms]" />}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30" />

      {/* Player position marker */}
      {currentLocDef && (
        <motion.div
          className="absolute z-10 flex flex-col items-center pointer-events-none"
          style={{ left: `${currentLocDef.x}%`, top: `${currentLocDef.y - 8}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="text-xl" style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }}>
            {mountedHorse ? '🐴' : '🤠'}
          </span>
          <span className="text-[8px] font-display text-green-400 bg-background/70 px-1.5 py-0.5 rounded-full mt-0.5">
            📍 Você está aqui
          </span>
        </motion.div>
      )}

      {/* Location markers */}
      {locations.map((loc, i) => {
        const isRaided = state.activeRaids.some(r => r.area === loc.id);
        return (
          <motion.button
            key={loc.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            className="location-marker absolute flex flex-col items-center"
            style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => {
              if (loc.locked) return;
              onLocationClick(loc.id);
            }}
            whileTap={loc.locked ? {} : { scale: 0.9 }}
          >
            {isRaided && (
              <span className="absolute -top-4 text-sm animate-bounce-gentle" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }}>
                ⚔️
              </span>
            )}
            <span
              className={`text-2xl ${loc.locked ? 'grayscale opacity-50' : ''} ${isRaided ? 'opacity-50' : ''}`}
              style={{ filter: loc.locked ? 'none' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
            >
              {loc.icon}
            </span>
            <span className={`glass px-2 py-0.5 rounded-md text-[9px] font-display text-foreground mt-0.5 whitespace-nowrap ${loc.locked ? 'opacity-50' : ''}`}>
              {loc.locked ? '🔒 Bloqueado' : loc.name}
            </span>
            {isRaided && (
              <span className="text-[8px] text-red-400 font-display mt-0.5">Sob ataque!</span>
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
            className="absolute z-10 animate-float"
            style={{
              left: `${state.activeScrollQuest.mapX}%`,
              top: `${state.activeScrollQuest.mapY}%`,
              transform: 'translate(-50%, -50%)',
            }}
            whileTap={{ scale: 0.85 }}
          >
            <span
              className="text-3xl"
              style={{ filter: SCROLL_AURA[state.activeScrollQuest.rarity] }}
            >
              📜
            </span>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-display text-gold whitespace-nowrap">
              Quest!
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
            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 12px hsl(var(--gold-glow)))' }}>
              🎁
            </span>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-display text-gold whitespace-nowrap">
              Surpresa!
            </span>
          </motion.button>
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
  );
}
