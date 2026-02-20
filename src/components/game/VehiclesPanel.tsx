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
  onFeed: (id: string) => void;
  onRemoveDead: (id: string) => void;
}

export default function VehiclesPanel({ horses, mountedId, onMount, onFeed, onRemoveDead }: Props) {
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
        <p className="text-[10px] text-muted-foreground text-center">⚠️ Você precisa montar um cavalo para viajar!</p>
        {horses.map(h => {
          if (h.dead) {
            return (
              <div key={h.id} className="glass rounded-xl p-4 border border-red-500/30 flex items-center gap-3">
                <span className="text-3xl grayscale">💀</span>
                <div className="flex-1">
                  <p className="font-display text-sm text-red-400">{h.name} (Morto)</p>
                  <p className="text-[10px] text-muted-foreground">Morreu de fome</p>
                </div>
                <button onClick={() => onRemoveDead(h.id)} className="btn-game text-[10px] px-3 py-1.5 opacity-70">Remover</button>
              </div>
            );
          }
          const hungerPct = Math.max(0, 1 - (Date.now() - h.lastFedAt) / (30 * 60 * 1000));
          return (
            <div key={h.id} className={`glass rounded-xl p-4 border ${RARITY_STYLES[h.rarity]} space-y-2`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🐴</span>
                <div className="flex-1">
                  <p className={`font-display text-sm ${RARITY_TEXT[h.rarity]}`}>{h.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{h.rarity} • {h.isAdult ? 'Adulto' : 'Potro'}</p>
                </div>
                <button
                  onClick={() => onMount(mountedId === h.id ? null : h.id)}
                  className={`btn-game text-[10px] px-3 py-1.5 ${mountedId === h.id ? 'opacity-70' : ''}`}
                >
                  {mountedId === h.id ? '✅ Montado' : 'Montar'}
                </button>
              </div>
              {/* Hunger bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">🍖</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${hungerPct > 0.3 ? 'bg-green-500' : hungerPct > 0.1 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}
                    style={{ width: `${hungerPct * 100}%` }}
                  />
                </div>
                <button onClick={() => onFeed(h.id)} className="text-[10px] text-gold font-display active:scale-90 transition-transform">
                  🌾 Alimentar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
