import { motion } from 'framer-motion';

const ITEM_ICONS: Record<string, string> = {
  'Madeira': '🪵', 'Maçã': '🍎', 'Frutas': '🍇', 'Ração': '🌾',
  'Vacina Cavalos': '💉', 'Vacina Animais': '💊',
  'Picareta': '⛏️', 'Escudo': '🛡️', 'Erva': '🌿',
  'Semente Medicinal': '🌰', 'Trigo': '🌾', 'Milho': '🌽', 'Cenoura': '🥕',
  'Semente Trigo': '🌾', 'Semente Milho': '🌽', 'Semente Cenoura': '🥕',
  'Caixa Gacha Cavalo': '🎁',
};

interface Props {
  inventory: Record<string, number>;
  onOpenGacha: () => void;
}

export default function InventoryPanel({ inventory, onOpenGacha }: Props) {
  const items = Object.entries(inventory).filter(([, v]) => v > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      <div className="glass px-4 py-3">
        <h2 className="font-display text-base gold-text">🎒 Inventário</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">Inventário vazio</p>}
        <div className="grid grid-cols-3 gap-3">
          {items.map(([name, qty]) => {
            const isGachaBox = name === 'Caixa Gacha Cavalo';
            return (
              <button
                key={name}
                onClick={isGachaBox ? onOpenGacha : undefined}
                className={`glass rounded-xl p-3 flex flex-col items-center gap-1 transition-all ${isGachaBox ? 'gold-glow active:scale-95 cursor-pointer border border-gold/30' : ''}`}
              >
                <span className={`text-2xl ${isGachaBox ? 'animate-bounce-gentle' : ''}`}>
                  {ITEM_ICONS[name] || '📦'}
                </span>
                <span className="text-[10px] font-display text-foreground">{name}</span>
                <span className="text-xs text-gold font-display">x{qty}</span>
                {isGachaBox && (
                  <span className="text-[8px] text-gold animate-pulse-gold">Toque para abrir!</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
