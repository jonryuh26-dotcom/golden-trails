import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameState, Weather } from '@/hooks/useGameState';
import horsesImg from '@/assets/horses-rarity.png';

const HORSE_SPRITE: Record<string, { row: number; col: number }> = {
  'comum': { row: 0, col: 0 },
  'raro': { row: 0, col: 1 },
  'épico': { row: 1, col: 0 },
  'lendário': { row: 1, col: 1 },
  'mítico': { row: 1, col: 1 },
};

interface HUDProps {
  state: GameState;
}

function getTimeStr() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function isDayTime() {
  const h = new Date().getHours();
  return h >= 6 && h < 18;
}

function getWeatherIcon(weather: Weather) {
  switch (weather) {
    case 'rain': return '🌧️';
    case 'snow': return '❄️';
    case 'drought': return '🔥';
    default: return isDayTime() ? '☀️' : '🌙';
  }
}

export default function HUD({ state }: HUDProps) {
  const [time, setTime] = useState(getTimeStr());

  useEffect(() => {
    const i = setInterval(() => setTime(getTimeStr()), 1000);
    return () => clearInterval(i);
  }, []);

  const mountedHorse = state.horses.find(h => h.id === state.mountedHorseId && !h.dead);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 left-0 right-0 z-30 glass px-3 py-2 flex items-center justify-between safe-area-top"
    >
      {/* Player - uses horse image as profile */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg border border-gold/30 overflow-hidden">
          {mountedHorse ? (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${horsesImg})`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${HORSE_SPRITE[mountedHorse.rarity].col * 100}% ${HORSE_SPRITE[mountedHorse.rarity].row * 100}%`,
              }}
            />
          ) : (
            <span className="animate-pulse-gold">🤠</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-display text-xs gold-text font-semibold leading-tight">{state.playerName}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Nv.{state.level}</span>
            <div className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full" style={{ width: `${(state.xp % 100)}%` }} />
            </div>
            {mountedHorse && (
              <span className="text-[8px] text-green-400 ml-1">🐴 {mountedHorse.speed}</span>
            )}
            {!mountedHorse && (
              <span className="text-[8px] text-muted-foreground ml-1">🚶</span>
            )}
          </div>
        </div>
      </div>

      {/* Currency + Time */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm animate-shimmer bg-gradient-to-r from-gold via-gold-glow to-gold bg-clip-text text-transparent">🪙</span>
          <span className="text-xs font-display text-gold">{state.gold}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ filter: 'drop-shadow(0 0 4px hsl(210 80% 60%))' }}>💎</span>
          <span className="text-xs font-display text-diamond">{state.diamonds}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{getWeatherIcon(state.weather)}</span>
          <span className="font-display">{time}</span>
        </div>
      </div>
    </motion.div>
  );
}
