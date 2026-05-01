import { useMemo, useState } from 'react';
import { Exercise, Category, WorkoutEquipment } from '../types';

const DEFAULT_COUNT = 7;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function matchesEquipment(ex: Exercise, equipment: WorkoutEquipment | null): boolean {
  if (!equipment) return true;
  const req = ex.equipment ?? 'gym'; // untagged defaults to gym-only
  if (equipment === 'gym') return true;
  if (equipment === 'dumbbells') return req === 'dumbbells' || req === 'home';
  if (equipment === 'home') return req === 'home';
  return true;
}

export function useExercisePicker(
  exercises: Exercise[],
  category: Category,
  count = DEFAULT_COUNT,
  equipment: WorkoutEquipment | null = null,
) {
  const [seed, setSeed] = useState(0);

  const picked = useMemo(() => {
    const pool = exercises.filter(
      (e) => e.category === category && matchesEquipment(e, equipment)
    );
    // Shuffle within each group, compounds first then isolations (custom/untagged mixed with isolations)
    const compounds  = shuffle(pool.filter((e) => e.type === 'compound'));
    const isolations = shuffle(pool.filter((e) => e.type !== 'compound'));
    const ordered = [...compounds, ...isolations];
    return ordered.slice(0, Math.min(count, ordered.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, category, count, equipment, seed]);

  const reroll = () => setSeed((s) => s + 1);

  return { picked, reroll };
}
