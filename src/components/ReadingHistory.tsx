import { motion } from 'framer-motion';
import { Clock, Sparkles, X } from 'lucide-react';
import { Reading } from '@/hooks/useReadingHistory';
import { format } from 'date-fns';

interface ReadingHistoryProps {
  readings: Reading[];
  onSelectReading: (reading: Reading) => void;
  onClose: () => void;
  onClear: () => void;
}

export const ReadingHistory = ({ readings, onSelectReading, onClose, onClear }: ReadingHistoryProps) => {
  if (readings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Sparkles className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <p className="font-body text-muted-foreground">No readings yet</p>
        <p className="font-body text-muted-foreground/60 text-sm mt-1">
          Your cosmic insights will appear here
        </p>
        <button
          onClick={onClose}
          className="mt-6 font-body text-primary hover:text-primary/80 transition-colors"
        >
          Get your first reading
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-display text-xl text-foreground">Past Readings</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {readings.map((reading, index) => (
          <motion.button
            key={reading.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectReading(reading)}
            className="w-full text-left p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-primary group-hover:text-primary/80 transition-colors">
                  {reading.zodiacSign}
                </p>
                <p className="font-body text-sm text-muted-foreground mt-0.5">
                  Feeling {reading.mood.toLowerCase()} • Life Path {reading.lifePathNumber}
                </p>
              </div>
              <span className="font-body text-xs text-muted-foreground/60">
                {format(new Date(reading.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className="font-body text-sm text-foreground/80 mt-2 line-clamp-2">
              {reading.insight.moodInsight}
            </p>
          </motion.button>
        ))}
      </div>

      {readings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 border-t border-border/30"
        >
          <button
            onClick={onClear}
            className="font-body text-sm text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            Clear all history
          </button>
        </motion.div>
      )}
    </div>
  );
};
