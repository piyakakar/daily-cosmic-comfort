import { motion } from 'framer-motion';
import { Lock, FileText, Heart, Calendar, TrendingUp, Download, Sparkles, Crown, Check } from 'lucide-react';
import { StarField } from '@/components/StarField';
import { toast } from 'sonner';

interface PremiumFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    icon: FileText,
    title: "Detailed Reports",
    description: "In-depth 10+ page analysis of your cosmic blueprint",
    color: "text-blue-400"
  },
  {
    icon: Heart,
    title: "Compatibility Charts",
    description: "Complete relationship analysis with any person",
    color: "text-pink-400"
  },
  {
    icon: Calendar,
    title: "Monthly Predictions",
    description: "Detailed forecasts for every month of the year",
    color: "text-amber-400"
  },
  {
    icon: TrendingUp,
    title: "Love & Career Deep Dive",
    description: "Extensive analysis of your romantic & professional life",
    color: "text-emerald-400"
  },
  {
    icon: Download,
    title: "PDF Downloads",
    description: "Export beautiful reports to share or print",
    color: "text-purple-400"
  }
];

const Premium = () => {
  const handleSubscribe = () => {
    toast.info('Premium subscriptions coming soon!', {
      description: 'We are working on bringing you amazing premium features.'
    });
  };

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
            <Crown className="w-10 h-10 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              <span className="text-gradient-gold">Premium</span>{' '}
              <span className="text-foreground">Features</span>
            </h1>
          </div>
          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Unlock the full power of cosmic insights
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md cosmic-card p-8 text-center mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <span className="font-display text-lg text-primary">Premium Plan</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl text-foreground">₹199</span>
                <span className="font-body text-muted-foreground">/month</span>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                or ₹999/year (save 58%)
              </p>
            </div>

            <button
              onClick={handleSubscribe}
              className="cosmic-button w-full flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Subscribe Now
            </button>

            <p className="font-body text-xs text-muted-foreground">
              Cancel anytime • 7-day free trial
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="cosmic-card p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted/30">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display text-lg text-foreground">{feature.title}</h3>
                <p className="font-body text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 max-w-lg mx-auto text-center space-y-6"
        >
          <h2 className="font-display text-2xl text-foreground">What You Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {[
              'Unlimited detailed readings',
              'Priority AI response time',
              'Exclusive weekly forecasts',
              'Ad-free experience',
              'Early access to new features',
              'Personal cosmic coach chat'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-body text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Premium;
