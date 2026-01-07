import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface DateInputProps {
  dateOfBirth: string;
  onDateChange: (date: string) => void;
}

export const DateInput = ({ dateOfBirth, onDateChange }: DateInputProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <Label htmlFor="dob" className="font-display text-xl text-center block text-muted-foreground">
        Your Date of Birth
      </Label>
      <Input
        id="dob"
        type="date"
        value={dateOfBirth}
        onChange={(e) => onDateChange(e.target.value)}
        className="cosmic-input text-center max-w-xs mx-auto block text-foreground"
        max={new Date().toISOString().split('T')[0]}
      />
    </motion.div>
  );
};
