import { Category } from '../types';

type Props = {
  category: Category;
  onClick: () => void;
  hasWorkout?: boolean;
  workoutStatus?: 'done' | 'in-progress';
  labelOverride?: string;
  subOverride?: string;
  dotOverride?: string;
};

const META: Record<Category, { label: string; sub: string; dot: string }> = {
  push:     { label: 'Push',      sub: 'Chest · Shoulders · Triceps',   dot: 'bg-indigo-400' },
  pull:     { label: 'Pull',      sub: 'Back · Biceps · Rear Delts',    dot: 'bg-violet-400' },
  legs:     { label: 'Legs',      sub: 'Quads · Hamstrings · Glutes',   dot: 'bg-cyan-400' },
  core:     { label: 'Core',      sub: 'Abs · Obliques · Stability',    dot: 'bg-emerald-400' },
  cardio:   { label: 'Cardio',    sub: 'Cardiovascular · Endurance',    dot: 'bg-rose-400' },
  crossfit: { label: 'Crossfit',  sub: 'Power · Agility · Full Body',   dot: 'bg-amber-400' },
  fullbody: { label: 'Full Body', sub: 'Compound · Strength',           dot: 'bg-sky-400' },
  yoga:     { label: 'Yoga',      sub: 'Flexibility · Mobility',        dot: 'bg-pink-400' },
  custom:   { label: 'Custom',    sub: 'Mix & Match',                   dot: 'bg-orange-400' },
};

export default function CategoryCard({ category, onClick, hasWorkout, workoutStatus, labelOverride, subOverride, dotOverride }: Props) {
  const meta = META[category];
  const label = labelOverride ?? meta.label;
  const sub = subOverride ?? meta.sub;
  const dot = dotOverride ?? meta.dot;

  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-150 text-left w-full active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            {hasWorkout && workoutStatus === 'in-progress' && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 leading-none">
                In Progress
              </span>
            )}
            {hasWorkout && workoutStatus !== 'in-progress' && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 leading-none">
                Done
              </span>
            )}
          </div>
          <div>
            <p className="text-slate-900 font-semibold text-base leading-tight">{label}</p>
            <p className="text-slate-500 text-xs mt-1 leading-snug">{sub}</p>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-150 mt-1 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
