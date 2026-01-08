import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Sparkles, CheckCircle2, XCircle, Share2, RefreshCw } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { DateInput } from '@/components/DateInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getZodiacSign, calculateLifePathNumber } from '@/lib/numerology';

interface DailyFlags {
  greenFlag: string;
  greenFlagAction: string;
  redFlag: string;
  redFlagAction: string;
  dailyMantra: string;
  tips: string[];
}

const DailyFlags = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    zodiacSign: string;
    flags: DailyFlags;
  } | null>(null);

  // Check for saved DOB
  useEffect(() => {
    const savedDob = localStorage.getItem('cosmic_dob');
    if (savedDob) {
      setDateOfBirth(savedDob);
    }
  }, []);

  const generateFlags = async () => {
    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    localStorage.setItem('cosmic_dob', dateOfBirth);
    setIsLoading(true);

    try {
      const zodiacSign = getZodiacSign(dateOfBirth);
      const lifePathNumber = calculateLifePathNumber(dateOfBirth);

      const { data, error } = await supabase.functions.invoke('daily-flags', {
        body: { dateOfBirth, zodiacSign, lifePathNumber },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult({
        zodiacSign,
        flags: data.flags,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate flags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const shareFlags = () => {
    if (!result) return;
    const text = `🟢 Today's Green Flag: ${result.flags.greenFlag}\n🔴 Today's Red Flag: ${result.flags.redFlag}\n✨ ${result.flags.dailyMantra}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-12">
      <StarField />
      
      <div className="relative z-10 flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
            <span className="text-gradient-gold">Daily</span>{' '}
            <span className="text-foreground">Green & Red Flags</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Quick daily guidance on what to embrace and avoid
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl cosmic-card p-8 space-y-6"
        >
          {!result ? (
            <>
              <div className="text-center mb-4">
                <div className="flex justify-center gap-4 mb-4">
                  <Flag className="w-8 h-8 text-emerald-400" />
                  <Flag className="w-8 h-8 text-red-400" />
                </div>
                <p className="font-body text-muted-foreground text-sm">
                  Get your personalized daily do's and don'ts
                </p>
              </div>

              <DateInput dateOfBirth={dateOfBirth} onDateChange={setDateOfBirth} />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateFlags}
                disabled={isLoading || !dateOfBirth}
                className="cosmic-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.span>
                    Reading the stars...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Flag className="w-5 h-5" />
                    Show My Flags
                  </span>
                )}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center border-b border-border/30 pb-4">
                <p className="font-display text-2xl text-primary">{result.zodiacSign}</p>
                <p className="font-body text-muted-foreground text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <h3 className="font-display text-lg text-emerald-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Green Flag
                </h3>
                <p className="font-body text-foreground text-lg mb-2">
                  {result.flags.greenFlag}
                </p>
                <p className="font-body text-muted-foreground text-sm">
                  💡 {result.flags.greenFlagAction}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <h3 className="font-display text-lg text-red-400 mb-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Red Flag
                </h3>
                <p className="font-body text-foreground text-lg mb-2">
                  {result.flags.redFlag}
                </p>
                <p className="font-body text-muted-foreground text-sm">
                  ⚠️ {result.flags.redFlagAction}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center"
              >
                <p className="font-display text-primary text-sm uppercase tracking-wider mb-1">Today's Mantra</p>
                <p className="font-body text-foreground italic">
                  "{result.flags.dailyMantra}"
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl bg-muted/20 border border-border/30"
              >
                <h3 className="font-display text-primary mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Real-Life Tips
                </h3>
                <ul className="space-y-2">
                  {result.flags.tips.map((tip, i) => (
                    <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={shareFlags}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-primary/30 transition-all font-body text-sm text-muted-foreground hover:text-primary"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-primary/30 transition-all font-body text-sm text-muted-foreground hover:text-primary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DailyFlags;
