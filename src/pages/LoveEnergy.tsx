import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { DateInput } from '@/components/DateInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getZodiacSign, calculateLifePathNumber } from '@/lib/numerology';

interface LoveInsight {
  energyLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  energyDescription: string;
  bestTimeToConnect: string;
  singleAdvice: string;
  coupleAdvice: string;
  crushEnergy: string;
  greenFlagTraits: string[];
  redFlagTraits: string[];
  tips: string[];
}

const LoveEnergy = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [partnerDob, setPartnerDob] = useState('');
  const [mode, setMode] = useState<'solo' | 'compatibility'>('solo');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    zodiacSign: string;
    partnerZodiac?: string;
    insight: LoveInsight;
    compatibilityScore?: number;
  } | null>(null);

  const generateInsight = async () => {
    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    if (mode === 'compatibility' && !partnerDob) {
      toast.error('Please enter your partner\'s date of birth');
      return;
    }

    setIsLoading(true);

    try {
      const zodiacSign = getZodiacSign(dateOfBirth);
      const lifePathNumber = calculateLifePathNumber(dateOfBirth);
      
      const body: Record<string, unknown> = { 
        dateOfBirth, 
        zodiacSign, 
        lifePathNumber,
        mode,
      };

      if (mode === 'compatibility' && partnerDob) {
        body.partnerDob = partnerDob;
        body.partnerZodiac = getZodiacSign(partnerDob);
        body.partnerLifePath = calculateLifePathNumber(partnerDob);
      }

      const { data, error } = await supabase.functions.invoke('love-energy', {
        body,
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult({
        zodiacSign,
        partnerZodiac: mode === 'compatibility' ? getZodiacSign(partnerDob) : undefined,
        insight: data.insight,
        compatibilityScore: data.compatibilityScore,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate insight. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-blue-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Very High': return 'text-red-400';
      default: return 'text-primary';
    }
  };

  const getEnergyWidth = (level: string) => {
    switch (level) {
      case 'Low': return '25%';
      case 'Medium': return '50%';
      case 'High': return '75%';
      case 'Very High': return '100%';
      default: return '50%';
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
            <span className="text-gradient-gold">Love</span>{' '}
            <span className="text-foreground">Energy Meter</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Check your romantic energy and compatibility
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
              <div className="flex justify-center gap-2 p-1 bg-muted/30 rounded-xl">
                <button
                  onClick={() => setMode('solo')}
                  className={`flex-1 py-2 px-4 rounded-lg font-body text-sm transition-all ${
                    mode === 'solo' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  My Love Energy
                </button>
                <button
                  onClick={() => setMode('compatibility')}
                  className={`flex-1 py-2 px-4 rounded-lg font-body text-sm transition-all ${
                    mode === 'compatibility' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Compatibility
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-display text-sm text-primary mb-2 block">Your Date of Birth</label>
                  <DateInput dateOfBirth={dateOfBirth} onDateChange={setDateOfBirth} />
                </div>

                {mode === 'compatibility' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="font-display text-sm text-primary mb-2 block">Partner's Date of Birth</label>
                    <DateInput dateOfBirth={partnerDob} onDateChange={setPartnerDob} />
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateInsight}
                disabled={isLoading || !dateOfBirth || (mode === 'compatibility' && !partnerDob)}
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
                    Reading love energy...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5" />
                    {mode === 'solo' ? 'Check My Energy' : 'Check Compatibility'}
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
                {result.compatibilityScore !== undefined ? (
                  <>
                    <p className="font-display text-2xl text-primary">
                      {result.zodiacSign} 💕 {result.partnerZodiac}
                    </p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="font-display text-5xl text-primary mt-2"
                    >
                      {result.compatibilityScore}%
                    </motion.p>
                    <p className="font-body text-muted-foreground text-sm">Compatibility Score</p>
                  </>
                ) : (
                  <p className="font-display text-2xl text-primary">{result.zodiacSign}</p>
                )}
              </div>

              <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-primary flex items-center gap-2">
                    <Flame className="w-5 h-5" /> Romantic Energy
                  </h3>
                  <span className={`font-display text-lg ${getEnergyColor(result.insight.energyLevel)}`}>
                    {result.insight.energyLevel}
                  </span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: getEnergyWidth(result.insight.energyLevel) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                  />
                </div>
                <p className="font-body text-foreground/90 text-sm">
                  {result.insight.energyDescription}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <h4 className="font-display text-primary mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Best Time to Connect
                </h4>
                <p className="font-body text-foreground">
                  {result.insight.bestTimeToConnect}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h4 className="font-display text-sm text-primary mb-2">If You're Single</h4>
                  <p className="font-body text-foreground/90 text-sm">
                    {result.insight.singleAdvice}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h4 className="font-display text-sm text-primary mb-2">If You're In a Relationship</h4>
                  <p className="font-body text-foreground/90 text-sm">
                    {result.insight.coupleAdvice}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                <h4 className="font-display text-pink-400 mb-2">💘 Crush Energy Check</h4>
                <p className="font-body text-foreground/90 text-sm">
                  {result.insight.crushEnergy}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-display text-emerald-400 mb-2">🟢 Green Flag Traits</h4>
                  <ul className="space-y-1">
                    {result.insight.greenFlagTraits.map((trait, i) => (
                      <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {trait}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <h4 className="font-display text-red-400 mb-2">🔴 Red Flag Traits</h4>
                  <ul className="space-y-1">
                    {result.insight.redFlagTraits.map((trait, i) => (
                      <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                        <span className="text-red-400">✗</span> {trait}
                      </li>
                    ))}
                  </ul>
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

              <button
                onClick={() => setResult(null)}
                className="font-body text-muted-foreground hover:text-primary transition-colors mx-auto block"
              >
                Check again
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoveEnergy;
