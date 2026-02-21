import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LocationId, GameState, HorseRarity, CropType, PastureAnimalType } from '@/hooks/useGameState';
import { SEED_NAMES, CROP_GROW_TIMES, MARKET_ITEMS, PASTURE_ANIMAL_COSTS } from '@/hooks/useGameState';

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
  'mítico': 'text-red-400',
};

const CROP_INFO: { type: CropType; icon: string; name: string; time: string; seedName: string }[] = [
  { type: 'trigo', icon: '🌾', name: 'Trigo', time: '30s', seedName: 'Semente Trigo' },
  { type: 'milho', icon: '🌽', name: 'Milho', time: '60s', seedName: 'Semente Milho' },
  { type: 'cenoura', icon: '🥕', name: 'Cenoura', time: '45s', seedName: 'Semente Cenoura' },
];

function CropGrowthTimer({ plantedAt, growTime }: { plantedAt: number; growTime: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - plantedAt;
      setProgress(Math.min(1, elapsed / growTime));
    }, 200);
    return () => clearInterval(interval);
  }, [plantedAt, growTime]);
  const remaining = Math.max(0, Math.ceil((growTime - (Date.now() - plantedAt)) / 1000));
  return (
    <div className="w-full mt-1">
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-primary" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="text-[9px] text-muted-foreground text-center mt-0.5">{remaining}s</p>
    </div>
  );
}

function CooldownTimer({ cooldownEnd }: { cooldownEnd: number }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return <span className="text-[10px] text-muted-foreground">{mins}:{String(secs).padStart(2, '0')}</span>;
}

const ANIMAL_ICON: Record<PastureAnimalType, string> = { 'vaca': '🐄', 'ovelha': '🐑', 'galinha': '🐔' };
const ANIMAL_NAME: Record<PastureAnimalType, string> = { 'vaca': 'Vaca', 'ovelha': 'Ovelha', 'galinha': 'Galinha' };

interface Props {
  location: LocationId;
  state: GameState;
  onBack: () => void;
  onCollectTree: (i: number) => void;
  onCollectHerb: (id: number) => void;
  onBuyHorse: (r: HorseRarity) => void;
  onEvolveHorse: (id: string) => void;
  onBuyItem: (item: string, cost: number) => void;
  onPlantCrop: (plotId: number, crop: CropType) => void;
  onHarvestCrop: (plotId: number) => void;
  onMineGold: (slotId: number) => void;
  onFeedHorse: (id: string) => void;
  onRemoveDeadHorse: (id: string) => void;
  onUseShield: (area: LocationId) => void;
  onBuyAnimal: (type: PastureAnimalType) => void;
  onFeedAnimal: (id: string) => void;
  onVaccinateAnimal: (id: string) => void;
  onCollectMilk: (id: string) => void;
  onRemoveDeadAnimal: (id: string) => void;
}

