import { useLocalStorage } from './useLocalStorage';
import { StreakData } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

const daysBetween = (a: string, b: string) => {
  const msPerDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
};

const defaultStreak: StreakData = {
  current: 0,
  lastWorkoutDate: '',
  longest: 0,
};

/** Check if a streak is still alive given today's date. */
function isStreakAlive(lastWorkoutDate: string, todayStr: string): boolean {
  if (!lastWorkoutDate) return false;
  const diff = daysBetween(lastWorkoutDate, todayStr);
  if (diff <= 1) return true; // worked out today or yesterday
  if (diff === 2) {
    // Allow a 2-day gap only if the skipped day is a Sunday
    const gapDate = new Date(lastWorkoutDate + 'T12:00:00');
    gapDate.setDate(gapDate.getDate() + 1);
    if (gapDate.getDay() === 0) return true;
  }
  return false;
}

export function useStreak() {
  const [streak, setStreak] = useLocalStorage<StreakData>('wr_streak', defaultStreak);

  // Reset stale streak on read
  const todayStr = today();
  if (streak.current > 0 && !isStreakAlive(streak.lastWorkoutDate, todayStr)) {
    // Streak has expired — reset it
    setStreak({ ...streak, current: 0 });
  }

  const incrementStreak = () => {
    const todayStr = today();
    setStreak((prev) => {
      if (prev.lastWorkoutDate === todayStr) return prev; // already logged today

      let newCurrent = 1;
      if (prev.lastWorkoutDate) {
        const diff = daysBetween(prev.lastWorkoutDate, todayStr);
        if (diff === 1) {
          newCurrent = prev.current + 1;
        } else if (diff === 2) {
          const gapDate = new Date(prev.lastWorkoutDate + 'T12:00:00');
          gapDate.setDate(gapDate.getDate() + 1);
          if (gapDate.getDay() === 0) {
            newCurrent = prev.current + 1;
          }
        }
      }

      return {
        current: newCurrent,
        lastWorkoutDate: todayStr,
        longest: Math.max(prev.longest, newCurrent),
      };
    });
  };

  return { streak, incrementStreak };
}
