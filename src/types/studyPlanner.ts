export interface StudentDetails {
  name: string;
  college: string;
  branch: string;
  graduationYear: number;
  email: string;
}

export interface Subject {
  id: string;
  name: string;
  credits: number;
  strongAreas: string[];
  weakAreas: string[];
  confidenceLevel: number; // 1-5
}

export interface StudyAvailability {
  weekdayHours: number;
  weekendHours: number;
  preferredTime: 'morning' | 'afternoon' | 'night';
}

export interface StudyPlanInput {
  studentDetails: StudentDetails;
  subjects: Subject[];
  availability: StudyAvailability;
  targetDate: Date;
}

export type CognitiveLoad = 'high' | 'medium' | 'low';

export interface StudyBlock {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  cognitiveLoad: CognitiveLoad;
  isCompleted: boolean;
}

export interface DailySchedule {
  date: Date;
  blocks: StudyBlock[];
  totalHours: number;
}

export interface WeeklySchedule {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  days: DailySchedule[];
  weeklyGoals: string[];
}

export interface SubjectBreakdown {
  subjectId: string;
  subjectName: string;
  totalHours: number;
  percentage: number;
  explanation: string;
  color: string;
}

export interface SmartGuidance {
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StudyPlan {
  id: string;
  createdAt: Date;
  input: StudyPlanInput;
  weeklySchedules: WeeklySchedule[];
  subjectBreakdowns: SubjectBreakdown[];
  smartGuidance: SmartGuidance[];
  nextSevenDaysFocus: string[];
  weeklyGoals: string[];
  bufferSlots: StudyBlock[];
  estimatedCompletion: Date;
  expectedConfidenceImprovement: number;
  stressReductionMessage: string;
}
