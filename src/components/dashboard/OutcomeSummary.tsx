import { motion } from 'framer-motion';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { format } from 'date-fns';
import { Calendar, TrendingUp, Heart, Target, Clock, Zap } from 'lucide-react';

export function OutcomeSummary() {
  const { studyPlan, studentDetails } = useStudyPlanner();

  if (!studyPlan) return null;

  const stats = [
    {
      icon: Calendar,
      label: 'Estimated Completion',
      value: format(studyPlan.estimatedCompletion, 'MMM d, yyyy'),
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: TrendingUp,
      label: 'Expected Confidence Boost',
      value: `+${studyPlan.expectedConfidenceImprovement} levels`,
      color: 'text-cognitive-low',
      bgColor: 'bg-cognitive-low/10'
    },
    {
      icon: Clock,
      label: 'Total Study Hours',
      value: `${studyPlan.subjectBreakdowns.reduce((sum, sb) => sum + sb.totalHours, 0)}h`,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: Target,
      label: 'Subjects Covered',
      value: studyPlan.subjectBreakdowns.length,
      color: 'text-cognitive-medium',
      bgColor: 'bg-cognitive-medium/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-border/50 shadow-lg p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl gradient-primary">
          <Zap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Your Success Summary
          </h2>
          <p className="text-sm text-muted-foreground">
            Personalized for {studentDetails.name}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-card rounded-xl border border-border/50"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Stress Reduction Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-4 bg-cognitive-low/10 rounded-xl border border-cognitive-low/20"
      >
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-cognitive-low shrink-0" />
          <p className="text-sm text-foreground">{studyPlan.stressReductionMessage}</p>
        </div>
      </motion.div>

      {/* Next 7 Days Focus */}
      <div className="mt-6">
        <h3 className="font-semibold text-foreground mb-3">Next 7 Days Focus</h3>
        <div className="space-y-2">
          {studyPlan.nextSevenDaysFocus.slice(0, 5).map((focus, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              className="flex items-center gap-2 text-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">{focus}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
