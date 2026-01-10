import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RefreshCw, Sparkles, Copy, Check, Share2 } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AffirmationData {
  affirmations: string[];
  theme: string;
  actionTip: string;
}

const Affirmations = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AffirmationData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const generateAffirmations = async () => {
    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    setIsLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('affirmations', {
        body: { dateOfBirth, name: name || undefined },
      });

      if (error) throw error;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setData(result);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate affirmations');
    } finally {
      setIsLoading(false);
    }
  };

  const nextAffirmation = () => {
    if (data) {
      setCurrentIndex((prev) => (prev + 1) % data.affirmations.length);
    }
  };

  const copyAffirmation = () => {
    if (data) {
      navigator.clipboard.writeText(data.affirmations[currentIndex]);
      setCopied(true);
      toast.success('Affirmation copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-400" />
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              <span className="text-gradient-gold">Personal</span>{' '}
              <span className="text-foreground">Affirmations</span>
            </h1>
          </div>
          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Cosmic affirmations based on your chart
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl cosmic-card p-8 md:p-12 space-y-8"
        >
          {!data ? (
            <>
              <div className="space-y-4">
                <label className="block font-display text-lg text-foreground">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="cosmic-input w-full"
                />
              </div>

              <div className="space-y-4">
                <label className="block font-display text-lg text-foreground">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="cosmic-input w-full"
                />
              </div>

              <button
                onClick={generateAffirmations}
                disabled={!dateOfBirth || isLoading}
                className="cosmic-button w-full flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate My Affirmations
                  </>
                )}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Theme */}
              <div className="text-center">
                <span className="px-4 py-2 rounded-full bg-primary/20 text-primary font-body text-sm">
                  Today's Theme: {data.theme}
                </span>
              </div>

              {/* Affirmation Card */}
              <div className="relative min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
                  >
                    <p className="font-display text-2xl md:text-3xl text-foreground leading-relaxed">
                      "{data.affirmations[currentIndex]}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={copyAffirmation}
                  className="p-3 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/30 transition-all"
                  aria-label="Copy affirmation"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                <button
                  onClick={nextAffirmation}
                  className="cosmic-button flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Next Affirmation
                </button>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2">
                {data.affirmations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Action Tip */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30 text-center">
                <p className="font-body text-sm text-muted-foreground">
                  💫 <span className="text-foreground font-medium">Action:</span> {data.actionTip}
                </p>
              </div>

              <button
                onClick={() => setData(null)}
                className="font-body text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline w-full text-center"
              >
                Generate new affirmations
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Affirmations;
