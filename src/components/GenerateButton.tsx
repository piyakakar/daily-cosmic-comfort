import { motion } from 'framer-motion';
import { Loader2, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const GenerateButton = ({ isLoading, disabled, onClick }: GenerateButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex justify-center"
    >
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="cosmic-button text-lg"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Reading the Stars...
          </>
        ) : (
          <>
            <Moon className="w-5 h-5 mr-2" />
            Reveal My Insight
          </>
        )}
      </Button>
    </motion.div>
  );
};
