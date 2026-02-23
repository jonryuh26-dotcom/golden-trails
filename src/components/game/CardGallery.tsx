import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, ExplorationCard, CardRarity } from '@/hooks/useGameState';
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
  'comum': 'border-gray-400/60',
  'raro': 'border-blue-400/60',
  'épico': 'border-purple-400/60',
  'lendário': 'border-yellow-400/60',
  'mítico': 'border-red-400/60',
};

const RARITY_GLOW: Record<CardRarity, string> = {
  'comum': '',
  'raro': 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  'épico': 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  'lendário': 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
  'mítico': 'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
};

const RARITY_LABEL_BG: Record<CardRarity, string> = {
  'comum': 'bg-gray-700/60',
  'raro': 'bg-blue-700/60',
  'épico': 'bg-purple-700/60',
  'lendário': 'bg-yellow-700/60',
  'mítico': 'bg-red-700/60',
};

interface Props {
  state: GameState;
}

export default function CardGallery({ state }: Props) {
  const [selectedCard, setSelectedCard] = useState<ExplorationCard | null>(null);
  const [showCollection, setShowCollection] = useState(false);

  const ownedCards = CARD_DEFINITIONS.filter(c => (state.cards[c.id] || 0) > 0);
  const allCards = CARD_DEFINITIONS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      {/* Header */}
      <div className="glass px-4 py-3 flex items-center justify-between">
        <h2 className="font-display text-base gold-text">🃏 Cartas</h2>
        <button
          onClick={() => setShowCollection(!showCollection)}
          className="flex items-center gap-1.5 glass px-3 py-1 rounded-lg active:scale-95 transition-transform"
        >
          <span className="text-sm">❓</span>
          <span className="text-[10px] font-display text-gold">{showCollection ? 'Minhas' : 'Coleção'}</span>
        </button>
      </div>

      {/* Equipped card banner */}
      {state.equippedCardId && (
        <div className="mx-3 mt-2 glass rounded-xl px-3 py-2 flex items-center gap-2 border border-gold/20">
          <span className="text-sm">⚔️</span>
          <span className="text-[10px] font-display text-gold">
            Equipada: {CARD_DEFINITIONS.find(c => c.id === state.equippedCardId)?.name}
          </span>
        </div>
      )}

      {/* Slot status */}
      {state.explorationSlotDestroyed && (
        <div className="mx-3 mt-2 rounded-xl px-3 py-2 flex items-center gap-2 bg-red-900/30 border border-red-500/30">
          <span className="text-sm">💥</span>
          <span className="text-[10px] font-display text-red-400">Slot destruído – repare na exploração!</span>
        </div>
      )}

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-3 pb-20">
        <div className="grid grid-cols-3 gap-3">
          {(showCollection ? allCards : ownedCards).map((card, i) => {
            const qty = state.cards[card.id] || 0;
            const owned = qty > 0;

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCard(card)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${
                  owned ? RARITY_BORDER[card.rarity] : 'border-muted/30'
                } ${owned ? RARITY_GLOW[card.rarity] : ''} ${!owned ? 'grayscale opacity-40' : ''}`}
              >
                <img
                  src={CARD_IMAGES[card.image] || cardMystery}
                  alt={card.name}
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6">
                  <p className="text-[10px] font-display text-foreground truncate">{card.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-display ${RARITY_LABEL_BG[card.rarity]} text-foreground`}>
                      {card.rarity}
                    </span>
                    {owned && <span className="text-[9px] text-gold font-display">x{qty}</span>}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {!showCollection && ownedCards.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">Nenhuma carta encontrada.</p>
        )}
      </div>

      {/* Card detail modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/90"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className={`mx-6 max-w-[260px] w-full rounded-2xl overflow-hidden border-2 ${RARITY_BORDER[selectedCard.rarity]} ${RARITY_GLOW[selectedCard.rarity]}`}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, hsl(30 15% 10%), hsl(30 20% 16%))',
              }}
            >
              <img
                src={CARD_IMAGES[selectedCard.image] || cardMystery}
                alt={selectedCard.name}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base gold-text">{selectedCard.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-display ${RARITY_LABEL_BG[selectedCard.rarity]} text-foreground`}>
                    {selectedCard.rarity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedCard.description}</p>
                <div className="glass rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-display text-foreground">Bônus</span>
                  <span className="text-sm font-display text-gold">+{selectedCard.bonusValue}% {selectedCard.bonusType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-display text-gold">{state.cards[selectedCard.id] || 0}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="w-full py-2.5 text-xs font-display text-muted-foreground border-t border-gold/10 hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
