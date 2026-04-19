import { Exercise } from '../types';

let idCounter = 1;
const e = (name: string, category: Exercise['category'], muscle?: string): Exercise => ({
  id: `default-${idCounter++}`,
  name,
  category,
  muscle,
});

export const defaultExercises: Exercise[] = [
  // Push
  e('Bench Press', 'push', 'chest'),
  e('Overhead Press', 'push', 'shoulders'),
  e('Incline DB Press', 'push', 'upper chest'),
  e('Lateral Raise', 'push', 'side delts'),
  e('Tricep Pushdown', 'push', 'triceps'),
  e('Dips', 'push', 'triceps'),
  e('Cable Fly', 'push', 'chest'),
  e('Front Raise', 'push', 'front delts'),

  // Pull
  e('Deadlift', 'pull', 'back'),
  e('Pull-ups', 'pull', 'lats'),
  e('Barbell Row', 'pull', 'upper back'),
  e('Cable Row', 'pull', 'mid back'),
  e('Face Pull', 'pull', 'rear delts'),
  e('Bicep Curl', 'pull', 'biceps'),
  e('Hammer Curl', 'pull', 'biceps'),
  e('Lat Pulldown', 'pull', 'lats'),

  // Legs
  e('Squat', 'legs', 'quads'),
  e('Romanian Deadlift', 'legs', 'hamstrings'),
  e('Leg Press', 'legs', 'quads'),
  e('Lunges', 'legs', 'quads'),
  e('Leg Curl', 'legs', 'hamstrings'),
  e('Calf Raise', 'legs', 'calves'),
  e('Bulgarian Split Squat', 'legs', 'quads'),
  e('Hip Thrust', 'legs', 'glutes'),

  // Core
  e('Plank', 'core', 'abs'),
  e('Cable Crunch', 'core', 'abs'),
  e('Hanging Leg Raise', 'core', 'lower abs'),
  e('Russian Twist', 'core', 'obliques'),
  e('Ab Wheel', 'core', 'abs'),
  e('Dead Bug', 'core', 'core'),
  e('Side Plank', 'core', 'obliques'),

  // Cardio
  e('Treadmill Run', 'cardio', 'cardiovascular'),
  e('Jump Rope', 'cardio', 'cardiovascular'),
  e('Cycling', 'cardio', 'cardiovascular'),
  e('Stair Climber', 'cardio', 'cardiovascular'),
  e('Rowing Machine', 'cardio', 'full body'),
  e('HIIT Intervals', 'cardio', 'cardiovascular'),

  // Crossfit
  e('Box Jumps', 'crossfit', 'legs'),
  e('Burpees', 'crossfit', 'full body'),
  e('Kettlebell Swing', 'crossfit', 'posterior chain'),
  e('Wall Balls', 'crossfit', 'full body'),
  e('Thrusters', 'crossfit', 'full body'),
  e('Double-Unders', 'crossfit', 'cardiovascular'),
  e('Power Clean', 'crossfit', 'full body'),

  // Full Body
  e('Clean & Press', 'fullbody', 'full body'),
  e('Turkish Get-Up', 'fullbody', 'full body'),
  e('Farmers Carry', 'fullbody', 'grip / core'),
  e('Man Makers', 'fullbody', 'full body'),
  e('Sandbag Carry', 'fullbody', 'full body'),

  // Yoga
  e('Sun Salutation', 'yoga', 'full body'),
  e('Downward Dog', 'yoga', 'hamstrings / shoulders'),
  e('Warrior I', 'yoga', 'hips / quads'),
  e('Pigeon Pose', 'yoga', 'hips'),
  e("Child's Pose", 'yoga', 'back / hips'),
  e('Warrior II', 'yoga', 'hips / quads'),
  e('Triangle Pose', 'yoga', 'obliques / hips'),
];
