import { useState, useEffect } from 'react';
import { Category, Exercise, WorkoutLog, View, WorkoutFilters } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useStreak } from './hooks/useStreak';
import { defaultExercises, EXERCISES_SEED_VERSION } from './data/defaultExercises';
import Home from './views/Home';
import Session from './views/Session';
import Summary from './views/Summary';
import Library from './views/Library';
import Progress from './views/Progress';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const goBack = () => history.back();

export default function App() {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('wr_exercises', defaultExercises);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutLog[]>('wr_workouts', []);
  const [seedVersion, setSeedVersion] = useLocalStorage<number>('wr_seed_version', 0);
  const [filters, setFilters] = useLocalStorage<WorkoutFilters>('wr_filters', {
    goal: null, equipment: null, experience: null, duration: null,
  });
  const { streak, incrementStreak } = useStreak();

  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [summaryLog, setSummaryLog] = useState<WorkoutLog | null>(null);

  // Migrate exercise library when defaults are updated
  useEffect(() => {
    if (seedVersion < EXERCISES_SEED_VERSION) {
      setExercises(prev => {
        const userAdded = prev.filter(e => !e.id.startsWith('default-'));
        return [...defaultExercises, ...userAdded];
      });
      setSeedVersion(EXERCISES_SEED_VERSION);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Swipe-back support: listen for the browser's popstate event (iOS swipe-back
  // or Android back button) and return to the home screen.
  useEffect(() => {
    const handlePop = () => {
      setView('home');
      setActiveCategory(null);
      setSummaryLog(null);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const today = todayStr();
  const existingLog = activeCategory
    ? workouts.find((w) => w.date === today && w.category === activeCategory)
    : undefined;

  const handleStart = (category: Category) => {
    setActiveCategory(category);
    setView('session');
    // Push one history entry so swipe-back has something to return from
    history.pushState(null, '');
  };

  const handleFinish = (log: WorkoutLog) => {
    setWorkouts((prev) => {
      const others = prev.filter((w) => w.id !== log.id);
      return [...others, log];
    });
    incrementStreak();
    setSummaryLog(log);
    setView('summary');
    // Replace the session entry — still only one extra history entry total,
    // so a single swipe-back returns all the way to home.
    history.replaceState(null, '');
  };

  const handleSave = (log: WorkoutLog) => {
    setWorkouts((prev) => {
      const others = prev.filter((w) => w.id !== log.id);
      return [...others, log];
    });
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
          filters={filters}
          onFinish={handleFinish}
          onSave={existingLog ? handleSave : undefined}
          onBack={goBack}
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
          onDone={goBack}
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
          onBack={goBack}
        />
      </div>
    );
  }

  if (view === 'progress') {
    return (
      <div className="max-w-md mx-auto">
        <Progress
          workouts={workouts}
          exercises={exercises}
          onBack={goBack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Home
        onStart={handleStart}
        onLibrary={() => {
          setView('library');
          history.pushState(null, '');
        }}
        onProgress={() => {
          setView('progress');
          history.pushState(null, '');
        }}
        workouts={workouts}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
