import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { SubjectBreakdown } from '@/components/dashboard/SubjectBreakdown';
import { SmartGuidance } from '@/components/dashboard/SmartGuidance';
import { OutcomeSummary } from '@/components/dashboard/OutcomeSummary';
import { Download, RefreshCw, BookOpen, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function Dashboard() {
  const { studyPlan, studentDetails, resetPlan } = useStudyPlanner();
  const dashboardRef = useRef<HTMLDivElement>(null);

  if (!studyPlan) return null;

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${studentDetails.name.replace(/\s+/g, '_')}_study_plan.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-primary">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">
                  AI Study Planner
                </h1>
                <p className="text-xs text-muted-foreground">
                  {studentDetails.name} • {studentDetails.branch}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetPlan}>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit & Regenerate</span>
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} className="gradient-primary text-primary-foreground">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={dashboardRef} className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cognitive-low/10 text-cognitive-low text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Your Personalized Study Plan is Ready!
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Let's Ace Those Exams, {studentDetails.name.split(' ')[0]}! 🎯
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've analyzed your subjects, confidence levels, and availability to create an optimized study schedule just for you.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="space-y-8">
          {/* Outcome Summary */}
          <OutcomeSummary />

          {/* Calendar */}
          <CalendarView />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            <SubjectBreakdown />
            <SmartGuidance />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built with 💜 for Engineering Students • AI Study Planner
          </p>
        </div>
      </footer>
    </div>
  );
}
