import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Calendar, Palette, Star, CheckCircle2 } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { DateInput } from '@/components/DateInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateNaamAnk, calculateMulank, getLuckyColors, getLuckyDays, getCompatibleNumbers } from '@/lib/numerology';

interface NaamInsight {
  overview: string;
  harmony: string;
  strengths: string[];
  challenges: string;
  tips: string[];
}

const NaamNumerology = () => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    naamAnk: number;
    mulank: number;
    insight: NaamInsight;
  } | null>(null);

  const generateInsight = async () => {
    if (!name.trim() || !dateOfBirth) {
      toast.error('Please enter your name and date of birth');
      return;
    }

    setIsLoading(true);

    try {
      const naamAnk = calculateNaamAnk(name);
      const mulank = calculateMulank(dateOfBirth);

      const { data, error } = await supabase.functions.invoke('naam-numerology', {
        body: { name, dateOfBirth, naamAnk, mulank },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult({
        naamAnk,
        mulank,
        insight: data.insight,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate insight. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const naamAnk = name ? calculateNaamAnk(name) : 0;
  const mulank = dateOfBirth ? calculateMulank(dateOfBirth) : 0;

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
            <span className="text-gradient-gold">Naam</span>{' '}
            <span className="text-foreground">Numerology</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Discover how your name and birth numbers work together
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
              <div className="space-y-2">
                <label className="font-display text-sm text-primary flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/30 focus:border-primary/50 focus:outline-none font-body text-foreground placeholder:text-muted-foreground/50 transition-colors"
                />
                {name && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    Naam Ank: <span className="text-primary font-semibold">{naamAnk}</span>
                  </motion.p>
                )}
              </div>

              <DateInput dateOfBirth={dateOfBirth} onDateChange={setDateOfBirth} />
              
              {dateOfBirth && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground -mt-4"
                >
                  Mulank (Birth Number): <span className="text-primary font-semibold">{mulank}</span>
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateInsight}
                disabled={isLoading || !name.trim() || !dateOfBirth}
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
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Reveal My Numbers
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
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Naam Ank</p>
                  <p className="font-display text-4xl text-primary">{result.naamAnk}</p>
                </div>
                <div className="text-center">
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Mulank</p>
                  <p className="font-display text-4xl text-primary">{result.mulank}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h3 className="font-display text-primary mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Overview
                  </h3>
                  <p className="font-body text-foreground/90 text-sm leading-relaxed">
                    {result.insight.overview}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h3 className="font-display text-primary mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Harmony Between Numbers
                  </h3>
                  <p className="font-body text-foreground/90 text-sm leading-relaxed">
                    {result.insight.harmony}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                    <h4 className="font-display text-sm text-primary mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Lucky Colors
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {getLuckyColors(result.mulank).map((color) => (
                        <span key={color} className="text-xs font-body text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                    <h4 className="font-display text-sm text-primary mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Lucky Days
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {getLuckyDays(result.mulank).map((day) => (
                        <span key={day} className="text-xs font-body text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                    <h4 className="font-display text-sm text-primary mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Compatible #s
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {getCompatibleNumbers(result.mulank).map((num) => (
                        <span key={num} className="text-xs font-body text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="font-display text-primary mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Real-Life Tips
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
              </div>

              <button
                onClick={() => setResult(null)}
                className="font-body text-muted-foreground hover:text-primary transition-colors mx-auto block"
              >
                Try another name
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NaamNumerology;
