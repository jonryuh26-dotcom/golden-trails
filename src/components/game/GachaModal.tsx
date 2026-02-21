import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HorseRarity } from '@/hooks/useGameState';
import { GACHA_WEIGHTS, rollGacha } from '@/hooks/useGameState';
import horsesImg from '@/assets/horses-rarity.png';

const RARITY_COLORS: Record<HorseRarity, string> = {
  'comum': '#22c55e',
  'raro': '#3b82f6',
  'épico': '#a855f7',
  'lendário': '#f59e0b',
  'mítico': '#ef4444',
};

const RARITY_BG: Record<HorseRarity, string> = {
  'comum': 'from-green-900/60 to-green-800/30',
  'raro': 'from-blue-900/60 to-blue-800/30',
  'épico': 'from-purple-900/60 to-purple-800/30',
  'lendário': 'from-yellow-900/60 to-yellow-800/30',
  'mítico': 'from-red-900/60 to-red-800/30',
};

const HORSE_SPRITE: Record<string, { row: number; col: number }> = {
  'comum': { row: 0, col: 0 },
  'raro': { row: 0, col: 1 },
  'épico': { row: 1, col: 0 },
  'lendário': { row: 1, col: 1 },
  'mítico': { row: 1, col: 1 },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onResult: (rarity: HorseRarity, name: string) => void;
}

export default function GachaModal({ open, onClose, onResult }: Props) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [spinIndex, setSpinIndex] = useState(0);
  const [result, setResult] = useState<{ rarity: HorseRarity; name: string } | null>(null);

  const startSpin = useCallback(() => {
    setPhase('spinning');
    setResult(null);

    const finalResult = rollGacha();

    let tick = 0;
    const totalTicks = 20;
    const interval = setInterval(() => {
      tick++;
      setSpinIndex(prev => (prev + 1) % GACHA_WEIGHTS.length);
      if (tick >= totalTicks) {
        clearInterval(interval);
        setResult(finalResult);
        setPhase('result');
      }
    }, 100 + tick * 8);

    setTimeout(() => {
      clearInterval(interval);
      setResult(finalResult);
      setPhase('result');
    }, 3000);
  }, []);

  const handleClaim = useCallback(() => {
    if (result) {
      onResult(result.rarity, result.name);
    }
    setPhase('idle');
    onClose();
  }, [result, onResult, onClose]);

  useEffect(() => {
    if (open) {
      setPhase('idle');
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={(e) => { if (e.target === e.currentTarget && phase !== 'spinning') onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl p-6 w-[90vw] max-w-sm space-y-4"
      >
        <h2 className="font-display text-lg gold-text text-center">🎰 Gacha de Cavalos</h2>

        <div className="relative h-32 overflow-hidden rounded-xl border border-gold/20 bg-background/50">
          {phase === 'idle' && (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl">🎁</span>
            </div>
          )}

          {phase === 'spinning' && (
            <div className="flex items-center justify-center h-full gap-2">
              {GACHA_WEIGHTS.map((g, i) => {
                const sprite = HORSE_SPRITE[g.rarity];
                return (
                  <motion.div
                    key={g.rarity}
                    animate={{
                      scale: i === spinIndex % GACHA_WEIGHTS.length ? 1.3 : 0.7,
                      opacity: i === spinIndex % GACHA_WEIGHTS.length ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border-2"
                      style={{
                        borderColor: RARITY_COLORS[g.rarity],
                        backgroundImage: `url(${horsesImg})`,
                        backgroundSize: '200% 200%',
                        backgroundPosition: `${sprite.col * 100}% ${sprite.row * 100}%`,
                        filter: `drop-shadow(0 0 8px ${RARITY_COLORS[g.rarity]})`,
                      }}
                    />
                    <span className="text-[8px] font-display capitalize" style={{ color: RARITY_COLORS[g.rarity] }}>
                      {g.rarity}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {phase === 'result' && result && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`flex flex-col items-center justify-center h-full bg-gradient-to-b ${RARITY_BG[result.rarity]} rounded-xl`}
            >
              <div
                className="w-16 h-16 rounded-full overflow-hidden border-2"
                style={{
                  borderColor: RARITY_COLORS[result.rarity],
                  backgroundImage: `url(${horsesImg})`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: `${HORSE_SPRITE[result.rarity].col * 100}% ${HORSE_SPRITE[result.rarity].row * 100}%`,
                  filter: `drop-shadow(0 0 16px ${RARITY_COLORS[result.rarity]})`,
                }}
              />
              <p className="font-display text-sm mt-2" style={{ color: RARITY_COLORS[result.rarity] }}>
                {result.name}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">{result.rarity}</p>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {GACHA_WEIGHTS.map(g => (
            <div key={g.rarity} className="flex flex-col items-center">
              <span className="text-[9px] font-display capitalize" style={{ color: RARITY_COLORS[g.rarity] }}>
                {g.rarity}
              </span>
              <span className="text-[8px] text-muted-foreground">{g.weight}%</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          {phase === 'idle' && (
            <button onClick={startSpin} className="btn-game text-sm px-6 py-2">
              🎰 Abrir Caixa
            </button>
          )}
          {phase === 'spinning' && (
            <p className="text-xs text-gold font-display animate-pulse">Sorteando...</p>
          )}
          {phase === 'result' && (
            <button onClick={handleClaim} className="btn-game text-sm px-6 py-2">
              ✅ Resgatar Cavalo
            </button>
          )}
        </div>

        {phase !== 'spinning' && (
          <button onClick={onClose} className="text-xs text-muted-foreground w-full text-center mt-2">
            Fechar
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
