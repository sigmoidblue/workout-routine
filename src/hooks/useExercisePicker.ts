import { useMemo, useState } from 'react';
import { Exercise, Category } from '../types';

const DEFAULT_COUNT = 7;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useExercisePicker(
  exercises: Exercise[],
  category: Category,
  count = DEFAULT_COUNT
) {
  const [seed, setSeed] = useState(0);

  const picked = useMemo(() => {
    const pool = exercises.filter((e) => e.category === category);
    const shuffled = shuffle(pool);
    return shuffled.slice(0, Math.min(count, shuffled.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, category, count, seed]);

  const reroll = () => setSeed((s) => s + 1);

  return { picked, reroll };
}
