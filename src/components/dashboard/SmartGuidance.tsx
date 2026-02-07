import { motion } from 'framer-motion';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { Target, Layers, Clock, Brain, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Target> = {
  target: Target,
  layers: Layers,
  clock: Clock,
  brain: Brain,
  coffee: Coffee
};

const priorityStyles = {
  high: 'border-l-cognitive-high bg-cognitive-high/5',
  medium: 'border-l-cognitive-medium bg-cognitive-medium/5',
  low: 'border-l-cognitive-low bg-cognitive-low/5'
};

export function SmartGuidance() {
  const { studyPlan } = useStudyPlanner();

  if (!studyPlan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border/50 shadow-lg p-6"
    >
      <h2 className="text-xl font-display font-bold text-foreground mb-6">
        Smart Guidance
      </h2>

      <div className="space-y-4">
        {studyPlan.smartGuidance.map((guidance, index) => {
          const Icon = iconMap[guidance.icon] || Target;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl border-l-4 transition-all hover:shadow-md',
                priorityStyles[guidance.priority]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-card shadow-sm">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{guidance.title}</h3>
                  <p className="text-sm text-muted-foreground">{guidance.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
