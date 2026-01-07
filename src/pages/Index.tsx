import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarField } from '@/components/StarField';
import { MoodSelector } from '@/components/MoodSelector';
import { DateInput } from '@/components/DateInput';
import { GenerateButton } from '@/components/GenerateButton';
import { InsightDisplay } from '@/components/InsightDisplay';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Insight {
  moodInsight: string;
  advice: string;
  todaysAction: string;
}

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [zodiacInfo, setZodiacInfo] = useState<{ zodiacSign: string; lifePathNumber: number } | null>(null);

  const generateInsight = async () => {
    if (!selectedMood || !dateOfBirth) {
      toast.error('Please select your mood and enter your date of birth');
      return;
    }

    setIsLoading(true);
    setInsight(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-insight', {
        body: { mood: selectedMood, dateOfBirth },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInsight(data.insight);
      setZodiacInfo({ zodiacSign: data.zodiacSign, lifePathNumber: data.lifePathNumber });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate insight. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInsight(null);
    setSelectedMood(null);
    setZodiacInfo(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold mb-4">
            <span className="text-gradient-gold">Cosmic</span>{' '}
            <span className="text-foreground">Insights</span>
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Discover what the stars and numbers reveal about your day
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl cosmic-card p-8 md:p-12 space-y-8"
        >
          {!insight ? (
            <>
              <MoodSelector
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
              />

              <DateInput
                dateOfBirth={dateOfBirth}
                onDateChange={setDateOfBirth}
              />

              <GenerateButton
                isLoading={isLoading}
                disabled={!selectedMood || !dateOfBirth}
                onClick={generateInsight}
              />
            </>
          ) : (
            <>
              {zodiacInfo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-6"
                >
                  <p className="font-display text-2xl text-primary mb-1">
                    {zodiacInfo.zodiacSign}
                  </p>
                  <p className="font-body text-muted-foreground text-sm">
                    Life Path Number {zodiacInfo.lifePathNumber}
                  </p>
                </motion.div>
              )}

              <InsightDisplay insight={insight} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={handleReset}
                  className="font-body text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Get another reading
                </button>
              </motion.div>
            </>
          )}
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="font-body text-muted-foreground/60 text-sm">
            ✨ Remember: The stars guide, but you choose your path ✨
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
