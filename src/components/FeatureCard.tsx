import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient: string;
  delay?: number;
}

export const FeatureCard = ({ title, description, icon: Icon, route, gradient, delay = 0 }: FeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(route)}
      className={`w-full p-6 rounded-2xl text-left border border-border/30 hover:border-primary/40 transition-all group ${gradient}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-background/40 backdrop-blur-sm border border-border/30 group-hover:border-primary/30 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
};
