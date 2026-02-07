import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudyPlanner } from '@/context/StudyPlannerContext';
import { Subject } from '@/types/studyPlanner';
import { Plus, Trash2, BookOpen, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function SubjectsForm() {
  const { subjects, setSubjects } = useStudyPlanner();
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({
    name: '',
    credits: 3,
    strongAreas: [],
    weakAreas: [],
    confidenceLevel: 3
  });
  const [strongInput, setStrongInput] = useState('');
  const [weakInput, setWeakInput] = useState('');

  const addSubject = () => {
    if (!currentSubject.name) return;

    const newSubject: Subject = {
      id: generateId(),
      name: currentSubject.name,
      credits: currentSubject.credits || 3,
      strongAreas: currentSubject.strongAreas || [],
      weakAreas: currentSubject.weakAreas || [],
      confidenceLevel: currentSubject.confidenceLevel || 3
    };

    setSubjects([...subjects, newSubject]);
    setCurrentSubject({
      name: '',
      credits: 3,
      strongAreas: [],
      weakAreas: [],
      confidenceLevel: 3
    });
    setStrongInput('');
    setWeakInput('');
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const addStrongArea = () => {
    if (!strongInput.trim()) return;
    setCurrentSubject({
      ...currentSubject,
      strongAreas: [...(currentSubject.strongAreas || []), strongInput.trim()]
    });
    setStrongInput('');
  };

  const addWeakArea = () => {
    if (!weakInput.trim()) return;
    setCurrentSubject({
      ...currentSubject,
      weakAreas: [...(currentSubject.weakAreas || []), weakInput.trim()]
    });
    setWeakInput('');
  };

  const removeStrongArea = (index: number) => {
    setCurrentSubject({
      ...currentSubject,
      strongAreas: currentSubject.strongAreas?.filter((_, i) => i !== index)
    });
  };

  const removeWeakArea = (index: number) => {
    setCurrentSubject({
      ...currentSubject,
      weakAreas: currentSubject.weakAreas?.filter((_, i) => i !== index)
    });
  };

  const confidenceLevels = [
    { value: 1, label: 'Very Low', color: 'cognitive-high' },
    { value: 2, label: 'Low', color: 'bg-orange-500' },
    { value: 3, label: 'Medium', color: 'cognitive-medium' },
    { value: 4, label: 'High', color: 'bg-lime-500' },
    { value: 5, label: 'Very High', color: 'cognitive-low' }
  ];

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
          Add Your Subjects
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Add all subjects you want to study. Include topics you're strong and weak in.
        </motion.p>
      </div>

      {/* Added Subjects List */}
      <AnimatePresence mode="popLayout">
        {subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 mb-6"
          >
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{subject.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{subject.credits} credits</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {subject.confidenceLevel}/5
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSubject(subject.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Subject Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-card rounded-2xl border border-border/50 shadow-lg space-y-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Plus className="w-4 h-4 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Add New Subject</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject Name</Label>
            <Input
              id="subjectName"
              placeholder="e.g., Data Structures"
              value={currentSubject.name}
              onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
              className="h-11 bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Credits</Label>
            <Input
              id="credits"
              type="number"
              min={1}
              max={6}
              value={currentSubject.credits}
              onChange={(e) => setCurrentSubject({ ...currentSubject, credits: parseInt(e.target.value) || 3 })}
              className="h-11 bg-background"
            />
          </div>
        </div>

        {/* Confidence Level */}
        <div className="space-y-3">
          <Label>Confidence Level</Label>
          <div className="flex flex-wrap gap-2">
            {confidenceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setCurrentSubject({ ...currentSubject, confidenceLevel: level.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentSubject.confidenceLevel === level.value
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'hover:opacity-80'
                } ${level.color} text-white`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Strong Areas */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cognitive-low" />
            Strong Areas
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Arrays, Linked Lists"
              value={strongInput}
              onChange={(e) => setStrongInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrongArea())}
              className="h-11 bg-background"
            />
            <Button type="button" onClick={addStrongArea} variant="outline" className="shrink-0">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSubject.strongAreas?.map((area, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-cognitive-low/10 text-cognitive-low border-cognitive-low/20 cursor-pointer hover:bg-cognitive-low/20"
                onClick={() => removeStrongArea(index)}
              >
                {area} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cognitive-high" />
            Weak Areas (Need More Focus)
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Trees, Graphs"
              value={weakInput}
              onChange={(e) => setWeakInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakArea())}
              className="h-11 bg-background"
            />
            <Button type="button" onClick={addWeakArea} variant="outline" className="shrink-0">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSubject.weakAreas?.map((area, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-cognitive-high/10 text-cognitive-high border-cognitive-high/20 cursor-pointer hover:bg-cognitive-high/20"
                onClick={() => removeWeakArea(index)}
              >
                {area} ×
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={addSubject}
          disabled={!currentSubject.name}
          className="w-full h-12 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </motion.div>
    </motion.div>
  );
}
