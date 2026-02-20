import { motion } from 'framer-motion';

const ITEM_ICONS: Record<string, string> = {
  'Madeira': '🪵', 'Maçã': '🍎', 'Frutas': '🍇', 'Ração': '🌾',
  'Vacina Cavalos': '💉', 'Vacina Animais': '💊',
};

interface Props {
  inventory: Record<string, number>;
}

export default function InventoryPanel({ inventory }: Props) {
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
          {items.map(([name, qty]) => (
            <div key={name} className="glass rounded-xl p-3 flex flex-col items-center gap-1">
              <span className="text-2xl">{ITEM_ICONS[name] || '📦'}</span>
              <span className="text-[10px] font-display text-foreground">{name}</span>
              <span className="text-xs text-gold font-display">x{qty}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
