import { motion, Easing } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { User, Building2, GraduationCap, Calendar, Mail } from 'lucide-react';

export function StudentDetailsForm() {
  const { studentDetails, setStudentDetails } = useStudyPlanner();

  const updateField = (field: keyof typeof studentDetails, value: string | number) => {
    setStudentDetails({ ...studentDetails, [field]: value });
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] as Easing }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2"
        >
          Tell us about yourself
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          We'll personalize your study plan based on your details
        </motion.p>
      </div>

      <div className="grid gap-5">
        <motion.div
          custom={0}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4 text-primary" />
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={studentDetails.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
          />
        </motion.div>

        <motion.div
          custom={1}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4 text-primary" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@university.edu"
            value={studentDetails.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
          />
        </motion.div>

        <motion.div
          custom={2}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <Label htmlFor="college" className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-primary" />
            College / University
          </Label>
          <Input
            id="college"
            placeholder="Enter your college name"
            value={studentDetails.college}
            onChange={(e) => updateField('college', e.target.value)}
            className="h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div
            custom={3}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <Label htmlFor="branch" className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="w-4 h-4 text-primary" />
              Branch / Major
            </Label>
            <Input
              id="branch"
              placeholder="e.g., Computer Science"
              value={studentDetails.branch}
              onChange={(e) => updateField('branch', e.target.value)}
              className="h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </motion.div>

          <motion.div
            custom={4}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <Label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-primary" />
              Graduation Year
            </Label>
            <Input
              id="year"
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 6}
              placeholder="2025"
              value={studentDetails.graduationYear}
              onChange={(e) => updateField('graduationYear', parseInt(e.target.value) || new Date().getFullYear())}
              className="h-12 bg-card border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
