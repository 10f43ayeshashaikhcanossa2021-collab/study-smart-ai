import { StudyPlannerProvider, useStudyPlanner } from '@/context/StudyPlannerContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { Dashboard } from '@/components/Dashboard';

function StudyPlannerContent() {
  const { studyPlan } = useStudyPlanner();

  if (studyPlan) {
    return <Dashboard />;
  }

  return <OnboardingWizard />;
}

const Index = () => {
  return (
    <StudyPlannerProvider>
      <StudyPlannerContent />
    </StudyPlannerProvider>
  );
};

export default Index;
