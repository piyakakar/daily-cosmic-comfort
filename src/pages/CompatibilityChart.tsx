import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Download, Sparkles, Star, AlertCircle } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { DateInput } from '@/components/DateInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getZodiacSign, calculateLifePathNumber, getCompatibleNumbers } from '@/lib/numerology';
import jsPDF from 'jspdf';

interface CompatibilityResult {
  overallScore: number;
  emotionalCompatibility: number;
  intellectualCompatibility: number;
  physicalChemistry: number;
  longTermPotential: number;
  strengths: string[];
  challenges: string[];
  communicationStyle: string;
  growthAreas: string[];
  advice: string;
  confidenceLevel: string;
  limitations: string;
}

const CompatibilityChart = () => {
  const [person1Dob, setPerson1Dob] = useState('');
  const [person2Dob, setPerson2Dob] = useState('');
  const [person1Name, setPerson1Name] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    person1Zodiac: string;
    person2Zodiac: string;
    person1LifePath: number;
    person2LifePath: number;
    analysis: CompatibilityResult;
  } | null>(null);

  const generateAnalysis = async () => {
    if (!person1Dob || !person2Dob) {
      toast.error('Please enter both birth dates');
      return;
    }

    setIsLoading(true);

    try {
      const person1Zodiac = getZodiacSign(person1Dob);
      const person2Zodiac = getZodiacSign(person2Dob);
      const person1LifePath = calculateLifePathNumber(person1Dob);
      const person2LifePath = calculateLifePathNumber(person2Dob);

      const { data, error } = await supabase.functions.invoke('compatibility-analysis', {
        body: {
          person1: {
            dob: person1Dob,
            name: person1Name || 'Person 1',
            zodiac: person1Zodiac,
            lifePath: person1LifePath,
          },
          person2: {
            dob: person2Dob,
            name: person2Name || 'Person 2',
            zodiac: person2Zodiac,
            lifePath: person2LifePath,
          },
          compatibleNumbers: getCompatibleNumbers(person1LifePath),
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult({
        person1Zodiac,
        person2Zodiac,
        person1LifePath,
        person2LifePath,
        analysis: data.analysis,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(45, 80, 60);
    doc.text('Compatibility Report', pageWidth / 2, 25, { align: 'center' });
    
    // Names & Zodiac
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`${person1Name || 'Person 1'} (${result.person1Zodiac}) & ${person2Name || 'Person 2'} (${result.person2Zodiac})`, pageWidth / 2, 40, { align: 'center' });
    
    // Overall Score
    doc.setFontSize(20);
    doc.text(`Overall Compatibility: ${result.analysis.overallScore}%`, pageWidth / 2, 55, { align: 'center' });
    
    let yPos = 70;
    
    // Compatibility Breakdown
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Compatibility Breakdown:', 20, yPos);
    yPos += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.text(`• Emotional: ${result.analysis.emotionalCompatibility}%`, 25, yPos);
    yPos += 8;
    doc.text(`• Intellectual: ${result.analysis.intellectualCompatibility}%`, 25, yPos);
    yPos += 8;
    doc.text(`• Physical Chemistry: ${result.analysis.physicalChemistry}%`, 25, yPos);
    yPos += 8;
    doc.text(`• Long-term Potential: ${result.analysis.longTermPotential}%`, 25, yPos);
    yPos += 15;
    
    // Strengths
    doc.setTextColor(100, 100, 100);
    doc.text('Relationship Strengths:', 20, yPos);
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    result.analysis.strengths.forEach((strength) => {
      const lines = doc.splitTextToSize(`• ${strength}`, pageWidth - 50);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 6;
    });
    yPos += 8;
    
    // Challenges
    doc.setTextColor(100, 100, 100);
    doc.text('Potential Challenges:', 20, yPos);
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    result.analysis.challenges.forEach((challenge) => {
      const lines = doc.splitTextToSize(`• ${challenge}`, pageWidth - 50);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 6;
    });
    yPos += 8;
    
    // Communication
    doc.setTextColor(100, 100, 100);
    doc.text('Communication Style:', 20, yPos);
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    const commLines = doc.splitTextToSize(result.analysis.communicationStyle, pageWidth - 45);
    doc.text(commLines, 25, yPos);
    yPos += commLines.length * 6 + 8;
    
    // Advice
    doc.setTextColor(100, 100, 100);
    doc.text('Relationship Advice:', 20, yPos);
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    const adviceLines = doc.splitTextToSize(result.analysis.advice, pageWidth - 45);
    doc.text(adviceLines, 25, yPos);
    yPos += adviceLines.length * 6 + 15;
    
    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const disclaimer = `Confidence Level: ${result.analysis.confidenceLevel}. ${result.analysis.limitations}`;
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(disclaimerLines, 20, yPos);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Generated by Cosmic Insights • For entertainment purposes', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    
    doc.save(`compatibility-report-${Date.now()}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500';
    if (score >= 60) return 'from-primary';
    if (score >= 40) return 'from-amber-500';
    return 'from-red-500';
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
            <span className="text-gradient-gold">Compatibility</span>{' '}
            <span className="text-foreground">Chart</span>
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Deep relationship analysis based on zodiac and numerology
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-display text-primary flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Person 1
                  </h3>
                  <input
                    type="text"
                    value={person1Name}
                    onChange={(e) => setPerson1Name(e.target.value)}
                    placeholder="Name (optional)"
                    className="cosmic-input w-full"
                  />
                  <DateInput dateOfBirth={person1Dob} onDateChange={setPerson1Dob} />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-display text-primary flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Person 2
                  </h3>
                  <input
                    type="text"
                    value={person2Name}
                    onChange={(e) => setPerson2Name(e.target.value)}
                    placeholder="Name (optional)"
                    className="cosmic-input w-full"
                  />
                  <DateInput dateOfBirth={person2Dob} onDateChange={setPerson2Dob} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateAnalysis}
                disabled={isLoading || !person1Dob || !person2Dob}
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
                    Analyzing compatibility...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    Generate Analysis
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
                <p className="font-display text-xl text-muted-foreground mb-2">
                  {person1Name || 'Person 1'} ({result.person1Zodiac}) 
                  <span className="text-primary mx-2">♥</span> 
                  {person2Name || 'Person 2'} ({result.person2Zodiac})
                </p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`font-display text-6xl ${getScoreColor(result.analysis.overallScore)}`}
                >
                  {result.analysis.overallScore}%
                </motion.p>
                <p className="font-body text-muted-foreground text-sm">Overall Compatibility</p>
              </div>

              {/* Compatibility Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Emotional', score: result.analysis.emotionalCompatibility },
                  { label: 'Intellectual', score: result.analysis.intellectualCompatibility },
                  { label: 'Physical', score: result.analysis.physicalChemistry },
                  { label: 'Long-term', score: result.analysis.longTermPotential },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/20 border border-border/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-body text-sm text-muted-foreground">{item.label}</span>
                      <span className={`font-display ${getScoreColor(item.score)}`}>{item.score}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full bg-gradient-to-r ${getScoreBg(item.score)} to-transparent rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-display text-emerald-400 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.analysis.strengths.map((strength, i) => (
                      <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <h4 className="font-display text-amber-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Challenges
                  </h4>
                  <ul className="space-y-2">
                    {result.analysis.challenges.map((challenge, i) => (
                      <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                        <span className="text-amber-400">!</span> {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Communication */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <h4 className="font-display text-primary mb-2">Communication Style</h4>
                <p className="font-body text-foreground/90 text-sm">
                  {result.analysis.communicationStyle}
                </p>
              </div>

              {/* Growth Areas */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <h4 className="font-display text-primary mb-2">Growth Areas</h4>
                <ul className="space-y-1">
                  {result.analysis.growthAreas.map((area, i) => (
                    <li key={i} className="font-body text-foreground/90 text-sm flex items-start gap-2">
                      <span className="text-primary">•</span> {area}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advice */}
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                <h4 className="font-display text-accent mb-2">Relationship Advice</h4>
                <p className="font-body text-foreground/90 text-sm">
                  {result.analysis.advice}
                </p>
              </div>

              {/* Clarity Note */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="font-body text-muted-foreground text-xs">
                  <strong>Confidence:</strong> {result.analysis.confidenceLevel} • <strong>Note:</strong> {result.analysis.limitations}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="flex-1 cosmic-button flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 px-6 py-3 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-body"
                >
                  New Analysis
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CompatibilityChart;
