import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { CalendarIcon, Clock, Sun, Sunset, Moon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

export function AvailabilityForm() {
  const { availability, setAvailability, targetDate, setTargetDate } = useStudyPlanner();

  const preferredTimes = [
    { value: 'morning', label: 'Morning', icon: Sun, description: '6 AM - 12 PM', gradient: 'gradient-warm' },
    { value: 'afternoon', label: 'Afternoon', icon: Sunset, description: '12 PM - 6 PM', gradient: 'gradient-accent' },
    { value: 'night', label: 'Night', icon: Moon, description: '6 PM - 12 AM', gradient: 'gradient-primary' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2"
        >
          Set Your Availability
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Tell us when you can study and we'll create an optimal schedule
        </motion.p>
      </div>

      {/* Study Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Daily Study Hours</h3>
              <p className="text-sm text-muted-foreground">How many hours can you study each day?</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Weekday Hours</Label>
                <span className="text-2xl font-bold text-primary">{availability.weekdayHours}h</span>
              </div>
              <Slider
                value={[availability.weekdayHours]}
                onValueChange={([value]) => setAvailability({ ...availability, weekdayHours: value })}
                min={1}
                max={12}
                step={0.5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hour</span>
                <span>12 hours</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Weekend Hours</Label>
                <span className="text-2xl font-bold text-accent">{availability.weekendHours}h</span>
              </div>
              <Slider
                value={[availability.weekendHours]}
                onValueChange={([value]) => setAvailability({ ...availability, weekendHours: value })}
                min={1}
                max={14}
                step={0.5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hour</span>
                <span>14 hours</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferred Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <Label className="text-base">When are you most productive?</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {preferredTimes.map((time) => {
            const Icon = time.icon;
            const isSelected = availability.preferredTime === time.value;
            
            return (
              <button
                key={time.value}
                onClick={() => setAvailability({ ...availability, preferredTime: time.value as typeof availability.preferredTime })}
                className={cn(
                  "p-5 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-card"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", time.gradient)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-foreground">{time.label}</p>
                <p className="text-sm text-muted-foreground">{time.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Target Date */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <Label className="text-base">Target Completion Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-14 justify-start text-left font-normal bg-card border-border/50",
                !targetDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
              {targetDate ? format(targetDate, "PPP") : "Pick your target date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={targetDate || undefined}
              onSelect={(date) => setTargetDate(date || null)}
              disabled={(date) => date < addDays(new Date(), 7)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground">
          Minimum 7 days from today for effective planning
        </p>
      </motion.div>
    </motion.div>
  );
}
