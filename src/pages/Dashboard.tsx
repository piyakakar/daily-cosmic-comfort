import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Star, Calendar, TrendingUp, Heart, Sparkles, Clock, BookOpen } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { readings } = useReadingHistory();
  const navigate = useNavigate();
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(true);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchDailyMessage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('daily-message', {
          body: { dateOfBirth: '1990-01-01' }, // Default date for general message
        });
        
        if (!error && data?.message) {
          setDailyMessage(data.message);
        }
      } catch (err) {
        console.error('Error fetching daily message:', err);
      } finally {
        setIsLoadingMessage(false);
      }
    };

    fetchDailyMessage();
  }, []);

  const recentReadings = readings.slice(0, 3);

  const quickActions = [
    { title: 'Daily Message', icon: Star, route: '/daily-message', color: 'text-cyan-400' },
    { title: 'Career & Study', icon: TrendingUp, route: '/career-astrology', color: 'text-blue-400' },
    { title: 'Love Energy', icon: Heart, route: '/love-energy', color: 'text-pink-400' },
    { title: 'Affirmations', icon: Sparkles, route: '/affirmations', color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 w-full max-w-4xl"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              <span className="text-gradient-gold">Your</span>{' '}
              <span className="text-foreground">Dashboard</span>
            </h1>
          </div>
          <p className="font-body text-muted-foreground">{formattedDate}</p>
        </motion.div>

        {/* Daily Message Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-4xl cosmic-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg text-foreground">Today's Cosmic Message</h2>
          </div>
          {isLoadingMessage ? (
            <div className="animate-pulse h-6 bg-muted/30 rounded w-3/4"></div>
          ) : (
            <p className="font-body text-muted-foreground italic">
              "{dailyMessage || 'The universe is preparing something special for you today.'}"
            </p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl mb-6"
        >
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => navigate(action.route)}
                className="cosmic-card p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-all"
              >
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <span className="font-body text-sm text-muted-foreground">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="cosmic-card p-4 text-center">
            <BookOpen className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="font-display text-2xl text-foreground">{readings.length}</p>
            <p className="font-body text-xs text-muted-foreground">Total Readings</p>
          </div>
          <div className="cosmic-card p-4 text-center">
            <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="font-display text-2xl text-foreground">{today.getDate()}</p>
            <p className="font-body text-xs text-muted-foreground">Day of Month</p>
          </div>
          <div className="cosmic-card p-4 text-center">
            <Clock className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="font-display text-2xl text-foreground">
              {today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="font-body text-xs text-muted-foreground">Current Time</p>
          </div>
          <div className="cosmic-card p-4 text-center">
            <Star className="w-6 h-6 text-pink-400 mx-auto mb-2" />
            <p className="font-display text-2xl text-foreground">∞</p>
            <p className="font-body text-xs text-muted-foreground">Possibilities</p>
          </div>
        </motion.div>

        {/* Recent Readings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-4xl"
        >
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Readings
          </h2>
          {recentReadings.length > 0 ? (
            <div className="space-y-3">
              {recentReadings.map((reading, index) => (
                <motion.div
                  key={reading.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="cosmic-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-sm text-foreground">
                        {reading.zodiacSign} • Life Path {reading.lifePathNumber}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Mood: {reading.mood} • {new Date(reading.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    className="font-body text-xs text-primary hover:underline"
                  >
                    View
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="cosmic-card p-8 text-center">
              <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No readings yet</p>
              <button
                onClick={() => navigate('/')}
                className="mt-3 cosmic-button-small"
              >
                Get Your First Reading
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
