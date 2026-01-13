import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Calendar, Sparkles, TrendingUp, BookOpen, Code, Palette, BarChart3, Download } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateReportPDF, downloadPDF } from '@/lib/pdfExport';

interface CareerInsight {
  careerPath: string;
  studyAdvice: string;
  bestDaysToStudy: string[];
  examSuccessPeriods: string;
  careerEnergies: {
    tech: number;
    creative: number;
    business: number;
  };
  actionTips: string[];
}

const CareerAstrology = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<CareerInsight | null>(null);

  const generateInsight = async () => {
    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    setIsLoading(true);
    setInsight(null);

    try {
      const { data, error } = await supabase.functions.invoke('career-astrology', {
        body: { dateOfBirth, name: name || undefined },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInsight(data.insight);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate career insight');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!insight) return;

    const sections = [
      { heading: '📈 Career Path', content: insight.careerPath },
      { heading: '📚 Study Advice', content: insight.studyAdvice },
      { heading: '📅 Best Days to Study', content: insight.bestDaysToStudy.join(', ') },
      { heading: '🎓 Exam Success Periods', content: insight.examSuccessPeriods },
      { 
        heading: '⚡ Career Energies', 
        content: `Tech & IT: ${insight.careerEnergies.tech}% | Creative: ${insight.careerEnergies.creative}% | Business: ${insight.careerEnergies.business}%` 
      },
      { heading: '💡 Action Tips', content: insight.actionTips },
    ];

    const doc = generateReportPDF('Career & Study Insights', sections);
    downloadPDF(doc, `career-report-${new Date().toISOString().split('T')[0]}`);
    toast.success('PDF downloaded successfully!');
  };

  const getEnergyBarWidth = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

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
            <Briefcase className="w-8 h-8 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              <span className="text-gradient-gold">Career</span>{' '}
              <span className="text-foreground">& Study</span>
            </h1>
          </div>
          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Discover your career path & best study periods
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
              <div className="space-y-4">
                <label className="block font-display text-lg text-foreground">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="cosmic-input w-full"
                />
              </div>

              <div className="space-y-4">
                <label className="block font-display text-lg text-foreground">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="cosmic-input w-full"
                />
              </div>

              <button
                onClick={generateInsight}
                disabled={!dateOfBirth || isLoading}
                className="cosmic-button w-full flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    Reveal Career & Study Insights
                  </>
                )}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Career Path */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-xl text-foreground">Career Path</h3>
                </div>
                <p className="font-body text-muted-foreground leading-relaxed pl-7">
                  {insight.careerPath}
                </p>
              </div>

              {/* Career Energies */}
              <div className="space-y-4">
                <h3 className="font-display text-xl text-foreground">Career Energies</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-400" />
                        <span className="font-body text-sm text-muted-foreground">Tech & IT</span>
                      </div>
                      <span className="font-body text-sm text-foreground">{insight.careerEnergies.tech}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: getEnergyBarWidth(insight.careerEnergies.tech) }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-400" />
                        <span className="font-body text-sm text-muted-foreground">Creative</span>
                      </div>
                      <span className="font-body text-sm text-foreground">{insight.careerEnergies.creative}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: getEnergyBarWidth(insight.careerEnergies.creative) }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        <span className="font-body text-sm text-muted-foreground">Business</span>
                      </div>
                      <span className="font-body text-sm text-foreground">{insight.careerEnergies.business}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: getEnergyBarWidth(insight.careerEnergies.business) }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Advice */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display text-xl text-foreground">Study Advice</h3>
                </div>
                <p className="font-body text-muted-foreground leading-relaxed pl-7">
                  {insight.studyAdvice}
                </p>
              </div>

              {/* Best Days & Exam Periods */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg text-foreground">Best Days to Study</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {insight.bestDaysToStudy.map((day, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/20 text-primary font-body text-sm"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-display text-lg text-foreground">Exam Success</h3>
                  </div>
                  <p className="font-body text-muted-foreground text-sm pl-7">
                    {insight.examSuccessPeriods}
                  </p>
                </div>
              </div>

              {/* Action Tips */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <h3 className="font-display text-xl text-foreground">💡 Action Tips</h3>
                <ul className="space-y-2">
                  {insight.actionTips.map((tip, index) => (
                    <li key={index} className="font-body text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPDF}
                  className="cosmic-button flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </motion.button>
                <button
                  onClick={() => setInsight(null)}
                  className="font-body text-muted-foreground hover:text-primary transition-colors"
                >
                  Check another profile
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CareerAstrology;
