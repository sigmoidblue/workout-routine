import { Category, WorkoutLog } from '../types';
import CategoryCard from '../components/CategoryCard';
import StreakBadge from '../components/StreakBadge';
import { useStreak } from '../hooks/useStreak';

const CATEGORIES: Category[] = ['push', 'pull', 'legs', 'core', 'cardio', 'crossfit', 'fullbody', 'yoga'];

type Props = {
  onStart: (category: Category) => void;
  onLibrary: () => void;
  workouts: WorkoutLog[];
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Home({ onStart, onLibrary, workouts }: Props) {
  const { streak } = useStreak();
  const today = todayStr();
  const todayWorkout = workouts.find((w) => w.date === today);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h1>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <StreakBadge streak={streak} />
            <button
              onClick={onLibrary}
              className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
              title="Exercise Library"
            >
              <svg className="w-4.5 h-4.5 text-slate-500" style={{width:'18px',height:'18px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Today's status */}
        {todayWorkout && (
          <div className="mt-5 bg-white border border-emerald-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Workout logged</p>
                <p className="text-xs text-slate-500 capitalize">{todayWorkout.category} session</p>
              </div>
            </div>
            <button
              onClick={() => onStart(todayWorkout.category)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View
            </button>
          </div>
        )}
      </div>

      {/* Section label */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Choose your workout
        </p>
      </div>

      {/* Category Grid */}
      <div className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              onClick={() => onStart(cat)}
              hasWorkout={workouts.some((w) => w.date === today && w.category === cat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
