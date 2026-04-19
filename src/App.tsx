import { useState } from 'react';
import { Category, Exercise, WorkoutLog, View } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useStreak } from './hooks/useStreak';
import { defaultExercises } from './data/defaultExercises';
import Home from './views/Home';
import Session from './views/Session';
import Summary from './views/Summary';
import Library from './views/Library';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('wr_exercises', defaultExercises);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutLog[]>('wr_workouts', []);
  const { streak, incrementStreak } = useStreak();

  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [summaryLog, setSummaryLog] = useState<WorkoutLog | null>(null);

  const today = todayStr();
  const existingLog = activeCategory
    ? workouts.find((w) => w.date === today && w.category === activeCategory)
    : undefined;

  const handleStart = (category: Category) => {
    setActiveCategory(category);
    setView('session');
  };

  const handleFinish = (log: WorkoutLog) => {
    setWorkouts((prev) => {
      const others = prev.filter((w) => w.id !== log.id);
      return [...others, log];
    });
    incrementStreak();
    setSummaryLog(log);
    setView('summary');
  };

  const handleAddExercise = (ex: Omit<Exercise, 'id'>) => {
    setExercises((prev) => [...prev, { ...ex, id: makeId() }]);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  if (view === 'session' && activeCategory) {
    return (
      <div className="max-w-md mx-auto">
        <Session
          category={activeCategory}
          exercises={exercises}
          existingLog={existingLog}
          onFinish={handleFinish}
          onBack={() => setView('home')}
        />
      </div>
    );
  }

  if (view === 'summary' && summaryLog) {
    return (
      <div className="max-w-md mx-auto">
        <Summary
          log={summaryLog}
          exercises={exercises}
          streak={streak}
          onDone={() => setView('home')}
        />
      </div>
    );
  }

  if (view === 'library') {
    return (
      <div className="max-w-md mx-auto">
        <Library
          exercises={exercises}
          onAdd={handleAddExercise}
          onDelete={handleDeleteExercise}
          onBack={() => setView('home')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Home
        onStart={handleStart}
        onLibrary={() => setView('library')}
        workouts={workouts}
      />
    </div>
  );
}
