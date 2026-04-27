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
    // Shuffle within each group first, then put compounds before isolations
    const compounds = shuffle(pool.filter((e) => e.type === 'compound'));
    const isolations = shuffle(pool.filter((e) => e.type === 'isolation'));
    const untagged   = shuffle(pool.filter((e) => !e.type));
    const ordered = [...compounds, ...isolations, ...untagged];
    return ordered.slice(0, Math.min(count, ordered.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, category, count, seed]);

  const reroll = () => setSeed((s) => s + 1);

  return { picked, reroll };
}
