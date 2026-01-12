import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Moon, Sun, Sparkles, AlertCircle, Info, Clock, BookOpen } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getZodiacSign } from '@/lib/numerology';

interface DayExplanation {
  date: string;
  lunarPhase: {
    name: string;
    illumination: number;
    description: string;
  };
  planetaryPositions: {
    planet: string;
    sign: string;
    influence: string;
  }[];
  celestialEvents: {
    event: string;
    significance: string;
  }[];
  moodCorrelation: string;
  activitySuggestions: string[];
  reflectionPrompts: string[];
  confidenceLevel: string;
  limitations: string;
  dataSource: string;
}

const ExplainMyDay = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userMood, setUserMood] = useState('');
  const [userActivities, setUserActivities] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DayExplanation | null>(null);

  const moods = ['Energetic', 'Calm', 'Anxious', 'Inspired', 'Tired', 'Emotional', 'Focused', 'Scattered'];

  const explainDay = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setIsLoading(true);

    try {
      const userZodiac = getZodiacSign(selectedDate);

      const { data, error } = await supabase.functions.invoke('explain-my-day', {
        body: {
          date: selectedDate,
          userMood: userMood || null,
          userActivities: userActivities || null,
          userZodiac,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data.explanation);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to explain day. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMoonPhaseIcon = (phase: string) => {
    const icons: Record<string, string> = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘',
    };
    return icons[phase] || '🌙';
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
            <span className="text-gradient-gold">Explain</span>{' '}
            <span className="text-foreground">My Day</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Understand your experiences through verified celestial data
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
              {/* Important Notice */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display text-blue-400 text-sm mb-1">Factual Astrology</h4>
                    <p className="font-body text-foreground/80 text-xs">
                      This feature uses verified astronomical data only. We explain past experiences 
                      through celestial correlations—no predictions or absolute claims.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-display text-sm text-primary mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="cosmic-input w-full"
                  />
                </div>

                <div>
                  <label className="font-display text-sm text-primary mb-2 block">
                    How did you feel? (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setUserMood(userMood === mood ? '' : mood)}
                        className={`px-3 py-1.5 rounded-full text-sm font-body transition-all ${
                          userMood === mood
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-display text-sm text-primary mb-2 block">
                    What happened? (optional)
                  </label>
                  <textarea
                    value={userActivities}
                    onChange={(e) => setUserActivities(e.target.value)}
                    placeholder="Describe your day, activities, or notable events..."
                    className="cosmic-input w-full h-24 resize-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={explainDay}
                disabled={isLoading || !selectedDate}
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
                    Analyzing celestial data...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Explain This Day
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
                <p className="font-display text-2xl text-primary">
                  {new Date(result.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Lunar Phase */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-700/10 border border-slate-500/30">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl">{getMoonPhaseIcon(result.lunarPhase.name)}</span>
                  <div>
                    <h3 className="font-display text-lg text-foreground">{result.lunarPhase.name}</h3>
                    <p className="font-body text-muted-foreground text-sm">
                      {result.lunarPhase.illumination}% illumination
                    </p>
                  </div>
                </div>
                <p className="font-body text-foreground/90 text-sm">
                  {result.lunarPhase.description}
                </p>
              </div>

              {/* Planetary Positions */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-display text-primary mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Planetary Positions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {result.planetaryPositions.map((planet, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-display text-sm text-foreground">{planet.planet}</span>
                        <span className="font-body text-xs text-primary">{planet.sign}</span>
                      </div>
                      <p className="font-body text-muted-foreground text-xs">{planet.influence}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Celestial Events */}
              {result.celestialEvents.length > 0 && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <h4 className="font-display text-accent mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Notable Celestial Events
                  </h4>
                  <ul className="space-y-2">
                    {result.celestialEvents.map((event, i) => (
                      <li key={i} className="font-body text-foreground/90 text-sm">
                        <strong>{event.event}:</strong> {event.significance}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mood Correlation */}
              {userMood && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h4 className="font-display text-primary mb-2 flex items-center gap-2">
                    <Moon className="w-4 h-4" /> Mood Correlation
                  </h4>
                  <p className="font-body text-foreground/90 text-sm">
                    {result.moodCorrelation}
                  </p>
                </div>
              )}

              {/* Activity Suggestions */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-display text-emerald-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Activities That May Have Aligned
                </h4>
                <ul className="space-y-1">
                  {result.activitySuggestions.map((activity, i) => (
                    <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                      <span className="text-emerald-400">•</span> {activity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reflection Prompts */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-display text-purple-400 mb-3">Reflection Prompts</h4>
                <ul className="space-y-2">
                  {result.reflectionPrompts.map((prompt, i) => (
                    <li key={i} className="font-body text-foreground/90 text-sm italic">
                      "{prompt}"
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clarity Note */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-muted-foreground text-xs">
                      <strong>Confidence:</strong> {result.confidenceLevel} • 
                      <strong> Limitation:</strong> {result.limitations}
                    </p>
                    <p className="font-body text-muted-foreground text-xs mt-1">
                      <strong>Source:</strong> {result.dataSource}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full px-6 py-3 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-body"
              >
                Explain Another Day
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExplainMyDay;
