import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cake, Sparkles, TrendingUp, Heart, AlertTriangle, Gift, CheckCircle2 } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { DateInput } from '@/components/DateInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getZodiacSign, calculateLifePathNumber } from '@/lib/numerology';

interface BirthdayInsight {
  yearTheme: string;
  careerFocus: string;
  loveFocus: string;
  luckyMonths: string[];
  warning: string;
  blessing: string;
  tips: string[];
}

const BirthdayReport = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    zodiacSign: string;
    lifePathNumber: number;
    personalYear: number;
    insight: BirthdayInsight;
  } | null>(null);

  const calculatePersonalYear = (dob: string): number => {
    const date = new Date(dob);
    const currentYear = new Date().getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let sum = month + day + currentYear;
    while (sum > 9 && sum !== 11 && sum !== 22) {
      sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    return sum;
  };

  const generateReport = async () => {
    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    setIsLoading(true);

    try {
      const zodiacSign = getZodiacSign(dateOfBirth);
      const lifePathNumber = calculateLifePathNumber(dateOfBirth);
      const personalYear = calculatePersonalYear(dateOfBirth);

      const { data, error } = await supabase.functions.invoke('birthday-report', {
        body: { dateOfBirth, zodiacSign, lifePathNumber, personalYear },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult({
        zodiacSign,
        lifePathNumber,
        personalYear,
        insight: data.insight,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
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
            <span className="text-gradient-gold">Birthday</span>{' '}
            <span className="text-foreground">Energy Report</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Your personalized yearly cosmic forecast
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
                <Cake className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="font-body text-muted-foreground text-sm">
                  Enter your birth date to unlock your yearly energy report
                </p>
              </div>

              <DateInput dateOfBirth={dateOfBirth} onDateChange={setDateOfBirth} />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateReport}
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
                    Generating Report...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    Generate My Report
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
              <div className="text-center border-b border-border/30 pb-6">
                <p className="font-display text-3xl text-primary mb-1">{result.zodiacSign}</p>
                <p className="font-body text-muted-foreground text-sm">
                  Life Path {result.lifePathNumber} • Personal Year {result.personalYear}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
                <h3 className="font-display text-lg text-primary mb-2">
                  ✨ Your Year Theme
                </h3>
                <p className="font-body text-foreground leading-relaxed">
                  {result.insight.yearTheme}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h4 className="font-display text-primary mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Career Focus
                  </h4>
                  <p className="font-body text-foreground/90 text-sm leading-relaxed">
                    {result.insight.careerFocus}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h4 className="font-display text-primary mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Love Focus
                  </h4>
                  <p className="font-body text-foreground/90 text-sm leading-relaxed">
                    {result.insight.loveFocus}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-display text-primary mb-2">🌟 Lucky Months</h4>
                <div className="flex flex-wrap gap-2">
                  {result.insight.luckyMonths.map((month) => (
                    <span key={month} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-body">
                      {month}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <h4 className="font-display text-amber-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> One Warning
                  </h4>
                  <p className="font-body text-foreground/90 text-sm leading-relaxed">
                    {result.insight.warning}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-display text-emerald-400 mb-2 flex items-center gap-2">
                    <Gift className="w-4 h-4" /> One Blessing
                  </h4>
                  <p className="font-body text-foreground/90 text-sm leading-relaxed">
                    {result.insight.blessing}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <h3 className="font-display text-primary mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Real-Life Tips for This Year
                </h3>
                <ul className="space-y-2">
                  {result.insight.tips.map((tip, i) => (
                    <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setResult(null)}
                className="font-body text-muted-foreground hover:text-primary transition-colors mx-auto block"
              >
                Generate another report
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BirthdayReport;
