import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavigationProps {
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const Navigation = ({ isMusicPlaying, onToggleMusic }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center"
    >
      <div>
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/40 backdrop-blur-md border border-border/30 hover:border-primary/30 hover:bg-background/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span className="font-body text-sm text-muted-foreground">Back</span>
          </button>
        )}
      </div>
      
      <button
        onClick={onToggleMusic}
        className="p-3 rounded-full bg-background/40 backdrop-blur-md border border-border/30 hover:border-primary/30 hover:bg-background/60 transition-all"
        aria-label={isMusicPlaying ? 'Mute music' : 'Play music'}
      >
        {isMusicPlaying ? (
          <Volume2 className="w-5 h-5 text-primary" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
    </motion.div>
  );
};
