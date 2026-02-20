import { motion } from 'framer-motion';
import type { Horse, HorseRarity } from '@/hooks/useGameState';

const RARITY_STYLES: Record<HorseRarity, string> = {
  'comum': 'border-rarity-common/40 shadow-[0_0_12px_hsl(var(--rarity-common)/0.3)]',
  'raro': 'border-rarity-rare/40 shadow-[0_0_12px_hsl(var(--rarity-rare)/0.3)]',
  'épico': 'border-rarity-epic/40 shadow-[0_0_12px_hsl(var(--rarity-epic)/0.3)]',
  'lendário': 'border-rarity-legendary/40 shadow-[0_0_16px_hsl(var(--rarity-legendary)/0.4)]',
};

const RARITY_TEXT: Record<HorseRarity, string> = {
  'comum': 'text-rarity-common',
  'raro': 'text-rarity-rare',
  'épico': 'text-rarity-epic',
  'lendário': 'text-rarity-legendary',
};

interface Props {
  horses: Horse[];
  mountedId: string | null;
  onMount: (id: string | null) => void;
}

export default function VehiclesPanel({ horses, mountedId, onMount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      <div className="glass px-4 py-3">
        <h2 className="font-display text-base gold-text">🐎 Veículos</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
        {horses.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">Nenhum cavalo. Visite o Estábulo!</p>
        )}
        {horses.map(h => (
          <div key={h.id} className={`glass rounded-xl p-4 border ${RARITY_STYLES[h.rarity]} flex items-center gap-3`}>
            <span className="text-3xl">🐴</span>
            <div className="flex-1">
              <p className={`font-display text-sm ${RARITY_TEXT[h.rarity]}`}>{h.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{h.rarity} • {h.isAdult ? 'Adulto' : 'Potro'}</p>
            </div>
            <button
              onClick={() => onMount(mountedId === h.id ? null : h.id)}
              className={`btn-game text-[10px] px-3 py-1.5 ${mountedId === h.id ? 'opacity-70' : ''}`}
            >
              {mountedId === h.id ? 'Desmontar' : 'Montar'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
