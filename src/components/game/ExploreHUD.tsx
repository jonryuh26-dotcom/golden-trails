import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LocationId, GameState, ExplorationCard, CardRarity } from '@/hooks/useGameState';
import { CARD_DEFINITIONS } from '@/hooks/useGameState';
import cardMystery from '@/assets/card-mystery.png';
import cardPub from '@/assets/card-pub.png';
import cardCoffee from '@/assets/card-coffee.png';

const CARD_IMAGES: Record<string, string> = {
  mystery: cardMystery,
  pub: cardPub,
  coffee: cardCoffee,
};

const RARITY_BORDER: Record<CardRarity, string> = {
  'comum': 'border-gray-400',
  'raro': 'border-blue-400',
  'épico': 'border-purple-400',
  'lendário': 'border-yellow-400',
  'mítico': 'border-red-400',
};

const RARITY_GLOW: Record<CardRarity, string> = {
  'comum': '',
  'raro': 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
  'épico': 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
  'lendário': 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
  'mítico': 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
};

const LOCATION_DIFFICULTY: Record<LocationId, { level: number; label: string }> = {
  fazenda: { level: 1, label: 'Fácil' },
  floresta: { level: 2, label: 'Moderado' },
  mercado: { level: 1, label: 'Fácil' },
  estabulo: { level: 1, label: 'Fácil' },
  pasto: { level: 2, label: 'Moderado' },
  mina: { level: 3, label: 'Difícil' },
  pub: { level: 1, label: 'Fácil' },
  medicina: { level: 2, label: 'Moderado' },
  arena: { level: 4, label: 'Perigoso' },
};

const LOCATION_REWARDS: Record<LocationId, string> = {
  fazenda: 'Trigo, Milho, Cenoura',
  floresta: 'Madeira, Ervas, Sementes',
  mercado: 'Itens à venda',
  estabulo: 'Cavalos, Evolução',
  pasto: 'Leite, Lã',
  mina: 'Diamantes, Ouro',
  pub: 'Quests, Moral',
  medicina: 'Vacinas',
  arena: 'Recompensas PvP',
};

const LOCATION_NAMES: Record<LocationId, string> = {
  fazenda: 'Fazenda',
  floresta: 'Floresta',
  mercado: 'Mercado',
  estabulo: 'Estábulo',
  pasto: 'Pasto',
  mina: 'Mina',
  pub: 'Pub',
  medicina: 'Medicina',
  arena: 'Arena',
};

interface Props {
  location: LocationId;
  state: GameState;
  onConfirm: () => void;
  onCancel: () => void;
  onEquipCard: (cardId: string | null) => void;
  onRepairSlot: () => void;
}

export default function ExploreHUD({ location, state, onConfirm, onCancel, onEquipCard, onRepairSlot }: Props) {
  const [selectingCard, setSelectingCard] = useState(false);

  const diff = LOCATION_DIFFICULTY[location] || { level: 1, label: 'Fácil' };
  const rewards = LOCATION_REWARDS[location] || '';
  const equippedCard = state.equippedCardId ? CARD_DEFINITIONS.find(c => c.id === state.equippedCardId) : null;

  const availableCards = CARD_DEFINITIONS.filter(c => (state.cards[c.id] || 0) > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/85"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="mx-4 max-w-sm w-full rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, hsl(30 20% 10%), hsl(30 15% 15%))',
          border: '2px solid hsl(40 70% 40% / 0.6)',
          boxShadow: '0 0 30px rgba(218, 165, 32, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-gold/20">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg gold-text">⚔️ Explorar</h2>
            <button onClick={onCancel} className="text-muted-foreground text-sm hover:text-foreground">✕</button>
          </div>
        </div>

        {/* Location info */}
        <div className="px-5 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-base text-foreground">{LOCATION_NAMES[location]}</span>
            <span className={`text-xs font-display px-2 py-0.5 rounded-full ${
              diff.level <= 1 ? 'bg-green-900/40 text-green-400' :
              diff.level <= 2 ? 'bg-yellow-900/40 text-yellow-400' :
              diff.level <= 3 ? 'bg-orange-900/40 text-orange-400' :
              'bg-red-900/40 text-red-400'
            }`}>
              {'⭐'.repeat(diff.level)} {diff.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Recompensas: <span className="text-gold">{rewards}</span>
          </p>
        </div>

        {/* Card slot */}
        <div className="px-5 py-3 border-t border-gold/10">
          <p className="text-[10px] font-display text-muted-foreground mb-2 uppercase tracking-wider">Slot de Carta</p>

          {state.explorationSlotDestroyed ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <span className="text-3xl">💥</span>
              <p className="text-xs text-red-400 font-display text-center">Slot destruído!</p>
              <button
                onClick={onRepairSlot}
                className="btn-game text-[11px] px-4 py-1.5"
              >
                🔧 Reparar (50 🪙)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Card slot visual */}
              <button
                onClick={() => setSelectingCard(!selectingCard)}
                className={`relative w-20 h-28 rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden ${
                  equippedCard
                    ? `${RARITY_BORDER[equippedCard.rarity]} border-solid ${RARITY_GLOW[equippedCard.rarity]}`
                    : 'border-gold/30 hover:border-gold/60'
                }`}
                style={{
                  background: equippedCard
                    ? 'linear-gradient(135deg, hsl(30 15% 12%), hsl(30 20% 18%))'
                    : 'linear-gradient(135deg, hsl(30 10% 8%), hsl(30 15% 12%))',
                }}
              >
                {equippedCard ? (
                  <img
                    src={CARD_IMAGES[equippedCard.image] || cardMystery}
                    alt={equippedCard.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gold/30">+</span>
                )}
              </button>

              {/* Card info */}
              <div className="flex-1">
                {equippedCard ? (
                  <div className="space-y-1">
                    <p className="font-display text-sm text-foreground">{equippedCard.name}</p>
                    <p className="text-[10px] text-gold">+{equippedCard.bonusValue}% {equippedCard.bonusType.replace(/_/g, ' ')}</p>
                    <button
                      onClick={() => onEquipCard(null)}
                      className="text-[10px] text-red-400 underline"
                    >
                      Remover carta
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Toque no slot para equipar uma carta de bônus.</p>
                )}
              </div>
            </div>
          )}

          {/* Card selection dropdown */}
          <AnimatePresence>
            {selectingCard && !state.explorationSlotDestroyed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden"
              >
                {availableCards.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhuma carta disponível.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => { onEquipCard(card.id); setSelectingCard(false); }}
                        className={`rounded-lg overflow-hidden border ${RARITY_BORDER[card.rarity]} ${RARITY_GLOW[card.rarity]} transition-all active:scale-95`}
                      >
                        <img
                          src={CARD_IMAGES[card.image] || cardMystery}
                          alt={card.name}
                          className="w-full aspect-[3/4] object-cover"
                        />
                        <div className="px-1 py-0.5 bg-background/80">
                          <p className="text-[8px] font-display text-foreground truncate">{card.name}</p>
                          <p className="text-[7px] text-gold">+{card.bonusValue}%</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm button */}
        <div className="px-5 py-4 border-t border-gold/10">
          <button
            onClick={onConfirm}
            className="btn-game w-full py-2.5 text-sm font-display flex items-center justify-center gap-2"
          >
            ⚔️ Explorar {LOCATION_NAMES[location]}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
