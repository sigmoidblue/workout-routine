export type Category =
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'crossfit'
  | 'fullbody'
  | 'yoga';

export type Exercise = {
  id: string;
  name: string;
  category: Category;
  muscle?: string;
};

export type SetLog = {
  reps: number;
  weight?: number;
};

export type WorkoutExercise = {
  exerciseId: string;
  done: boolean;
  sets?: SetLog[];
};

export type WorkoutLog = {
  id: string;
  date: string;        // "2026-04-19"
  category: Category;
  exercises: WorkoutExercise[];
  completedAt?: string;
};

export type StreakData = {
  current: number;
  lastWorkoutDate: string;
  longest: number;
};

export type View = 'home' | 'session' | 'library' | 'summary';

export type WorkoutGoal = 'strength' | 'muscle' | 'athletic';
export type WorkoutEquipment = 'gym' | 'dumbbells' | 'home';
export type WorkoutExperience = 'beginner' | 'intermediate';
export type WorkoutDuration = 30 | 45 | 60;

export type WorkoutFilters = {
  goal: WorkoutGoal | null;
  equipment: WorkoutEquipment | null;
  experience: WorkoutExperience | null;
  duration: WorkoutDuration | null;
};
