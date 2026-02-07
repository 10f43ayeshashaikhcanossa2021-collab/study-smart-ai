import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { StudentDetailsForm } from '@/components/forms/StudentDetailsForm';
import { SubjectsForm } from '@/components/forms/SubjectsForm';
import { AvailabilityForm } from '@/components/forms/AvailabilityForm';
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';

const steps = [
  { title: 'Your Details', description: 'Tell us about yourself' },
  { title: 'Subjects', description: 'Add your courses' },
  { title: 'Availability', description: 'Set your schedule' }
];

export function OnboardingWizard() {
  const { 
    currentStep, 
    setCurrentStep, 
    studentDetails, 
    subjects, 
    targetDate, 
    generatePlan 
  } = useStudyPlanner();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return studentDetails.name && studentDetails.email && studentDetails.college && studentDetails.branch;
      case 1:
        return subjects.length > 0;
      case 2:
        return targetDate !== null;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsGenerating(true);
      // Simulate AI processing for visual effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      generatePlan();
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Study Planning
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Create Your Study Plan
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-secondary" />
          <div className="flex justify-between mt-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`text-xs font-medium transition-colors ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-6 md:p-8 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <StudentDetailsForm />}
              {currentStep === 1 && <SubjectsForm />}
              {currentStep === 2 && <AvailabilityForm />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="h-12 px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isGenerating}
            className="h-12 px-8 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate My Plan
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
