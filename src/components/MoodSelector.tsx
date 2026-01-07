import { motion } from 'framer-motion';

const moods = [
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'peaceful', label: 'Peaceful', emoji: '😌' },
  { id: 'confused', label: 'Confused', emoji: '🤔' },
  { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'excited', label: 'Excited', emoji: '🌟' },
  { id: 'melancholy', label: 'Melancholy', emoji: '🌙' },
  { id: 'grateful', label: 'Grateful', emoji: '💫' },
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

export const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-center text-muted-foreground">
        How are you feeling today?
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onSelectMood(mood.id)}
            className={`mood-chip ${
              selectedMood === mood.id
                ? 'mood-chip-selected'
                : 'mood-chip-unselected'
            }`}
          >
            <span className="mr-2">{mood.emoji}</span>
            <span className="font-body text-sm">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
