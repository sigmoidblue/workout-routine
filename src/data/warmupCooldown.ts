import { Category, Exercise } from '../types';

type PhaseExercises = { warmup: Exercise[]; cooldown: Exercise[] };

const wu = (id: string, name: string, category: Category, muscle: string, tip?: string): Exercise => ({
  id: `wu-${id}`,
  name,
  category,
  muscle,
  tip,
  equipment: 'home',
});

const cd = (id: string, name: string, category: Category, muscle: string, tip?: string): Exercise => ({
  id: `cd-${id}`,
  name,
  category,
  muscle,
  tip,
  equipment: 'home',
});

export const warmupCooldown: Record<Category, PhaseExercises> = {
  push: {
    warmup: [
      wu('push-0', 'Arm Circles', 'push', 'shoulders', 'Start small and gradually widen the circle. 10 reps each direction.'),
      wu('push-1', 'Band Pull-Aparts', 'push', 'upper back', 'Keep arms straight, squeeze shoulder blades together. 15 reps.'),
      wu('push-2', 'Wrist Circles', 'push', 'wrists', 'Rotate slowly through full range. 10 reps each direction.'),
    ],
    cooldown: [
      cd('push-0', 'Chest Doorway Stretch', 'push', 'chest', 'Place forearms on door frame, lean forward gently. Hold 30s.'),
      cd('push-1', 'Cross-Body Shoulder Stretch', 'push', 'shoulders', 'Pull arm across chest, keep shoulder down. Hold 30s each side.'),
      cd('push-2', 'Overhead Tricep Stretch', 'push', 'triceps', 'Reach hand down your upper back, use other hand to gently push elbow. Hold 30s each side.'),
    ],
  },
  pull: {
    warmup: [
      wu('pull-0', 'Cat-Cow', 'pull', 'spine', 'Move slowly, inhale to arch, exhale to round. 10 reps.'),
      wu('pull-1', 'Thoracic Rotation', 'pull', 'upper back', 'Seated or kneeling, rotate upper back side to side. 10 reps each way.'),
      wu('pull-2', 'Dead Hang', 'pull', 'lats', 'Hang from a bar fully relaxed. 20–30 seconds.'),
    ],
    cooldown: [
      cd('pull-0', 'Lat Stretch', 'pull', 'lats', 'Hold a rack, sit back into hips and let lats lengthen. Hold 30s each side.'),
      cd('pull-1', 'Bicep Wall Stretch', 'pull', 'biceps', 'Place hand on wall, fingers pointing back, gently rotate away. Hold 30s each side.'),
      cd('pull-2', 'Neck Side Tilt', 'pull', 'neck / traps', 'Drop ear to shoulder, keep the other shoulder down. Hold 20s each side.'),
    ],
  },
  legs: {
    warmup: [
      wu('legs-0', 'Hip Circles', 'legs', 'hips', 'Hands on hips, draw big circles. 10 reps each direction.'),
      wu('legs-1', 'Leg Swings', 'legs', 'hip flexors', 'Hold a wall, swing leg front-to-back then side-to-side. 15 reps each leg.'),
      wu('legs-2', 'Bodyweight Squat', 'legs', 'quads / glutes', 'Slow and controlled, pause at bottom. 10 reps.'),
    ],
    cooldown: [
      cd('legs-0', 'Standing Quad Stretch', 'legs', 'quads', 'Hold foot to glute, keep knees together. Hold 30s each side.'),
      cd('legs-1', 'Seated Hamstring Stretch', 'legs', 'hamstrings', 'Sit on floor, legs straight, hinge forward from hips. Hold 30s.'),
      cd('legs-2', 'Pigeon Pose', 'legs', 'glutes / hip flexors', 'Front shin parallel to hips, ease chest toward floor. Hold 45s each side.'),
    ],
  },
  core: {
    warmup: [
      wu('core-0', 'Cat-Cow', 'core', 'spine', 'Breathe deeply through each movement. 10 reps.'),
      wu('core-1', 'Dead Bug Hold', 'core', 'deep core', 'Press lower back into floor throughout. 5 reps each side, 5s hold.'),
      wu('core-2', 'Hip Circles', 'core', 'hips', 'Stand tall, hands on hips, circle slowly. 10 reps each direction.'),
    ],
    cooldown: [
      cd('core-0', 'Cobra Pose', 'core', 'abs / spine', 'Press through hands, keep glutes relaxed. Hold 30s.'),
      cd('core-1', "Child's Pose", 'core', 'lower back', 'Arms extended or resting by sides, breathe into back. Hold 45s.'),
      cd('core-2', 'Seated Spinal Twist', 'core', 'spine', 'Sit tall, rotate from the waist up. Hold 30s each side.'),
    ],
  },
  cardio: {
    warmup: [
      wu('cardio-0', 'March in Place', 'cardio', 'full body', 'Drive knees high, swing arms. 60 seconds.'),
      wu('cardio-1', 'Leg Swings', 'cardio', 'hip flexors', 'Hold wall for balance, swing front-to-back. 15 reps each leg.'),
      wu('cardio-2', 'Arm Swings', 'cardio', 'shoulders', 'Cross arms in front then swing wide open. 15 reps.'),
    ],
    cooldown: [
      cd('cardio-0', 'Standing Quad Stretch', 'cardio', 'quads', 'Hold ankle to glute, keep upright. Hold 30s each side.'),
      cd('cardio-1', 'Calf Stretch', 'cardio', 'calves', 'Push heel into floor, keep leg straight. Hold 30s each side.'),
      cd('cardio-2', 'Hip Flexor Lunge Stretch', 'cardio', 'hip flexors', 'Back knee on floor, shift weight forward gently. Hold 30s each side.'),
    ],
  },
  crossfit: {
    warmup: [
      wu('cf-0', 'Jumping Jacks', 'crossfit', 'full body', 'Start slow and build pace. 30 reps.'),
      wu('cf-1', 'Hip Circles', 'crossfit', 'hips', 'Exaggerate the range of motion. 10 reps each direction.'),
      wu('cf-2', 'Shoulder Pass-Throughs', 'crossfit', 'shoulders', 'Use a band or PVC pipe, keep arms straight. 10 reps.'),
    ],
    cooldown: [
      cd('cf-0', 'Pigeon Pose', 'crossfit', 'glutes / hips', 'Ease into it, breathe through any tension. Hold 45s each side.'),
      cd('cf-1', 'Thoracic Rotation', 'crossfit', 'upper back', 'Thread needle stretch — reach arm under body. Hold 20s each side.'),
      cd('cf-2', 'Hip Flexor Lunge Stretch', 'crossfit', 'hip flexors', 'Back knee down, tuck pelvis slightly. Hold 30s each side.'),
    ],
  },
  fullbody: {
    warmup: [
      wu('fb-0', 'Jumping Jacks', 'fullbody', 'full body', 'Light pace to raise heart rate. 30 reps.'),
      wu('fb-1', 'Hip Circles', 'fullbody', 'hips', 'Slow and deliberate circles. 10 reps each direction.'),
      wu('fb-2', 'Arm Swings', 'fullbody', 'shoulders', 'Swing across body then open wide. 15 reps.'),
    ],
    cooldown: [
      cd('fb-0', 'Downward Dog', 'fullbody', 'full posterior chain', 'Pedal heels to stretch calves and hamstrings. Hold 45s.'),
      cd('fb-1', 'Pigeon Pose', 'fullbody', 'glutes / hips', 'Ease down slowly, breathe into the stretch. Hold 45s each side.'),
      cd('fb-2', "Child's Pose", 'fullbody', 'lower back', 'Arms extended, sink hips toward heels. Hold 45s.'),
    ],
  },
  yoga: {
    warmup: [
      wu('yoga-0', "Child's Pose", 'yoga', 'lower back / hips', 'Settle in and take 5 deep breaths.'),
      wu('yoga-1', 'Cat-Cow', 'yoga', 'spine', 'Link breath to movement, inhale to arch, exhale to round. 8 reps.'),
      wu('yoga-2', 'Sun Breath', 'yoga', 'breathing', 'Inhale arms overhead, exhale fold forward. 5 slow cycles.'),
    ],
    cooldown: [
      cd('yoga-0', 'Savasana', 'yoga', 'full body', 'Lie flat, palms up, let every muscle relax completely. 2 minutes.'),
      cd('yoga-1', 'Seated Forward Fold', 'yoga', 'hamstrings / spine', 'Hinge from hips, keep spine long. Hold 60s.'),
      cd('yoga-2', 'Supine Spinal Twist', 'yoga', 'spine', 'Shoulders flat on floor, breathe into the rotation. Hold 45s each side.'),
    ],
  },
};

/** Flat lookup map for quick id → Exercise resolution */
export const phaseExerciseMap = new Map<string, Exercise>(
  Object.values(warmupCooldown).flatMap(({ warmup, cooldown }) =>
    [...warmup, ...cooldown].map((ex) => [ex.id, ex])
  )
);
