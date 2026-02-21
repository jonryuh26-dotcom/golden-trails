import { motion } from 'framer-motion';
import type { GameState, ScrollRarity } from '@/hooks/useGameState';

const RARITY_BORDER: Record<ScrollRarity, string> = {
  'comum': 'border-gray-400/40',
  'raro': 'border-blue-500/40',
  'épico': 'border-purple-500/40',
  'lendário': 'border-yellow-500/40',
  'mítico': 'border-red-500/40',
};

const RARITY_TEXT: Record<ScrollRarity, string> = {
  'comum': 'text-gray-400',
  'raro': 'text-blue-400',
  'épico': 'text-purple-400',
  'lendário': 'text-yellow-400',
  'mítico': 'text-red-400',
};

const RARITY_GLOW: Record<ScrollRarity, string> = {
  'comum': '',
  'raro': 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
  'épico': 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
  'lendário': 'shadow-[0_0_14px_rgba(245,158,11,0.3)]',
  'mítico': 'shadow-[0_0_16px_rgba(239,68,68,0.4)]',
};

interface Props {
  state: GameState;
}

export default function QuestsPanel({ state }: Props) {
  const quest = state.activeScrollQuest;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      <div className="glass px-4 py-3">
        <h2 className="font-display text-base gold-text">📜 Quests</h2>
        <p className="text-[9px] text-muted-foreground">Quests completas: {state.completedScrollQuests || 0}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
        {!quest && (
          <div className="text-center mt-8">
            <span className="text-3xl">📜</span>
            <p className="text-sm text-muted-foreground mt-2">Nenhuma quest ativa.</p>
            <p className="text-xs text-muted-foreground mt-1">Pergaminhos aparecem no mapa a cada 10 min. Fique atento!</p>
          </div>
        )}
        {quest && (
          <div className={`glass rounded-xl p-4 border ${RARITY_BORDER[quest.rarity]} ${RARITY_GLOW[quest.rarity]} space-y-3`}>
            <div className="flex items-center justify-between">
              <p className={`font-display text-sm ${RARITY_TEXT[quest.rarity]}`}>
                📜 Quest {quest.rarity.charAt(0).toUpperCase() + quest.rarity.slice(1)}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gold font-display">🪙 {quest.goldReward}</span>
                {quest.diamondReward > 0 && (
                  <span className="text-xs text-diamond font-display">💎 {quest.diamondReward}</span>
                )}
              </div>
            </div>

            {/* Story */}
            {quest.story && (
              <div className="glass rounded-lg p-2 border border-gold/10">
                <p className="text-[10px] text-foreground italic">"{quest.story}"</p>
                {quest.npcName && (
                  <p className="text-[9px] text-gold font-display mt-1">— {quest.npcName}</p>
                )}
              </div>
            )}

            <p className="text-xs text-foreground">{quest.objective.label}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all"
                  style={{ width: `${(quest.progress / quest.objective.target) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{quest.progress}/{quest.objective.target}</span>
            </div>
            {quest.completed && (
              <p className="text-xs text-green-400 font-display text-center animate-pulse-gold">✅ Completa! Recompensas recebidas!</p>
            )}
            {!quest.completed && (
              <p className="text-[9px] text-muted-foreground text-center">
                Expira em {Math.max(0, Math.ceil((quest.expiresAt - Date.now()) / 1000))}s
              </p>
            )}
          </div>
        )}

        {/* Raids info */}
        {state.activeRaids.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-display text-red-400">♟️ Invasões ativas:</p>
            {state.activeRaids.map(r => (
              <div key={r.area} className="glass rounded-xl p-3 border border-red-500/30">
                <p className="text-xs text-red-400 font-display capitalize">
                  {r.area} - Sob ataque!
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Termina em {Math.max(0, Math.ceil((r.endsAt - Date.now()) / 60000))} min
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
