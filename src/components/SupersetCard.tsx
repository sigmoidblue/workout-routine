import { Exercise, WorkoutExercise } from '../types';
import ExerciseItem from './ExerciseItem';

type Slot = {
  exercise: Exercise;
  workoutEx: WorkoutExercise;
  onChange: (updated: WorkoutExercise) => void;
  alternatives: Exercise[];
  onSwap: (id: string) => void;
};

type Props = {
  slotA: Slot;
  slotB: Slot;
  onUnlink: () => void;
};

export default function SupersetCard({ slotA, slotB, onUnlink }: Props) {
  return (
    <div className="rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <div className="w-2 h-2 rounded-full bg-indigo-300" />
          </div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Superset</span>
        </div>
        <button
          onClick={onUnlink}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 000-5.656M5.636 18.364a9 9 0 010-12.728m3.536 3.536a4 4 0 000 5.656" />
          </svg>
          unlink
        </button>
      </div>

      {/* Exercise A */}
      <ExerciseItem
        bare
        exercise={slotA.exercise}
        workoutEx={slotA.workoutEx}
        onChange={slotA.onChange}
        alternatives={slotA.alternatives}
        onSwap={slotA.onSwap}
      />

      {/* Dotted divider */}
      <div className="mx-4 border-t border-dashed border-slate-200" />

      {/* Exercise B */}
      <ExerciseItem
        bare
        exercise={slotB.exercise}
        workoutEx={slotB.workoutEx}
        onChange={slotB.onChange}
        alternatives={slotB.alternatives}
        onSwap={slotB.onSwap}
      />
    </div>
  );
}
