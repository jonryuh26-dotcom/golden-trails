import { motion } from 'framer-motion';
import type { LocationId } from '@/hooks/useGameState';

const QUEST_DATA: { location: LocationId; title: string; desc: string }[] = [
  { location: 'pub', title: 'Conversa no Pub', desc: 'Fale com o barman sobre rumores da cidade.' },
  { location: 'mercado', title: 'Entregas do Mercado', desc: 'Ajude o comerciante com entregas.' },
  { location: 'arena', title: 'Torneio da Arena', desc: 'Participe do próximo torneio de duelos.' },
];

interface Props {
  activeQuests: LocationId[];
}

export default function QuestsPanel({ activeQuests }: Props) {
  const quests = QUEST_DATA.filter(q => activeQuests.includes(q.location));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 bg-background/95 flex flex-col"
    >
      <div className="glass px-4 py-3">
        <h2 className="font-display text-base gold-text">📜 Quests</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
        {quests.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">Nenhuma quest ativa.</p>}
        {quests.map(q => (
          <div key={q.location} className="glass rounded-xl p-4 border border-gold/20 animate-pulse-gold">
            <p className="font-display text-sm text-gold">❗ {q.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{q.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
