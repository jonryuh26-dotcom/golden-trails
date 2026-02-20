import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LocationId } from '@/hooks/useGameState';

const LOCATION_NAMES: Record<LocationId, string> = {
  fazenda: 'Fazenda',
  pasto: 'Pasto',
  estabulo: 'Estábulo',
  mercado: 'Mercado',
  medicina: 'Medicina',
  pub: 'Pub',
  floresta: 'Floresta',
  mina: 'Mina',
  arena: 'Arena',
};

interface Props {
  travelingTo: LocationId | null;
  travelEndTime: number | null;
  onComplete: () => void;
  onAccelerate: () => void;
  diamonds: number;
}

export default function TravelBar({ travelingTo, travelEndTime, onComplete, onAccelerate, diamonds }: Props) {
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1);

  useEffect(() => {
    if (!travelEndTime) return;
    setTotalDuration(Math.max(travelEndTime - Date.now(), 1));
    const interval = setInterval(() => {
      const r = Math.max(0, travelEndTime - Date.now());
      setRemaining(r);
      if (r <= 0) {
        onComplete();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [travelEndTime, onComplete]);

  const progress = totalDuration > 0 ? Math.max(0, 1 - remaining / totalDuration) : 1;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <AnimatePresence>
      {travelingTo && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="absolute bottom-16 left-3 right-3 z-25 glass rounded-2xl px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl animate-gallop">🐎</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-display text-foreground">Viajando para {LOCATION_NAMES[travelingTo]}...</span>
                <span className="text-gold font-display">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-glow"
                  style={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
            {diamonds > 0 && (
              <button onClick={onAccelerate} className="btn-game text-[10px] px-3 py-1.5 flex items-center gap-1">
                💎 Acelerar
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
