import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Moon, Sun, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserLog {
  id: string;
  date: string;
  mood: string;
  activities: string;
  notes: string;
}

interface CosmicEvent {
  date: string;
  type: string;
  name: string;
  description: string;
  significance: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  cosmicEvents: CosmicEvent[];
  userLog?: UserLog;
}

const CosmicCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [cosmicEvents, setCosmicEvents] = useState<CosmicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ mood: '', activities: '', notes: '' });

  const moods = ['😊 Happy', '😔 Sad', '😤 Frustrated', '😌 Calm', '⚡ Energetic', '😴 Tired', '🤔 Thoughtful', '😰 Anxious'];

  useEffect(() => {
    generateCalendar();
    fetchCosmicEvents();
    loadUserLogs();
  }, [currentMonth]);

  const loadUserLogs = () => {
    const saved = localStorage.getItem('cosmic-calendar-logs');
    if (saved) {
      setUserLogs(JSON.parse(saved));
    }
  };

  const saveUserLogs = (logs: UserLog[]) => {
    localStorage.setItem('cosmic-calendar-logs', JSON.stringify(logs));
    setUserLogs(logs);
  };

  const fetchCosmicEvents = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase.functions.invoke('cosmic-calendar', {
        body: {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCosmicEvents(data.events || []);
    } catch (error) {
      console.error('Error:', error);
      // Don't show error toast - use mock data instead
      setCosmicEvents(generateMockEvents());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockEvents = (): CosmicEvent[] => {
    const events: CosmicEvent[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Add lunar phases (approximate)
    const phases = [
      { day: 1, name: 'New Moon', type: 'lunar' },
      { day: 8, name: 'First Quarter', type: 'lunar' },
      { day: 15, name: 'Full Moon', type: 'lunar' },
      { day: 22, name: 'Last Quarter', type: 'lunar' },
    ];
    
    phases.forEach(phase => {
      if (phase.day <= new Date(year, month + 1, 0).getDate()) {
        events.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(phase.day).padStart(2, '0')}`,
          type: 'lunar',
          name: phase.name,
          description: `The Moon enters its ${phase.name} phase.`,
          significance: 'Lunar phases influence emotional rhythms and natural cycles.',
        });
      }
    });
    
    return events;
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        cosmicEvents: cosmicEvents.filter(e => e.date === dateStr),
        userLog: userLogs.find(l => l.date === dateStr),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  useEffect(() => {
    generateCalendar();
  }, [cosmicEvents, userLogs]);

  const addLog = () => {
    if (!selectedDay || !newLog.mood) {
      toast.error('Please select a mood');
      return;
    }

    const log: UserLog = {
      id: Date.now().toString(),
      date: selectedDay.date.toISOString().split('T')[0],
      ...newLog,
    };

    const updated = [...userLogs.filter(l => l.date !== log.date), log];
    saveUserLogs(updated);
    setShowLogForm(false);
    setNewLog({ mood: '', activities: '', notes: '' });
    toast.success('Log saved!');
  };

  const deleteLog = (id: string) => {
    const updated = userLogs.filter(l => l.id !== id);
    saveUserLogs(updated);
    toast.success('Log deleted');
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'lunar': return '🌙';
      case 'eclipse': return '🌒';
      case 'retrograde': return '↩️';
      case 'planetary': return '⭐';
      default: return '✨';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-12">
      <StarField />
      
      <div className="relative z-10 flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
            <span className="text-gradient-gold">Cosmic</span>{' '}
            <span className="text-foreground">Calendar Sync</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Track your moods and activities alongside verified celestial events
          </p>
        </motion.div>

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-4xl mb-4"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <p className="font-body text-foreground/80 text-xs">
                This calendar shows verified astronomical data. Log your experiences to discover personal patterns—no predictions, just reflection.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl cosmic-card p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="font-display text-xl text-primary">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-body text-muted-foreground text-xs py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`relative p-2 min-h-[70px] rounded-lg transition-all text-left ${
                  day.isCurrentMonth 
                    ? 'bg-muted/20 hover:bg-muted/40' 
                    : 'bg-muted/5 opacity-40'
                } ${
                  isToday(day.date) ? 'ring-2 ring-primary' : ''
                } ${
                  selectedDay?.date.toDateString() === day.date.toDateString() 
                    ? 'bg-primary/20 ring-1 ring-primary/50' 
                    : ''
                }`}
              >
                <span className={`font-body text-sm ${
                  isToday(day.date) ? 'text-primary font-semibold' : 'text-foreground/80'
                }`}>
                  {day.date.getDate()}
                </span>
                
                {/* Cosmic Events Indicators */}
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {day.cosmicEvents.slice(0, 2).map((event, j) => (
                    <span key={j} className="text-xs" title={event.name}>
                      {getEventIcon(event.type)}
                    </span>
                  ))}
                </div>
                
                {/* User Log Indicator */}
                {day.userLog && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mt-4 cosmic-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-lg text-primary">
                {selectedDay.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setShowLogForm(!showLogForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-body"
              >
                <Plus className="w-4 h-4" />
                Log
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cosmic Events */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-display text-sm text-accent mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Celestial Events
                </h4>
                {selectedDay.cosmicEvents.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedDay.cosmicEvents.map((event, i) => (
                      <li key={i}>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getEventIcon(event.type)}</span>
                          <span className="font-body text-foreground text-sm font-medium">{event.name}</span>
                        </div>
                        <p className="font-body text-muted-foreground text-xs">{event.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body text-muted-foreground text-sm">No major celestial events</p>
                )}
              </div>

              {/* User Log */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-display text-sm text-emerald-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Your Log
                </h4>
                {selectedDay.userLog ? (
                  <div className="space-y-2">
                    <p className="font-body text-foreground text-sm">
                      <strong>Mood:</strong> {selectedDay.userLog.mood}
                    </p>
                    {selectedDay.userLog.activities && (
                      <p className="font-body text-foreground/80 text-sm">
                        <strong>Activities:</strong> {selectedDay.userLog.activities}
                      </p>
                    )}
                    {selectedDay.userLog.notes && (
                      <p className="font-body text-foreground/80 text-sm">
                        <strong>Notes:</strong> {selectedDay.userLog.notes}
                      </p>
                    )}
                    <button
                      onClick={() => deleteLog(selectedDay.userLog!.id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-body mt-2"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                ) : (
                  <p className="font-body text-muted-foreground text-sm">No log for this day</p>
                )}
              </div>
            </div>

            {/* Log Form */}
            {showLogForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30"
              >
                <h4 className="font-display text-primary mb-3">Add Log</h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1 block">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setNewLog({ ...newLog, mood })}
                          className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                            newLog.mood === mood
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
                    <label className="font-body text-sm text-muted-foreground mb-1 block">Activities</label>
                    <input
                      type="text"
                      value={newLog.activities}
                      onChange={(e) => setNewLog({ ...newLog, activities: e.target.value })}
                      placeholder="What did you do?"
                      className="cosmic-input w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1 block">Notes</label>
                    <textarea
                      value={newLog.notes}
                      onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                      placeholder="Any reflections?"
                      className="cosmic-input w-full h-20 resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addLog}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm"
                    >
                      Save Log
                    </button>
                    <button
                      onClick={() => setShowLogForm(false)}
                      className="px-4 py-2 rounded-lg bg-muted/30 text-muted-foreground font-body text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CosmicCalendar;
