import { motion } from 'framer-motion';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function SubjectBreakdown() {
  const { studyPlan } = useStudyPlanner();

  if (!studyPlan) return null;

  const data = studyPlan.subjectBreakdowns.map(sb => ({
    name: sb.subjectName,
    value: sb.totalHours,
    percentage: sb.percentage,
    color: sb.color,
    explanation: sb.explanation
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl border border-border/50 shadow-lg p-6"
    >
      <h2 className="text-xl font-display font-bold text-foreground mb-6">
        Time Allocation
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.value}h ({item.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Details */}
        <div className="w-full lg:w-1/2 space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-foreground text-sm">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{item.value}h</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground pl-5">{item.explanation}</p>
                <span className="text-xs text-muted-foreground">{item.percentage}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