export default function LocationPanel({
  location, state, onBack, onCollectTree, onCollectHerb, onBuyHorse, onEvolveHorse, onBuyItem,
  onPlantCrop, onHarvestCrop, onMineGold, onFeedHorse, onRemoveDeadHorse, onUseShield,
  onBuyAnimal, onFeedAnimal, onVaccinateAnimal, onCollectMilk, onRemoveDeadAnimal,
}: Props) {
  const [selectedCrop, setSelectedCrop] = useState<CropType>('trigo');
  const isRaided = state.activeRaids.some(r => r.area === location);

  if (isRaided) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="absolute inset-0 z-20 bg-background/95 flex flex-col"
      >
        <div className="glass px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="btn-game text-xs px-3 py-1">← Mapa</button>
          <h2 className="font-display text-base text-red-400 flex-1">♟️ {LOCATION_NAMES[location]} sob ataque!</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <span className="text-5xl">♟️</span>
          <p className="text-sm text-red-400 font-display text-center">Esta área está bloqueada por uma invasão!</p>
          <p className="text-xs text-muted-foreground text-center">Você possui um escudo?</p>
          <p className="text-xs text-muted-foreground">Escudos: {state.inventory['Escudo'] || 0}</p>
          {(state.inventory['Escudo'] || 0) > 0 ? (
            <button onClick={() => onUseShield(location)} className="btn-game text-sm px-6 py-2 flex items-center gap-2">
              🛡️ Usar Escudo
            </button>
          ) : (
            <p className="text-xs text-red-400">Sem escudo! Compre no Mercado ou aguarde 30 min.</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      <div className="glass px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="btn-game text-xs px-3 py-1">← Mapa</button>
        <h2 className="font-display text-base gold-text flex-1">{LOCATION_NAMES[location]}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">

        {/* ========== FAZENDA ========== */}
        {location === 'fazenda' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">🌱 Plante e colha. Compre sementes no Mercado!</p>
            <div className="flex gap-2 justify-center">
              {CROP_INFO.map(c => {
                const seedCount = state.inventory[c.seedName] || 0;
                return (
                  <button
                    key={c.type}
                    onClick={() => setSelectedCrop(c.type)}
                    className={`glass rounded-xl px-3 py-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${selectedCrop === c.type ? 'gold-glow border border-gold/40' : 'opacity-70'}`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-[10px] font-display text-foreground">{c.name}</span>
                    <span className="text-[8px] text-muted-foreground">⏱ {c.time}</span>
                    <span className={`text-[8px] font-display ${seedCount > 0 ? 'text-green-400' : 'text-red-400'}`}>🌰 {seedCount}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {state.crops.map(plot => (
                <div key={plot.id} className="glass rounded-xl p-3 flex flex-col items-center min-h-[100px] justify-center">
                  {!plot.crop && (
                    <button onClick={() => onPlantCrop(plot.id, selectedCrop)} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                      <span className="text-2xl opacity-40">🕳️</span>
                      <span className="text-[10px] font-display text-gold">Plantar {CROP_INFO.find(c => c.type === selectedCrop)?.name}</span>
                    </button>
                  )}
                  {plot.crop && !plot.ready && plot.plantedAt && (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className="text-2xl animate-pulse">🌱</span>
                      <span className="text-[10px] font-display text-foreground">{CROP_INFO.find(c => c.type === plot.crop)?.name}</span>
                      <CropGrowthTimer plantedAt={plot.plantedAt} growTime={plot.growTime} />
                    </div>
                  )}
                  {plot.crop && plot.ready && (
                    <button onClick={() => onHarvestCrop(plot.id)} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                      <span className="text-2xl animate-bounce-gentle">{CROP_INFO.find(c => c.type === plot.crop)?.icon}</span>
                      <span className="text-[10px] font-display text-gold animate-pulse-gold">Colher!</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== FLORESTA ========== */}
        {location === 'floresta' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">🪓 Colete madeira e ervas.</p>
            <div>
              <p className="text-xs font-display text-gold mb-2">🌳 Árvores</p>
              <div className="flex gap-4 justify-center">
                {state.trees.map((tree, i) => (
                  <button
                    key={i}
                    disabled={!tree.available}
                    onClick={() => tree.available && onCollectTree(i)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all active:scale-90 ${tree.available ? 'glass gold-glow' : 'bg-destructive/20 opacity-60'}`}
                  >
                    <span className={`text-3xl ${!tree.available ? 'grayscale' : ''}`}>{tree.available ? '🌳' : '🪵'}</span>
                    <span className="text-[10px] font-display text-foreground">{tree.available ? 'Coletar' : 'Esgotada'}</span>
                    {!tree.available && tree.cooldownEnd && <CooldownTimer cooldownEnd={tree.cooldownEnd} />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-display text-gold mb-2">🌿 Ervas & Sementes Medicinais</p>
              <div className="flex gap-4 justify-center">
                {state.herbs.map(herb => (
                  <button
                    key={herb.id}
                    disabled={!herb.available}
                    onClick={() => herb.available && onCollectHerb(herb.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all active:scale-90 ${herb.available ? 'glass gold-glow' : 'bg-destructive/20 opacity-60'}`}
                  >
                    <span className={`text-3xl ${!herb.available ? 'grayscale' : ''}`}>{herb.type === 'erva' ? '🌿' : '🌰'}</span>
                    <span className="text-[10px] font-display text-foreground">{herb.available ? (herb.type === 'erva' ? 'Erva' : 'Semente') : 'Esgotado'}</span>
                    {!herb.available && herb.cooldownEnd && <CooldownTimer cooldownEnd={herb.cooldownEnd} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== MINA ========== */}
        {location === 'mina' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">⛏️ Minere diamantes. Necessário: Picareta.</p>
            <div className="glass rounded-xl p-2 text-center">
              <p className="text-[10px] text-foreground font-display">
                Picaretas: <span className={`${(state.inventory['Picareta'] || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {state.inventory['Picareta'] || 0}
                </span>
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              {state.mineSlots.map(slot => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => slot.available && onMineGold(slot.id)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl transition-all active:scale-90 ${slot.available ? 'glass gold-glow' : 'glass opacity-50'}`}
                >
                  <span className={`text-3xl ${slot.available ? 'animate-float' : 'grayscale'}`}>{slot.available ? '🪨' : '⏳'}</span>
                  <span className="text-[10px] font-display text-foreground">{slot.available ? 'Minerar' : 'Esgotado'}</span>
                  {!slot.available && slot.cooldownEnd && <CooldownTimer cooldownEnd={slot.cooldownEnd} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== ESTÁBULO ========== */}
        {location === 'estabulo' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Seus cavalos ({state.horses.filter(h => !h.dead).length}/3)</p>
            {state.horses.filter(h => !h.dead).length === 0 && <p className="text-xs text-muted-foreground">Nenhum cavalo vivo.</p>}
            {state.horses.map(h => {
              if (h.dead) {
                return (
                  <div key={h.id} className="glass rounded-xl p-3 flex items-center gap-3 border border-red-500/30">
                    <span className="text-2xl grayscale">💀</span>
                    <div className="flex-1">
                      <p className="font-display text-sm text-red-400">{h.name} (Morto)</p>
                      <p className="text-[10px] text-muted-foreground">Morreu de fome</p>
                    </div>
                    <button onClick={() => onRemoveDeadHorse(h.id)} className="btn-game text-[10px] px-2 py-1 opacity-70">Remover</button>
                  </div>
                );
              }
              const hungerPct = Math.max(0, 1 - (Date.now() - h.lastFedAt) / (30 * 60 * 1000));
              return (
                <div key={h.id} className="glass rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐴</span>
                    <div className="flex-1">
                      <p className={`font-display text-sm ${RARITY_COLORS[h.rarity]}`}>{h.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{h.rarity} • {h.isAdult ? 'Adulto' : 'Potro'} • 🏃 {h.speed}</p>
                    </div>
                    {!h.isAdult && (
                      <button onClick={() => onEvolveHorse(h.id)} className="btn-game text-[10px] px-2 py-1">Evoluir</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">🍖 Fome:</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${hungerPct > 0.3 ? 'bg-green-500' : hungerPct > 0.1 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}
                        style={{ width: `${hungerPct * 100}%` }}
                      />
                    </div>
                    <button onClick={() => onFeedHorse(h.id)} className="btn-game text-[10px] px-2 py-1">Alimentar</button>
                  </div>
                </div>
              );
            })}
            {state.horses.filter(h => !h.dead).length < 3 && (
              <div className="space-y-2">
                <p className="text-xs font-display text-gold">Comprar Potro:</p>
                {(['comum', 'raro', 'épico', 'lendário', 'mítico'] as HorseRarity[]).map(r => {
                  const costs: Record<HorseRarity, number> = { 'comum': 20, 'raro': 50, 'épico': 100, 'lendário': 200, 'mítico': 500 };
                  return (
                    <button key={r} onClick={() => onBuyHorse(r)} className="glass rounded-xl p-3 flex items-center gap-3 w-full text-left active:scale-95 transition-transform">
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

        {/* ========== MERCADO ========== */}
        {location === 'mercado' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">💰 Ouro: {state.gold}</p>
            {MARKET_ITEMS.map((p, i) => (
              <motion.button
                key={p.item}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBuyItem(p.item, p.cost)}
                className="glass rounded-xl p-4 flex items-center gap-3 w-full"
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm text-foreground">{p.item}</p>
                  <p className="text-[9px] text-muted-foreground">Estoque: {state.inventory[p.item] || 0}</p>
                </div>
                <span className="text-xs font-display text-gold">🪙 {p.cost}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* ========== PASTO ========== */}
        {location === 'pasto' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">🐄 Seus animais ({state.pastureAnimals.filter(a => !a.dead).length})</p>
            <p className="text-[9px] text-muted-foreground">Animais precisam de comida a cada 1h. Vacinas desbloqueiam após 10 quests ({state.completedScrollQuests || 0}/10).</p>

            {/* Buy animals */}
            <div className="flex gap-2 justify-center">
              {(['vaca', 'ovelha', 'galinha'] as PastureAnimalType[]).map(type => (
                <button
                  key={type}
                  onClick={() => onBuyAnimal(type)}
                  className="glass rounded-xl px-3 py-2 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                  <span className="text-2xl">{ANIMAL_ICON[type]}</span>
                  <span className="text-[10px] font-display text-foreground">{ANIMAL_NAME[type]}</span>
                  <span className="text-[8px] text-gold">🪙 {PASTURE_ANIMAL_COSTS[type]}</span>
                </button>
              ))}
            </div>

            {/* Existing animals */}
            {state.pastureAnimals.map(a => {
              if (a.dead) {
                return (
                  <div key={a.id} className="glass rounded-xl p-3 flex items-center gap-3 border border-red-500/30">
                    <span className="text-2xl grayscale">💀</span>
                    <div className="flex-1">
                      <p className="font-display text-sm text-red-400">{ANIMAL_NAME[a.type]} (Morto)</p>
                    </div>
                    <button onClick={() => onRemoveDeadAnimal(a.id)} className="btn-game text-[10px] px-2 py-1 opacity-70">Remover</button>
                  </div>
                );
              }
              const hungerPct = Math.max(0, 1 - (Date.now() - a.lastFedAt) / (60 * 60 * 1000));
              return (
                <div key={a.id} className="glass rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ANIMAL_ICON[a.type]}</span>
                    <div className="flex-1">
                      <p className="font-display text-sm text-foreground">{ANIMAL_NAME[a.type]}</p>
                      {a.sickAt && <p className="text-[9px] text-red-400">🤒 Doente!</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onFeedAnimal(a.id)} className="btn-game text-[10px] px-2 py-1">🥬</button>
                      {a.sickAt && (state.completedScrollQuests || 0) >= 10 && (
                        <button onClick={() => onVaccinateAnimal(a.id)} className="btn-game text-[10px] px-2 py-1">💊</button>
                      )}
                      {a.type === 'vaca' && (
                        <button onClick={() => onCollectMilk(a.id)} className="btn-game text-[10px] px-2 py-1">🥛</button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">🍖</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${hungerPct > 0.3 ? 'bg-green-500' : hungerPct > 0.1 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}
                        style={{ width: `${hungerPct * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========== PUB ========== */}
        {location === 'pub' && (
          <div className="space-y-3">
            <div className="text-center py-6">
              <span className="text-4xl">🍺</span>
              <p className="font-display text-sm text-foreground mt-2">Bem-vindo ao Pub!</p>
              <p className="text-xs text-muted-foreground mt-1">Fumaça leve... música ao fundo...</p>
            </div>
            {state.activeScrollQuest && !state.activeScrollQuest.completed && (
              <div className="glass rounded-xl p-3 border border-gold/20">
                <p className="text-xs font-display text-gold">📜 Quest ativa:</p>
                {state.activeScrollQuest.story && (
                  <p className="text-[10px] text-foreground italic mt-1">"{state.activeScrollQuest.story}"</p>
                )}
                <p className="text-[10px] text-foreground mt-1">{state.activeScrollQuest.objective.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  Progresso: {state.activeScrollQuest.progress}/{state.activeScrollQuest.objective.target}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== ARENA ========== */}
        {location === 'arena' && (
          <div className="text-center py-8">
            <span className="text-4xl">⚔️</span>
            <p className="font-display text-sm text-foreground mt-3">Arena</p>
            <p className="text-xs text-muted-foreground mt-1">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
