import { ArrowLeft, ArrowRight, Volume2, VolumeX, Plus, Minus, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavigationProps {
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  volume: number;
  onVolumeIncrease: () => void;
  onVolumeDecrease: () => void;
}

const routes = ['/', '/dashboard', '/naam-numerology', '/birthday-report', '/daily-flags', '/love-energy', '/daily-message', '/career-astrology', '/affirmations', '/premium'];

export const Navigation = ({ 
  isMusicPlaying, 
  onToggleMusic, 
  volume, 
  onVolumeIncrease, 
  onVolumeDecrease 
}: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const currentIndex = routes.indexOf(location.pathname);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < routes.length - 1 && currentIndex !== -1;

  const goToPrev = () => {
    if (hasPrev) {
      navigate(routes[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      navigate(routes[currentIndex + 1]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/40 backdrop-blur-md border border-border/30 hover:border-primary/30 hover:bg-background/60 transition-all"
            aria-label="Go home"
          >
            <Home className="w-4 h-4 text-primary" />
          </button>
        )}
        
        {hasPrev && (
          <button
            onClick={goToPrev}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/40 backdrop-blur-md border border-border/30 hover:border-primary/30 hover:bg-background/60 transition-all"
            aria-label="Previous page"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
          </button>
        )}
        
        {hasNext && (
          <button
            onClick={goToNext}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/40 backdrop-blur-md border border-border/30 hover:border-primary/30 hover:bg-background/60 transition-all"
            aria-label="Next page"
          >
            <ArrowRight className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>
      
      {/* Music controls removed */}
    </motion.div>
  );
};
