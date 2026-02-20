import { motion } from 'framer-motion';

interface Props {
  influence: number;
  max: number;
}

export default function InfluenceBar({ influence, max }: Props) {
  const pct = Math.min((influence / max) * 100, 100);
  return (
    <div className="absolute top-[52px] left-0 right-0 z-20 px-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-display text-gold">⭐ Influência</span>
        <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-glow"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">{influence}/{max}</span>
      </div>
    </div>
  );
}
