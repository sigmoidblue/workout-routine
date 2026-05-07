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

export function matchesEquipment(ex: Exercise, equipment: WorkoutEquipment | null): boolean {
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
  customPool?: Exercise[],
) {
  const [seed, setSeed] = useState(0);

  // Stable shuffled order — only reshuffles on seed/category/equipment/pool change, NOT on count change
  const shuffledOrder = useMemo(() => {
    const pool = customPool
      ? customPool.filter((e) => matchesEquipment(e, equipment))
      : exercises.filter(
          (e) => e.category === category && matchesEquipment(e, equipment)
        );
    // Shuffle entire pool together for maximum variety on reroll
    return shuffle(pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, category, equipment, seed, customPool]);

  // Slice from the stable order, then sort compounds first
  const picked = useMemo(() => {
    const raw = shuffledOrder.slice(0, Math.min(count, shuffledOrder.length));
    return [...raw].sort((a, b) => (a.type === 'compound' ? 0 : 1) - (b.type === 'compound' ? 0 : 1));
  }, [shuffledOrder, count]);

  const reroll = () => setSeed((s) => s + 1);

  return { picked, reroll, poolSize: shuffledOrder.length };
}
