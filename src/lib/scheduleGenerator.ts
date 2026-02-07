import { 
  StudyPlanInput, 
  StudyPlan, 
  WeeklySchedule, 
  DailySchedule, 
  StudyBlock, 
  SubjectBreakdown,
  SmartGuidance,
  CognitiveLoad,
  Subject
} from '@/types/studyPlanner';
import { addDays, differenceInDays, format, startOfWeek, endOfWeek, isSameDay, isWeekend } from 'date-fns';

const SUBJECT_COLORS = [
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f97316', // Orange
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function calculateSubjectWeights(subjects: Subject[]): Map<string, number> {
  const weights = new Map<string, number>();
  
  subjects.forEach(subject => {
    // Higher credits = more time needed
    const creditWeight = subject.credits / 3; // Normalize around 3 credits
    
    // Lower confidence = more time needed (inverse)
    const confidenceWeight = (6 - subject.confidenceLevel) / 3;
    
    // Weak areas add to weight
    const weaknessWeight = subject.weakAreas.length * 0.2;
    
    const totalWeight = creditWeight * confidenceWeight + weaknessWeight;
    weights.set(subject.id, totalWeight);
  });
  
  // Normalize weights to sum to 1
  const totalWeight = Array.from(weights.values()).reduce((a, b) => a + b, 0);
  weights.forEach((weight, id) => {
    weights.set(id, weight / totalWeight);
  });
  
  return weights;
}

function getTimeSlots(preferredTime: string): { highFocus: string[], mediumFocus: string[], lowFocus: string[] } {
  switch (preferredTime) {
    case 'morning':
      return {
        highFocus: ['06:00', '07:00', '08:00', '09:00'],
        mediumFocus: ['10:00', '11:00', '14:00', '15:00'],
        lowFocus: ['16:00', '17:00', '19:00', '20:00']
      };
    case 'afternoon':
      return {
        highFocus: ['13:00', '14:00', '15:00', '16:00'],
        mediumFocus: ['10:00', '11:00', '17:00', '18:00'],
        lowFocus: ['08:00', '09:00', '19:00', '20:00']
      };
    case 'night':
      return {
        highFocus: ['19:00', '20:00', '21:00', '22:00'],
        mediumFocus: ['16:00', '17:00', '18:00', '23:00'],
        lowFocus: ['09:00', '10:00', '14:00', '15:00']
      };
    default:
      return {
        highFocus: ['09:00', '10:00', '11:00'],
        mediumFocus: ['14:00', '15:00', '16:00'],
        lowFocus: ['17:00', '18:00', '19:00']
      };
  }
}

function getCognitiveLoad(subject: Subject, topic: string, isWeakArea: boolean): CognitiveLoad {
  if (isWeakArea || subject.confidenceLevel <= 2) {
    return 'high';
  } else if (subject.confidenceLevel <= 3) {
    return 'medium';
  }
  return 'low';
}

function generateStudyBlocks(
  subject: Subject,
  hoursToAllocate: number,
  availableDates: Date[],
  timeSlots: ReturnType<typeof getTimeSlots>,
  existingBlocks: Map<string, StudyBlock[]>
): StudyBlock[] {
  const blocks: StudyBlock[] = [];
  let remainingMinutes = hoursToAllocate * 60;
  
  const topics = [
    ...subject.weakAreas.map(area => ({ name: area, isWeak: true })),
    ...subject.strongAreas.map(area => ({ name: area, isWeak: false })),
    { name: `${subject.name} - Core Concepts`, isWeak: false },
    { name: `${subject.name} - Practice Problems`, isWeak: true },
    { name: `${subject.name} - Revision`, isWeak: false }
  ];
  
  let topicIndex = 0;
  let dateIndex = 0;
  
  while (remainingMinutes > 0 && dateIndex < availableDates.length) {
    const currentDate = availableDates[dateIndex];
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayBlocks = existingBlocks.get(dateKey) || [];
    
    const topic = topics[topicIndex % topics.length];
    const cognitiveLoad = getCognitiveLoad(subject, topic.name, topic.isWeak);
    
    // Determine duration based on cognitive load
    let duration: number;
    let startTime: string;
    
    if (cognitiveLoad === 'high') {
      duration = Math.min(60, remainingMinutes); // 1 hour max for high focus
      startTime = timeSlots.highFocus[dayBlocks.filter(b => b.cognitiveLoad === 'high').length % timeSlots.highFocus.length];
    } else if (cognitiveLoad === 'medium') {
      duration = Math.min(90, remainingMinutes); // 1.5 hours for medium
      startTime = timeSlots.mediumFocus[dayBlocks.filter(b => b.cognitiveLoad === 'medium').length % timeSlots.mediumFocus.length];
    } else {
      duration = Math.min(45, remainingMinutes); // 45 min for light revision
      startTime = timeSlots.lowFocus[dayBlocks.filter(b => b.cognitiveLoad === 'low').length % timeSlots.lowFocus.length];
    }
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + Math.floor((minutes + duration) / 60);
    const endMinute = (minutes + duration) % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    const block: StudyBlock = {
      id: generateId(),
      subjectId: subject.id,
      subjectName: subject.name,
      topic: topic.name,
      date: currentDate,
      startTime,
      endTime,
      duration,
      cognitiveLoad,
      isCompleted: false
    };
    
    blocks.push(block);
    dayBlocks.push(block);
    existingBlocks.set(dateKey, dayBlocks);
    
    remainingMinutes -= duration;
    topicIndex++;
    
    // Move to next day if we've allocated enough for this day
    if (dayBlocks.length >= 4) {
      dateIndex++;
    }
  }
  
  return blocks;
}

export function generateStudyPlan(input: StudyPlanInput): StudyPlan {
  const { studentDetails, subjects, availability, targetDate } = input;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = differenceInDays(targetDate, today);
  
  // Calculate total available hours
  let totalAvailableHours = 0;
  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(today, i);
    totalAvailableHours += isWeekend(currentDate) 
      ? availability.weekendHours 
      : availability.weekdayHours;
  }
  
  // Calculate subject weights and allocate hours
  const weights = calculateSubjectWeights(subjects);
  const subjectHours = new Map<string, number>();
  
  subjects.forEach(subject => {
    const weight = weights.get(subject.id) || 0;
    subjectHours.set(subject.id, Math.round(totalAvailableHours * weight * 10) / 10);
  });
  
  // Generate available dates
  const availableDates: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    availableDates.push(addDays(today, i));
  }
  
  // Generate study blocks for each subject
  const timeSlots = getTimeSlots(availability.preferredTime);
  const existingBlocks = new Map<string, StudyBlock[]>();
  const allBlocks: StudyBlock[] = [];
  
  subjects.forEach(subject => {
    const hours = subjectHours.get(subject.id) || 0;
    const blocks = generateStudyBlocks(subject, hours, availableDates, timeSlots, existingBlocks);
    allBlocks.push(...blocks);
  });
  
  // Organize into daily and weekly schedules
  const dailySchedules = new Map<string, DailySchedule>();
  
  allBlocks.forEach(block => {
    const dateKey = format(block.date, 'yyyy-MM-dd');
    const existing = dailySchedules.get(dateKey);
    
    if (existing) {
      existing.blocks.push(block);
      existing.totalHours += block.duration / 60;
    } else {
      dailySchedules.set(dateKey, {
        date: block.date,
        blocks: [block],
        totalHours: block.duration / 60
      });
    }
  });
  
  // Sort blocks by start time within each day
  dailySchedules.forEach(schedule => {
    schedule.blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
  
  // Group into weekly schedules
  const weeklySchedules: WeeklySchedule[] = [];
  let currentWeek: DailySchedule[] = [];
  let weekNumber = 1;
  let weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  Array.from(dailySchedules.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach(day => {
      const dayWeekStart = startOfWeek(day.date, { weekStartsOn: 1 });
      
      if (dayWeekStart.getTime() !== weekStart.getTime()) {
        if (currentWeek.length > 0) {
          weeklySchedules.push({
            weekNumber,
            startDate: weekStart,
            endDate: endOfWeek(weekStart, { weekStartsOn: 1 }),
            days: currentWeek,
            weeklyGoals: generateWeeklyGoals(currentWeek, subjects)
          });
          weekNumber++;
        }
        currentWeek = [];
        weekStart = dayWeekStart;
      }
      
      currentWeek.push(day);
    });
  
  // Add last week
  if (currentWeek.length > 0) {
    weeklySchedules.push({
      weekNumber,
      startDate: weekStart,
      endDate: endOfWeek(weekStart, { weekStartsOn: 1 }),
      days: currentWeek,
      weeklyGoals: generateWeeklyGoals(currentWeek, subjects)
    });
  }
  
  // Generate subject breakdowns
  const subjectBreakdowns: SubjectBreakdown[] = subjects.map((subject, index) => {
    const hours = subjectHours.get(subject.id) || 0;
    const percentage = Math.round((hours / totalAvailableHours) * 100);
    
    let explanation = '';
    if (subject.confidenceLevel <= 2) {
      explanation = `Allocated more time due to low confidence level (${subject.confidenceLevel}/5)`;
    } else if (subject.credits >= 4) {
      explanation = `Higher allocation due to ${subject.credits} credits`;
    } else if (subject.weakAreas.length > 2) {
      explanation = `Extra focus on ${subject.weakAreas.length} weak areas`;
    } else {
      explanation = `Balanced allocation for steady progress`;
    }
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalHours: Math.round(hours * 10) / 10,
      percentage,
      explanation,
      color: SUBJECT_COLORS[index % SUBJECT_COLORS.length]
    };
  });
  
  // Generate smart guidance
  const smartGuidance: SmartGuidance[] = generateSmartGuidance(subjects, availability);
  
  // Generate next 7 days focus
  const nextSevenDays = weeklySchedules[0]?.days.slice(0, 7) || [];
  const nextSevenDaysFocus = generateNextSevenDaysFocus(nextSevenDays, subjects);
  
  // Generate buffer slots (15% of total time as buffers)
  const bufferSlots = generateBufferSlots(totalAvailableHours * 0.15, availableDates);
  
  // Calculate expected improvements
  const avgConfidence = subjects.reduce((sum, s) => sum + s.confidenceLevel, 0) / subjects.length;
  const expectedImprovement = Math.min(2, (5 - avgConfidence) * 0.6);
  
  return {
    id: generateId(),
    createdAt: new Date(),
    input,
    weeklySchedules,
    subjectBreakdowns,
    smartGuidance,
    nextSevenDaysFocus,
    weeklyGoals: weeklySchedules[0]?.weeklyGoals || [],
    bufferSlots,
    estimatedCompletion: targetDate,
    expectedConfidenceImprovement: Math.round(expectedImprovement * 10) / 10,
    stressReductionMessage: generateStressMessage(totalDays, subjects.length, avgConfidence)
  };
}

function generateWeeklyGoals(days: DailySchedule[], subjects: Subject[]): string[] {
  const subjectCounts = new Map<string, number>();
  
  days.forEach(day => {
    day.blocks.forEach(block => {
      subjectCounts.set(block.subjectName, (subjectCounts.get(block.subjectName) || 0) + 1);
    });
  });
  
  const goals: string[] = [];
  subjectCounts.forEach((count, subjectName) => {
    const subject = subjects.find(s => s.name === subjectName);
    if (subject && subject.weakAreas.length > 0) {
      goals.push(`Master ${subject.weakAreas[0]} in ${subjectName}`);
    } else {
      goals.push(`Complete ${count} sessions of ${subjectName}`);
    }
  });
  
  return goals.slice(0, 4);
}

function generateSmartGuidance(subjects: Subject[], availability: { preferredTime: string }): SmartGuidance[] {
  const guidance: SmartGuidance[] = [];
  
  // Find lowest confidence subjects
  const lowestConfidence = subjects.reduce((min, s) => s.confidenceLevel < min.confidenceLevel ? s : min, subjects[0]);
  if (lowestConfidence && lowestConfidence.confidenceLevel <= 2) {
    guidance.push({
      title: 'Focus on Weak Areas First',
      description: `Start your study sessions with ${lowestConfidence.name} while your energy is high. This subject needs the most attention.`,
      icon: 'target',
      priority: 'high'
    });
  }
  
  // Check for prerequisites
  const hasPrerequisites = subjects.some(s => s.weakAreas.some(w => w.toLowerCase().includes('basic') || w.toLowerCase().includes('fundamental')));
  if (hasPrerequisites) {
    guidance.push({
      title: 'Build Strong Foundations',
      description: 'Revise prerequisites and fundamentals before tackling advanced topics. Strong basics lead to better understanding.',
      icon: 'layers',
      priority: 'high'
    });
  }
  
  // Time optimization
  guidance.push({
    title: `Optimize Your ${availability.preferredTime.charAt(0).toUpperCase() + availability.preferredTime.slice(1)} Sessions`,
    description: `Your peak performance time is ${availability.preferredTime}. Schedule challenging topics during this window for maximum retention.`,
    icon: 'clock',
    priority: 'medium'
  });
  
  // Active recall suggestion
  guidance.push({
    title: 'Use Active Recall',
    description: 'Test yourself frequently instead of passive reading. Flashcards and practice problems boost long-term memory.',
    icon: 'brain',
    priority: 'medium'
  });
  
  // Break reminder
  guidance.push({
    title: 'Take Strategic Breaks',
    description: 'Follow the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break. Every 4 sessions, take a longer 15-30 minute break.',
    icon: 'coffee',
    priority: 'low'
  });
  
  return guidance;
}

function generateNextSevenDaysFocus(days: DailySchedule[], subjects: Subject[]): string[] {
  const focus: string[] = [];
  const coveredSubjects = new Set<string>();
  
  days.forEach((day, index) => {
    const mainBlock = day.blocks.find(b => b.cognitiveLoad === 'high') || day.blocks[0];
    if (mainBlock && !coveredSubjects.has(mainBlock.subjectName)) {
      focus.push(`Day ${index + 1}: Deep dive into ${mainBlock.topic}`);
      coveredSubjects.add(mainBlock.subjectName);
    }
  });
  
  return focus.slice(0, 7);
}

function generateBufferSlots(bufferHours: number, dates: Date[]): StudyBlock[] {
  const buffers: StudyBlock[] = [];
  const bufferPerWeek = Math.ceil(bufferHours / (dates.length / 7));
  
  for (let i = 0; i < dates.length; i += 7) {
    if (i < dates.length) {
      buffers.push({
        id: generateId(),
        subjectId: 'buffer',
        subjectName: 'Buffer / Catch-up',
        topic: 'Flexible review or catch-up time',
        date: dates[Math.min(i + 6, dates.length - 1)],
        startTime: '18:00',
        endTime: '19:30',
        duration: 90,
        cognitiveLoad: 'low',
        isCompleted: false
      });
    }
  }
  
  return buffers;
}

function generateStressMessage(totalDays: number, subjectCount: number, avgConfidence: number): string {
  if (totalDays > 30 && avgConfidence >= 3) {
    return "You're well-prepared with plenty of time! This schedule is designed to help you excel without burnout. Trust the process and celebrate small wins.";
  } else if (totalDays > 14) {
    return "Good timeline ahead! Consistent daily progress will get you there. Remember: slow and steady wins the race.";
  } else if (avgConfidence >= 3) {
    return "Compact timeline, but your strong foundation will help. Stay focused, follow the schedule, and you've got this!";
  } else {
    return "Intensive period ahead, but completely achievable! Focus on high-impact topics first. Every hour counts—you can do this!";
  }
}
