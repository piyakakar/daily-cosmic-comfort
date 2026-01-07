import { motion } from 'framer-motion';
import { Sparkles, Heart, Zap } from 'lucide-react';

interface InsightDisplayProps {
  insight: {
    moodInsight: string;
    advice: string;
    todaysAction: string;
  };
}

export const InsightDisplay = ({ insight }: InsightDisplayProps) => {
  const sections = [
    {
      icon: Sparkles,
      title: 'Your Mood Insight',
      content: insight.moodInsight,
      delay: 0,
    },
    {
      icon: Heart,
      title: 'Gentle Advice',
      content: insight.advice,
      delay: 0.2,
    },
    {
      icon: Zap,
      title: "Today's Action",
      content: insight.todaysAction,
      delay: 0.4,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {sections.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: section.delay, duration: 0.5 }}
          className="cosmic-card p-6 cosmic-glow"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <section.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-primary mb-2">
                {section.title}
              </h3>
              <p className="font-body text-foreground/90 leading-relaxed">
                {section.content}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
