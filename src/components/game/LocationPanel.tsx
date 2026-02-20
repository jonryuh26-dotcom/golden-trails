import { motion } from 'framer-motion';
import type { LocationId, GameState, HorseRarity } from '@/hooks/useGameState';

const LOCATION_NAMES: Record<LocationId, string> = {
  fazenda: 'Fazenda', pasto: 'Pasto', estabulo: 'Estábulo',
  mercado: 'Mercado', medicina: 'Medicina', pub: 'Pub',
  floresta: 'Floresta', mina: 'Mina', arena: 'Arena',
};

const RARITY_COLORS: Record<HorseRarity, string> = {
  'comum': 'text-rarity-common',
  'raro': 'text-rarity-rare',
  'épico': 'text-rarity-epic',
  'lendário': 'text-rarity-legendary',
};

interface Props {
  location: LocationId;
  state: GameState;
  onBack: () => void;
  onCollectTree: (i: number) => void;
  onBuyHorse: (r: HorseRarity) => void;
  onEvolveHorse: (id: string) => void;
  onBuyItem: (item: string, cost: number) => void;
}

export default function LocationPanel({ location, state, onBack, onCollectTree, onBuyHorse, onEvolveHorse, onBuyItem }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      {/* Header */}
      <div className="glass px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="btn-game text-xs px-3 py-1">← Voltar</button>
        <h2 className="font-display text-base gold-text flex-1">{LOCATION_NAMES[location]}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {/* FLORESTA */}
        {location === 'floresta' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Colete madeira das árvores disponíveis.</p>
            <div className="flex gap-4 justify-center">
              {state.trees.map((tree, i) => (
                <button
                  key={i}
                  disabled={!tree.available}
                  onClick={() => tree.available && onCollectTree(i)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all active:scale-90 ${tree.available ? 'glass gold-glow' : 'bg-destructive/20 opacity-60'}`}
                >
                  <span className={`text-3xl ${!tree.available ? 'animate-tree-shake grayscale' : ''}`}>
                    {tree.available ? '🌳' : '🪵'}
                  </span>
                  <span className="text-[10px] font-display text-foreground">
                    {tree.available ? 'Coletar' : 'Esgotada'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ESTÁBULO */}
        {location === 'estabulo' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Seus cavalos ({state.horses.length}/2)</p>
            {state.horses.length === 0 && <p className="text-xs text-muted-foreground">Nenhum cavalo ainda.</p>}
            {state.horses.map(h => (
              <div key={h.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">🐴</span>
                <div className="flex-1">
                  <p className={`font-display text-sm ${RARITY_COLORS[h.rarity]}`}>{h.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{h.rarity} • {h.isAdult ? 'Adulto' : 'Potro'}</p>
                </div>
                {!h.isAdult && (
                  <button onClick={() => onEvolveHorse(h.id)} className="btn-game text-[10px] px-2 py-1">Evoluir</button>
                )}
              </div>
            ))}
            {state.horses.length < 2 && (
              <div className="space-y-2">
                <p className="text-xs font-display text-gold">Comprar Potro:</p>
                {(['comum', 'raro', 'épico', 'lendário'] as HorseRarity[]).map(r => {
                  const costs: Record<HorseRarity, number> = { 'comum': 20, 'raro': 50, 'épico': 100, 'lendário': 200 };
                  return (
                    <button
                      key={r}
                      onClick={() => onBuyHorse(r)}
                      className="glass rounded-xl p-3 flex items-center gap-3 w-full text-left active:scale-95 transition-transform"
                    >
                      <span className="text-xl">🐴</span>
                      <span className={`font-display text-sm capitalize ${RARITY_COLORS[r]}`}>{r}</span>
                      <span className="ml-auto text-xs text-gold">🪙 {costs[r]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MERCADO */}
        {location === 'mercado' && (
          <div className="space-y-3">
            {[{ item: 'Maçã', cost: 5, icon: '🍎' }, { item: 'Frutas', cost: 8, icon: '🍇' }, { item: 'Ração', cost: 10, icon: '🌾' }].map(p => (
              <motion.button
                key={p.item}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBuyItem(p.item, p.cost)}
                className="glass rounded-xl p-4 flex items-center gap-3 w-full animate-float"
                style={{ animationDelay: `${Math.random()}s` }}
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm text-foreground">{p.item}</p>
                </div>
                <span className="text-xs font-display text-gold">🪙 {p.cost}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* PASTO */}
        {location === 'pasto' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Seus animais</p>
            {state.animals.map(a => (
              <div key={a.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{a.type === 'vaca' ? '🐄' : a.type === 'ovelha' ? '🐑' : '🐔'}</span>
                <div className="flex-1">
                  <p className="font-display text-sm text-foreground capitalize">{a.type}</p>
                </div>
                {a.hungry && <span className="text-sm animate-bounce-gentle">🍽️</span>}
              </div>
            ))}
          </div>
        )}

        {/* MEDICINA */}
        {location === 'medicina' && (
          <div className="space-y-3">
            {[{ item: 'Vacina Cavalos', cost: 30, icon: '💉' }, { item: 'Vacina Animais', cost: 20, icon: '💊' }].map(p => (
              <button
                key={p.item}
                onClick={() => onBuyItem(p.item, p.cost)}
                className="glass rounded-xl p-4 flex items-center gap-3 w-full active:scale-95 transition-transform"
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm text-foreground">{p.item}</p>
                </div>
                <span className="text-xs font-display text-gold">🪙 {p.cost}</span>
              </button>
            ))}
            <div className="glass rounded-xl p-3 border border-gold/20">
              <p className="text-xs text-muted-foreground font-display">🧪 Quest: Craftar vacina rara (em breve)</p>
            </div>
          </div>
        )}

        {/* PUB */}
        {location === 'pub' && (
          <div className="space-y-3">
            <div className="text-center py-6">
              <span className="text-4xl">🍺</span>
              <p className="font-display text-sm text-foreground mt-2">Bem-vindo ao Pub!</p>
              <p className="text-xs text-muted-foreground mt-1">Fumaça leve... música ao fundo...</p>
            </div>
            {state.questLocations.includes('pub') && (
              <div className="glass rounded-xl p-3 border border-gold/20 animate-pulse-gold">
                <p className="text-xs font-display text-gold">💬 Nova quest disponível!</p>
                <p className="text-[10px] text-muted-foreground mt-1">Fale com o barman para mais detalhes.</p>
              </div>
            )}
          </div>
        )}

        {/* FAZENDA / MINA / ARENA - placeholder */}
        {['fazenda', 'mina', 'arena'].includes(location) && (
          <div className="text-center py-8">
            <span className="text-4xl">
              {location === 'fazenda' ? '🏠' : location === 'mina' ? '⛏️' : '⚔️'}
            </span>
            <p className="font-display text-sm text-foreground mt-3">{LOCATION_NAMES[location]}</p>
            <p className="text-xs text-muted-foreground mt-1">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
