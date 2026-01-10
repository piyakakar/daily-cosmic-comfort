import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Type, Cake, Flag, Heart, Sparkles, Briefcase, Crown, MessageCircle, LayoutDashboard } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { MoodSelector } from '@/components/MoodSelector';
import { DateInput } from '@/components/DateInput';
import { GenerateButton } from '@/components/GenerateButton';
import { InsightDisplay } from '@/components/InsightDisplay';
import { ReadingHistory } from '@/components/ReadingHistory';
import { FeatureCard } from '@/components/FeatureCard';
import { useReadingHistory, Reading } from '@/hooks/useReadingHistory';
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
  const [showHistory, setShowHistory] = useState(false);
  
  const { readings, saveReading, clearHistory } = useReadingHistory();

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
      
      // Save to history
      saveReading({
        mood: selectedMood,
        dateOfBirth,
        zodiacSign: data.zodiacSign,
        lifePathNumber: data.lifePathNumber,
        insight: data.insight,
      });
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

  const handleSelectReading = (reading: Reading) => {
    setInsight(reading.insight);
    setZodiacInfo({ zodiacSign: reading.zodiacSign, lifePathNumber: reading.lifePathNumber });
    setSelectedMood(reading.mood);
    setDateOfBirth(reading.dateOfBirth);
    setShowHistory(false);
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
          <div className="flex items-center justify-center gap-4">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold">
              <span className="text-gradient-gold">Cosmic</span>{' '}
              <span className="text-foreground">Insights</span>
            </h1>
          </div>
          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Discover what the stars and numbers reveal about your day
          </p>
          {readings.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowHistory(!showHistory)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-primary/30 transition-all"
            >
              <History className="w-4 h-4 text-primary" />
              <span className="font-body text-sm text-muted-foreground">
                {readings.length} past reading{readings.length !== 1 ? 's' : ''}
              </span>
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl cosmic-card p-8 md:p-12 space-y-8"
        >
          {showHistory ? (
            <ReadingHistory
              readings={readings}
              onSelectReading={handleSelectReading}
              onClose={() => setShowHistory(false)}
              onClear={clearHistory}
            />
          ) : !insight ? (
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

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <FeatureCard
            title="Dashboard"
            description="Your cosmic overview"
            icon={LayoutDashboard}
            route="/dashboard"
            gradient="bg-gradient-to-br from-violet-500/10 to-indigo-500/10"
            delay={0.42}
          />
          <FeatureCard
            title="Daily Message"
            description="One-line cosmic guidance"
            icon={MessageCircle}
            route="/daily-message"
            gradient="bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
            delay={0.45}
          />
          <FeatureCard
            title="Naam Numerology"
            description="Name & birth numbers"
            icon={Type}
            route="/naam-numerology"
            gradient="bg-gradient-to-br from-violet-500/10 to-purple-500/10"
            delay={0.5}
          />
          <FeatureCard
            title="Birthday Report"
            description="Yearly energy forecast"
            icon={Cake}
            route="/birthday-report"
            gradient="bg-gradient-to-br from-amber-500/10 to-orange-500/10"
            delay={0.55}
          />
          <FeatureCard
            title="Daily Flags"
            description="What to embrace & avoid"
            icon={Flag}
            route="/daily-flags"
            gradient="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
            delay={0.6}
          />
          <FeatureCard
            title="Love Energy"
            description="Romantic compatibility"
            icon={Heart}
            route="/love-energy"
            gradient="bg-gradient-to-br from-pink-500/10 to-rose-500/10"
            delay={0.65}
          />
          <FeatureCard
            title="Career & Study"
            description="Best days for success"
            icon={Briefcase}
            route="/career-astrology"
            gradient="bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
            delay={0.7}
          />
          <FeatureCard
            title="Affirmations"
            description="Personal cosmic mantras"
            icon={Sparkles}
            route="/affirmations"
            gradient="bg-gradient-to-br from-yellow-500/10 to-amber-500/10"
            delay={0.75}
          />
          <FeatureCard
            title="Premium"
            description="Unlock full cosmic power"
            icon={Crown}
            route="/premium"
            gradient="bg-gradient-to-br from-primary/20 to-accent/20"
            delay={0.8}
          />
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
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
