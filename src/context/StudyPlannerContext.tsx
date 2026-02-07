import { useState, createContext, useContext, ReactNode } from 'react';
import { StudyPlanInput, StudyPlan, Subject, StudentDetails, StudyAvailability } from '@/types/studyPlanner';
import { generateStudyPlan } from '@/lib/scheduleGenerator';

interface StudyPlannerContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  studentDetails: StudentDetails;
  setStudentDetails: (details: StudentDetails) => void;
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  availability: StudyAvailability;
  setAvailability: (availability: StudyAvailability) => void;
  targetDate: Date | null;
  setTargetDate: (date: Date | null) => void;
  studyPlan: StudyPlan | null;
  generatePlan: () => void;
  resetPlan: () => void;
  toggleBlockCompletion: (blockId: string) => void;
}

const defaultStudentDetails: StudentDetails = {
  name: '',
  college: '',
  branch: '',
  graduationYear: new Date().getFullYear() + 1,
  email: ''
};

const defaultAvailability: StudyAvailability = {
  weekdayHours: 4,
  weekendHours: 6,
  preferredTime: 'morning'
};

const StudyPlannerContext = createContext<StudyPlannerContextType | undefined>(undefined);

export function StudyPlannerProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [studentDetails, setStudentDetails] = useState<StudentDetails>(defaultStudentDetails);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availability, setAvailability] = useState<StudyAvailability>(defaultAvailability);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

  const generatePlan = () => {
    if (!targetDate || subjects.length === 0) return;

    const input: StudyPlanInput = {
      studentDetails,
      subjects,
      availability,
      targetDate
    };

    const plan = generateStudyPlan(input);
    setStudyPlan(plan);
  };

  const resetPlan = () => {
    setStudyPlan(null);
    setCurrentStep(0);
  };

  const toggleBlockCompletion = (blockId: string) => {
    if (!studyPlan) return;

    const updatedPlan = { ...studyPlan };
    updatedPlan.weeklySchedules = updatedPlan.weeklySchedules.map(week => ({
      ...week,
      days: week.days.map(day => ({
        ...day,
        blocks: day.blocks.map(block => 
          block.id === blockId ? { ...block, isCompleted: !block.isCompleted } : block
        )
      }))
    }));

    setStudyPlan(updatedPlan);
  };

  return (
    <StudyPlannerContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        studentDetails,
        setStudentDetails,
        subjects,
        setSubjects,
        availability,
        setAvailability,
        targetDate,
        setTargetDate,
        studyPlan,
        generatePlan,
        resetPlan,
        toggleBlockCompletion
      }}
    >
      {children}
    </StudyPlannerContext.Provider>
  );
}

export function useStudyPlanner() {
  const context = useContext(StudyPlannerContext);
  if (context === undefined) {
    throw new Error('useStudyPlanner must be used within a StudyPlannerProvider');
  }
  return context;
}
