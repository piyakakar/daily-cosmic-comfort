import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DailyMessage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState('');

  const fetchDailyMessage = async (dob?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-message', {
        body: { dateOfBirth: dob || undefined },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get daily message');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyMessage();
  }, []);

  const handlePersonalize = () => {
    if (dateOfBirth) {
      fetchDailyMessage(dateOfBirth);
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
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              <span className="text-gradient-gold">Daily</span>{' '}
              <span className="text-foreground">Message</span>
            </h1>
          </div>
          <p className="font-body text-muted-foreground text-lg">
            Your one-line cosmic guidance for today
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl cosmic-card p-8 md:p-12 text-center"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <p className="font-display text-2xl md:text-3xl text-foreground leading-relaxed">
                "{message}"
              </p>
              
              <div className="pt-6 border-t border-border/30 space-y-4">
                <p className="font-body text-sm text-muted-foreground">
                  Personalize with your birth date
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="cosmic-input w-full sm:w-auto"
                  />
                  <button
                    onClick={handlePersonalize}
                    disabled={!dateOfBirth}
                    className="cosmic-button flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Get Personalized
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => fetchDailyMessage(dateOfBirth || undefined)}
            className="font-body text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Get a new message
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyMessage;
