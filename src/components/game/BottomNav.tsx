import { motion } from 'framer-motion';

export type Tab = 'mapa' | 'inventario' | 'quests' | 'veiculos' | 'config';

interface Props {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: 'mapa', icon: '🗺️', label: 'Mapa' },
  { id: 'inventario', icon: '🎒', label: 'Inventário' },
  { id: 'quests', icon: '📜', label: 'Quests' },
  { id: 'veiculos', icon: '🐎', label: 'Veículos' },
  { id: 'config', icon: '⚙️', label: 'Config' },
];

export default function BottomNav({ active, onTabChange }: Props) {
  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-0 right-0 z-30 glass border-t border-gold/10"
    >
      <div className="flex items-center justify-around py-1.5 pb-safe">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 active:scale-90"
          >
            <span
              className={`text-lg transition-all duration-300 ${active === tab.id ? 'scale-110' : 'opacity-60'}`}
              style={active === tab.id ? { filter: 'drop-shadow(0 0 6px hsl(var(--gold-glow)))' } : {}}
            >
              {tab.icon}
            </span>
            <span className={`text-[9px] font-display transition-colors ${active === tab.id ? 'text-gold' : 'text-muted-foreground'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
