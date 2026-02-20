import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CollectionProgress } from '@/hooks/useGameState';

const LABELS: Record<string, string> = {
  tree: '🪵 Coletando madeira...',
  herb: '🌿 Coletando erva...',
  mine: '⛏️ Minerando...',
};

interface Props {
  collection: CollectionProgress | null;
}

export default function CollectionBar({ collection }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!collection) { setProgress(0); return; }
    const interval = setInterval(() => {
      const elapsed = Date.now() - collection.startedAt;
      setProgress(Math.min(1, elapsed / collection.duration));
    }, 50);
    return () => clearInterval(interval);
  }, [collection]);

  return (
    <AnimatePresence>
      {collection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-[65px] left-4 right-4 z-30 glass rounded-xl px-4 py-3 space-y-1"
        >
          <p className="text-xs font-display text-foreground">{LABELS[collection.type]}</p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-right">
            {Math.ceil(Math.max(0, (collection.duration - (Date.now() - collection.startedAt)) / 1000))}s
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
