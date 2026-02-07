import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { StudyBlock, CognitiveLoad } from '@/types/studyPlanner';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const cognitiveColors: Record<CognitiveLoad, string> = {
  high: 'bg-cognitive-high',
  medium: 'bg-cognitive-medium',
  low: 'bg-cognitive-low'
};

const cognitiveLabels: Record<CognitiveLoad, string> = {
  high: 'High Focus',
  medium: 'Medium Focus',
  low: 'Light Review'
};

export function CalendarView() {
  const { studyPlan, toggleBlockCompletion } = useStudyPlanner();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const currentWeek = studyPlan?.weeklySchedules[currentWeekIndex];

  const weekDays = useMemo(() => {
    if (!currentWeek) return [];
    
    const start = startOfWeek(currentWeek.startDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentWeek]);

  const getBlocksForDay = (date: Date): StudyBlock[] => {
    const daySchedule = currentWeek?.days.find(d => isSameDay(d.date, date));
    return daySchedule?.blocks || [];
  };

  if (!studyPlan || !currentWeek) return null;

  const totalWeeks = studyPlan.weeklySchedules.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
              Week {currentWeek.weekNumber}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(currentWeek.startDate, 'MMM d')} - {format(currentWeek.endDate, 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
              disabled={currentWeekIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {currentWeekIndex + 1} / {totalWeeks}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeekIndex(Math.min(totalWeeks - 1, currentWeekIndex + 1))}
              disabled={currentWeekIndex === totalWeeks - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(cognitiveLabels).map(([load, label]) => (
            <div key={load} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', cognitiveColors[load as CognitiveLoad])} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border/50">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-3 text-center border-r last:border-r-0 border-border/50',
                    isToday && 'bg-primary/5'
                  )}
                >
                  <p className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</p>
                  <p className={cn(
                    'text-lg font-semibold',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Study Blocks */}
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map((day) => {
              const blocks = getBlocksForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-2 border-r last:border-r-0 border-border/50 space-y-2',
                    isToday && 'bg-primary/5'
                  )}
                >
                  {blocks.map((block) => (
                    <motion.button
                      key={block.id}
                      onClick={() => toggleBlockCompletion(block.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'w-full p-2 rounded-lg text-left transition-all relative',
                        cognitiveColors[block.cognitiveLoad],
                        block.isCompleted && 'opacity-60'
                      )}
                    >
                      {block.isCompleted && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <p className="text-xs font-medium text-white truncate">
                        {block.subjectName}
                      </p>
                      <p className="text-[10px] text-white/80 truncate">
                        {block.topic}
                      </p>
                      <p className="text-[10px] text-white/70 mt-1">
                        {block.startTime} - {block.endTime}
                      </p>
                    </motion.button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="p-4 md:p-6 border-t border-border/50 bg-muted/30">
        <h3 className="font-semibold text-foreground mb-3">Weekly Goals</h3>
        <div className="flex flex-wrap gap-2">
          {currentWeek.weeklyGoals.map((goal, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
            >
              {goal}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
