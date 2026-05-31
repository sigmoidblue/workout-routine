import { Exercise, WorkoutEquipment } from '../types';

export const EXERCISES_SEED_VERSION = 7;

let idCounter = 1;
type Opts = { barbell?: boolean; equipment?: WorkoutEquipment };
const e = (
  name: string,
  category: Exercise['category'],
  muscle: string,
  tip: string,
  type?: Exercise['type'],
  opts?: Opts,
): Exercise => ({
  id: `default-${idCounter++}`,
  name, category, muscle, tip, type,
  barbell: opts?.barbell,
  equipment: opts?.equipment,
});

export const defaultExercises: Exercise[] = [

  // ── PUSH ─────────────────────────────────────────────────────────────────
  // Gym / barbell
  e('Barbell Bench Press',          'push', 'chest',           "Drive through your feet and keep your shoulder blades pinched into the bench — power comes from the whole body, not just your arms.",              'compound', { barbell: true, equipment: 'gym' }),
  e('Incline Barbell Press',        'push', 'upper chest',     "Set the bench at 30°, not 45° — any steeper and your shoulders take over from your chest.",                                                       'compound', { barbell: true, equipment: 'gym' }),
  e('Overhead Press',               'push', 'shoulders',       "Brace your core and squeeze your glutes — a solid base is what lets your shoulders press more weight.",                                           'compound', { barbell: true, equipment: 'gym' }),
  e('Dips',                         'push', 'chest / triceps', "Lean forward for chest, stay upright for triceps — go deep enough to feel a genuine stretch.",                                                    'compound', { equipment: 'gym' }),
  e('Assisted Dip',                 'push', 'chest / triceps', "Set the counterweight and go deep — same lean rules apply, the machine just lets you focus on form.",                                              'compound', { equipment: 'gym' }),
  e('Close-Grip Bench Press',       'push', 'triceps',         "Tuck your elbows to your sides — if they flare out, you've turned it into a regular bench press.",                                               'compound', { barbell: true, equipment: 'gym' }),
  e('Cable Fly',                    'push', 'chest',           "Keep a slight bend in your elbows and think of hugging a barrel — squeeze hard when the cables meet.",                                            'isolation', { equipment: 'gym' }),
  e('Cable Lateral Raise',          'push', 'side delts',      "Lead with your pinky and keep a soft elbow — no swinging or shrugging the weight up.",                                                           'isolation', { equipment: 'gym' }),
  e('Tricep Pushdown',              'push', 'triceps',         "Pin your elbows to your sides — if they're drifting back, your back is doing the work.",                                                         'isolation', { equipment: 'gym' }),
  e('Single-Arm Tricep Pushdown',  'push', 'triceps',         "One arm at a time lets you fix imbalances — lock your elbow in place and squeeze at full extension.",                                              'isolation', { equipment: 'gym' }),
  e('Overhead Tricep Extension',    'push', 'triceps',         "Get a full stretch at the bottom — the long head loves this range and it's what builds the horseshoe shape.",                                    'isolation', { equipment: 'gym' }),
  e('Machine Chest Press',          'push', 'chest',           "Great for isolating the chest without worrying about balance — squeeze hard at full extension.",                                                  'isolation', { equipment: 'gym' }),
  e('Pec Deck',                     'push', 'chest',           "Keep your chest up and don't let your elbows travel too far back — a stretch is good, shoulder pain is not.",                                    'isolation', { equipment: 'gym' }),

  // Dumbbells
  e('DB Bench Press',               'push', 'chest',           "DBs can travel slightly wider than a barbell — use the extra range for a bigger stretch and better contraction.",                                 'compound', { equipment: 'dumbbells' }),
  e('Incline DB Press',             'push', 'upper chest',     "Touch the DBs together at the top and squeeze — that last inch of range is where upper chest development lives.",                                'compound', { equipment: 'dumbbells' }),
  e('DB Shoulder Press',            'push', 'shoulders',       "Press in a slight arc rather than straight up — it's more natural for your shoulder joint.",                                                     'compound', { equipment: 'dumbbells' }),
  e('DB Lateral Raise',             'push', 'side delts',      "Lean slightly forward at the hips — this single adjustment dramatically improves side delt activation.",                                         'isolation', { equipment: 'dumbbells' }),
  e('DB Front Raise',               'push', 'front delts',     "Raise to eye level, no higher — going above recruits your traps instead of your front delts.",                                                   'isolation', { equipment: 'dumbbells' }),
  e('DB Fly',                       'push', 'chest',           "Slight bend in the elbows throughout — never straighten your arms or all the load goes straight to your joints.",                                'isolation', { equipment: 'dumbbells' }),
  e('DB Overhead Tricep Extension', 'push', 'triceps',         "Use one dumbbell with both hands — keep your upper arms vertical and only move your forearms.",                                                  'isolation', { equipment: 'dumbbells' }),
  e('DB Skull Crusher',             'push', 'triceps',         "Lower with control — the eccentric is where most tricep growth happens.",                                                                         'isolation', { equipment: 'dumbbells' }),

  // Bodyweight / home
  e('Push-up',                      'push', 'chest',           "Tuck your elbows to about 45° — flaring them wide turns this into a shoulder exercise.",                                                         'compound', { equipment: 'home' }),
  e('Wide Push-up',                 'push', 'outer chest',     "Hands wider than shoulder-width hits the outer chest — go all the way down every rep.",                                                          'compound', { equipment: 'home' }),
  e('Pike Push-up',                 'push', 'shoulders',       "Hips high, lower your head toward the floor between your hands — it mimics an overhead press.",                                                  'compound', { equipment: 'home' }),
  e('Decline Push-up',              'push', 'upper chest',     "Feet elevated shifts load to upper chest and front delts — keep your body in a straight line.",                                                  'compound', { equipment: 'home' }),
  e('Diamond Push-up',              'push', 'triceps',         "Form a diamond with your hands and track your elbows back — pure tricep focus.",                                                                 'isolation', { equipment: 'home' }),

  // ── PULL ─────────────────────────────────────────────────────────────────
  // Gym / barbell
  e('Conventional Deadlift',        'pull', 'back / hamstrings', "Hinge at the hips and keep the bar close — it should brush your shins on the way up.",                                                        'compound', { barbell: true, equipment: 'gym' }),
  e('Barbell Row',                  'pull', 'upper back',      "Pull to your belly button with a flat back — drive your elbows past your hips, not just up.",                                                    'compound', { equipment: 'gym' }),
  e('Lat Pulldown',                 'pull', 'lats',            "Lean back slightly and pull to your upper chest — lead with your elbows, not your hands.",                                                       'compound', { equipment: 'gym' }),
  e('Cable Row',                    'pull', 'mid back',        "Sit tall and pull your elbows behind you — don't rock your torso back and forth for momentum.",                                                  'compound', { equipment: 'gym' }),
  e('Chest-Supported Row',          'pull', 'upper back',      "Chest stays on the pad the whole time — this removes any temptation to use your lower back.",                                                    'compound', { equipment: 'gym' }),
  e('Face Pull',                    'pull', 'rear delts',      "Pull to eye level and externally rotate at the end — this exercise keeps your shoulder health in check long term.",                              'isolation', { equipment: 'gym' }),
  e('Cable Bicep Curl',             'pull', 'biceps',          "Keep your elbows pinned at your sides — the cable keeps tension at the bottom where a dumbbell can't.",                                         'isolation', { equipment: 'gym' }),
  e('Single-Arm Cable Curl',       'pull', 'biceps',          "Unilateral curls expose weak spots — keep your elbow fixed and control the negative for maximum tension.",                                        'isolation', { equipment: 'gym' }),
  e('Machine Row',                 'pull', 'upper back',      "Chest stays on the pad and pull your elbows straight back — great for isolating your back without lower back fatigue.",                            'compound', { equipment: 'gym' }),
  e('Straight-Arm Pulldown',        'pull', 'lats',            "Arms stay straight throughout — this isolates your lats without any bicep involvement.",                                                         'isolation', { equipment: 'gym' }),
  e('Assisted Pull-up',             'pull', 'lats',            "Set the counterweight to reduce resistance — aim to lower it over time as you build strength.",                                                    'compound', { equipment: 'gym' }),
  e('Assisted Chin-up',             'pull', 'biceps / lats',   "Use the counterweight to get full range of motion — chin over bar, full hang at the bottom.",                                                      'compound', { equipment: 'gym' }),

  // Bodyweight
  e('Pull-up',                      'pull', 'lats',            "Dead hang at the bottom every rep — partial reps only build partial lats.",                                                                       'compound', { equipment: 'home' }),
  e('Chin-up',                      'pull', 'biceps / lats',   "Supinated grip hits your biceps more — squeeze at the top and lower slowly with control.",                                                       'compound', { equipment: 'home' }),
  e('Inverted Row',                 'pull', 'upper back',      "Keep your body in a straight line and pull your chest to the bar — bend your knees to make it easier.",                                          'compound', { equipment: 'home' }),
  e('Superman Hold',                'pull', 'lower back',      "Hold at the top and squeeze your glutes — the goal is time under tension, not how high you go.",                                                 'isolation', { equipment: 'home' }),

  // Dumbbells
  e('Single-Arm DB Row',            'pull', 'upper back',      "Drive your elbow back past your hip — think less about your hand and more about where your elbow ends up.",                                     'compound', { equipment: 'dumbbells' }),
  e('DB Pullover',                  'pull', 'lats',            "Keep a slight bend in the elbows — lower until you feel a full lats stretch before pulling back over.",                                          'compound', { equipment: 'dumbbells' }),
  e('DB Bicep Curl',                'pull', 'biceps',          "Full extension at the bottom, all the way up — don't cheat by leaning back.",                                                                    'isolation', { equipment: 'dumbbells' }),
  e('Hammer Curl',                  'pull', 'brachialis',      "Neutral grip hits the brachialis — the muscle that actually makes your arms look thick from the front.",                                         'isolation', { equipment: 'dumbbells' }),
  e('Incline DB Curl',              'pull', 'biceps',          "The stretch at the bottom is the whole point — let your arms hang fully before you curl.",                                                       'isolation', { equipment: 'dumbbells' }),
  e('DB Rear Delt Fly',             'pull', 'rear delts',      "Hinge forward and think of spreading wings — your elbows should travel up and out, not back.",                                                   'isolation', { equipment: 'dumbbells' }),
  e('DB Shrug',                     'pull', 'traps',           "Hold for a beat at the top — elevate straight up, no rolling or rotating your shoulders.",                                                       'isolation', { equipment: 'dumbbells' }),
  e('DB Reverse Curl',              'pull', 'forearms',        "Overhand grip with neutral wrists — underrated for forearm and grip development.",                                                               'isolation', { equipment: 'dumbbells' }),
  e('DB Forearm Curl',              'pull', 'forearms',        "Rest your forearms on your thighs or a bench, palms up — curl the weight using only your wrists for full range of motion.",                        'isolation', { equipment: 'dumbbells' }),
  e('Machine Rear Delt Fly',        'pull', 'rear delts',      "Set the handles to chest height and keep a slight elbow bend — focus on squeezing your shoulder blades together at the peak.",                     'isolation', { equipment: 'gym' }),

  // ── LEGS ─────────────────────────────────────────────────────────────────
  // Gym / barbell
  e('Barbell Back Squat',           'legs', 'quads / glutes',  "Chest up, brace your core — sit back and down together, keeping your knees tracking over your toes.",                                            'compound', { barbell: true, equipment: 'gym' }),
  e('Romanian Deadlift',            'legs', 'hamstrings',      "Push your hips back until you feel a deep hamstring stretch — it's a hip hinge, not a knee bend.",                                              'compound', { barbell: true, equipment: 'gym' }),
  e('Leg Press',                    'legs', 'quads',           "Don't lock your knees at the top — keep constant tension through the full range of motion.",                                                     'compound', { equipment: 'gym' }),
  e('Bulgarian Split Squat',        'legs', 'quads / glutes',  "Lower until your back knee nearly touches the floor — most people stop way too short and miss the best range.",                                  'compound', { equipment: 'gym' }),
  e('Hip Thrust',                   'legs', 'glutes',          "Drive through your heel and squeeze hard at the top — don't hyperextend your lower back to fake more range.",                                    'compound', { equipment: 'gym' }),
  e('Hack Squat',                   'legs', 'quads',           "The more upright your torso, the more quad-dominant it is — go deep and control the descent.",                                                   'compound', { equipment: 'gym' }),
  e('Leg Extension',                'legs', 'quads',           "Squeeze at the full extension and slow down the negative — controlled reps beat heavy sloppy ones here.",                                        'isolation', { equipment: 'gym' }),
  e('Seated Leg Curl',              'legs', 'hamstrings',      "Seated gives a bigger stretch — slow, deliberate reps are far better than loading up and swinging.",                                             'isolation', { equipment: 'gym' }),
  e('Leg Curl',                     'legs', 'hamstrings',      "Curl all the way up and squeeze — a partial rep is a partial result.",                                                                           'isolation', { equipment: 'gym' }),
  e('Standing Calf Raise',          'legs', 'calves',          "Full range every rep — all the way up on your toes, all the way down for a full stretch.",                                                       'isolation', { equipment: 'gym' }),
  e('Seated Calf Raise',            'legs', 'soleus',          "Seated targets the soleus — often the most neglected calf muscle and essential for full calf development.",                                      'isolation', { equipment: 'gym' }),

  // Dumbbells
  e('DB Goblet Squat',              'legs', 'quads',           "Hold the DB at your chest and sit as deep as you can — great for quad focus and improving hip mobility.",                                        'compound', { equipment: 'dumbbells' }),
  e('DB Romanian Deadlift',         'legs', 'hamstrings',      "Same hinge pattern as the barbell version — feel the stretch before you come back up.",                                                          'compound', { equipment: 'dumbbells' }),
  e('DB Lunge',                     'legs', 'quads / glutes',  "Keep your torso tall and step long — your back knee should gently touch the floor each rep.",                                                    'compound', { equipment: 'dumbbells' }),
  e('DB Step-up',                   'legs', 'quads / glutes',  "Full foot on the platform and drive through your heel — don't push off your back foot.",                                                        'compound', { equipment: 'dumbbells' }),
  e('DB Hip Thrust',                'legs', 'glutes',          "Hold the DB on your hips and brace it — drive through your heel and squeeze hard at the top.",                                                   'compound', { equipment: 'dumbbells' }),

  // Bodyweight / home
  e('Bodyweight Squat',             'legs', 'quads',           "Arms forward for balance, sit back — if your heels lift, work on ankle mobility or elevate them slightly.",                                     'compound', { equipment: 'home' }),
  e('Walking Lunges',               'legs', 'quads / glutes',  "Long stride with an upright torso — let your back knee gently touch the floor every rep.",                                                       'compound', { equipment: 'home' }),
  e('Glute Bridge',                 'legs', 'glutes',          "Drive your hips up and squeeze at the top — flatten your lower back against the floor first.",                                                   'compound', { equipment: 'home' }),
  e('Single-Leg Glute Bridge',      'legs', 'glutes',          "One leg extended, bridge on the other — keep your hips level and don't let one side drop.",                                                     'compound', { equipment: 'home' }),
  e('Jump Squat',                   'legs', 'quads / explosive', "Land softly with bent knees — the landing is just as important as the jump for your joints.",                                                 'compound', { equipment: 'home' }),
  e('Sumo Squat',                   'legs', 'glutes / inner thighs', "Wide stance with toes turned out — let your knees track over your toes as you sit into it.",                                             'compound', { equipment: 'home' }),
  e('Wall Sit',                     'legs', 'quads',           "Ninety degrees at the knees and hold — when it burns, breathe through it.",                                                                      'isolation', { equipment: 'home' }),

  // ── CORE ─────────────────────────────────────────────────────────────────
  // Gym / cable
  e('Cable Crunch',                 'core', 'abs',             "Crunch from your abs, not your hips — your pelvis should not move at all during this exercise.",                                                 'isolation', { equipment: 'gym' }),
  e('Pallof Press',                 'core', 'anti-rotation',   "Resist the cable pulling you sideways — this builds the ability to stay stable under real load.",                                                'isolation', { equipment: 'gym' }),
  e('Landmine Rotation',            'core', 'obliques',        "Drive from your hips and core — the rotation comes from your whole torso, not just your arms.",                                                  'compound', { equipment: 'gym' }),

  // Bodyweight / home
  e('Plank',                        'core', 'abs',             "Squeeze your glutes, abs and quads at once — don't let your hips sag or pike.",                                                                  'isolation', { equipment: 'home' }),
  e('Hanging Leg Raise',            'core', 'lower abs',       "Control the descent — if you're swinging, your hip flexors are doing the work, not your abs.",                                                  'isolation', { equipment: 'home' }),
  e('Ab Wheel Rollout',             'core', 'abs',             "Only go as far as you can without your lower back caving — range comes as your core gets stronger.",                                              'compound', { equipment: 'home' }),
  e('Russian Twist',                'core', 'obliques',        "Rotate from your torso, not just your arms — lifting your feet makes it significantly harder.",                                                  'isolation', { equipment: 'home' }),
  e('Dead Bug',                     'core', 'core stability',  "Press your lower back firmly into the floor before you move — if it lifts, you've gone too far.",                                               'isolation', { equipment: 'home' }),
  e('Side Plank',                   'core', 'obliques',        "Hips in line with your shoulders — sagging hips mean your obliques aren't actually working.",                                                   'isolation', { equipment: 'home' }),
  e('Reverse Crunch',               'core', 'lower abs',       "Curl your pelvis toward your chest — it's a pelvic tilt, not just a leg raise.",                                                                'isolation', { equipment: 'home' }),
  e('Bicycle Crunch',               'core', 'obliques',        "Slow it down and rotate fully — going fast just means neck strain and no ab activation.",                                                       'isolation', { equipment: 'home' }),
  e('Dragon Flag',                  'core', 'abs',             "Lower as one rigid unit — this demands total body tension and is one of the hardest core exercises there is.",                                    'compound', { equipment: 'home' }),
  e('Mountain Climbers',            'core', 'cardio / core',   "Keep your hips level and drive each knee to your chest — form falls apart when you speed up.",                                                   'compound', { equipment: 'home' }),
  e('V-Sit Hold',                   'core', 'abs',             "Balance on your tailbone with your legs and chest raised — a great test and builder of static abdominal strength.",                              'isolation', { equipment: 'home' }),

  // ── CARDIO ───────────────────────────────────────────────────────────────
  // Gym machines
  e('Treadmill Run',                'cardio', 'cardiovascular', "Land mid-foot and lean slightly forward — heel striking means you're braking with every single step.",                                          'compound', { equipment: 'gym' }),
  e('Incline Walk',                 'cardio', 'cardiovascular', "Hands off the rails and swing your arms — holding on significantly reduces the calorie burn.",                                                   'compound', { equipment: 'gym' }),
  e('Stationary Bike',              'cardio', 'cardiovascular', "Set the seat so your knee has a slight bend at the very bottom of the stroke.",                                                                 'compound', { equipment: 'gym' }),
  e('Stair Climber',                'cardio', 'cardiovascular / glutes', "Don't lean on the rails — they're there for safety, not to hold your bodyweight.",                                                    'compound', { equipment: 'gym' }),
  e('Rowing Machine',               'cardio', 'full body',     "Legs push first, then lean back, then arms pull — reverse exactly on the way back in.",                                                          'compound', { equipment: 'gym' }),
  e('Assault Bike',                 'cardio', 'full body',     "Push with your legs and pull with your arms — the output is entirely determined by you.",                                                        'compound', { equipment: 'gym' }),
  e('Battle Ropes',                 'cardio', 'full body',     "Brace your core and generate the waves from your whole body — not just your arms.",                                                              'compound', { equipment: 'gym' }),
  e('Sled Push',                    'cardio', 'full body',     "Flat back, hips low, drive through your heels — it's a full-body effort.",                                                                       'compound', { equipment: 'gym' }),

  // Bodyweight / home
  e('HIIT Intervals',               'cardio', 'cardiovascular', "Go all-out during the work period — if you can hold a conversation, you're not working hard enough.",                                           'compound', { equipment: 'home' }),
  e('Jump Rope',                    'cardio', 'cardiovascular', "Stay on the balls of your feet with small jumps — timing matters more than how hard you jump.",                                                 'compound', { equipment: 'home' }),

  // ── CROSSFIT ─────────────────────────────────────────────────────────────
  // Olympic / barbell
  e('Power Clean',                  'crossfit', 'full body',   "Drive through your legs first, then shrug — it's a jump with a shrug, not a bicep curl.",                                                       'compound', { barbell: true, equipment: 'gym' }),
  e('Snatch',                       'crossfit', 'full body',   "Bar stays close to your body throughout — think of it brushing your legs and hips all the way up.",                                             'compound', { barbell: true, equipment: 'gym' }),
  e('Clean & Jerk',                 'crossfit', 'full body',   "Two separate movements — nail the front rack catch before you even think about the jerk.",                                                       'compound', { barbell: true, equipment: 'gym' }),
  e('Thrusters',                    'crossfit', 'full body',   "Squat deep and use leg drive to push the bar overhead — one fluid, powerful movement.",                                                         'compound', { barbell: true, equipment: 'gym' }),

  // Kettlebell / gym
  e('Kettlebell Swing',             'crossfit', 'posterior chain', "It's a hip hinge, not a squat — the power comes from snapping your hips forward explosively.",                                             'compound', { equipment: 'gym' }),

  // Bodyweight / gymnastics
  e('Box Jumps',                    'crossfit', 'explosive legs', "Land softly with bent knees — the jump builds power, the landing protects your joints.",                                                     'compound', { equipment: 'gym' }),
  e('Burpees',                      'crossfit', 'full body',   "Keep your hips level in the plank — don't let them sag or pike while you catch your breath.",                                                   'compound', { equipment: 'home' }),
  e('Wall Balls',                   'crossfit', 'full body',   "Full squat depth every rep — release the ball on the way up out of the hole, not at the top.",                                                  'compound', { equipment: 'gym' }),
  e('Double-Unders',                'crossfit', 'cardiovascular', "Jump slightly higher and relax your wrists — the rope does the work, not your arms.",                                                        'compound', { equipment: 'home' }),
  e('Kipping Pull-up',              'crossfit', 'back',        "Generate the swing from your hips — the kip assists the pull, it doesn't replace it.",                                                         'compound', { equipment: 'home' }),
  e('Handstand Push-up',            'crossfit', 'shoulders',   "Get comfortable holding against a wall first — it's just a strict shoulder press.",                                                             'compound', { equipment: 'home' }),
  e('Toes-to-Bar',                  'crossfit', 'core',        "Engage your lats and swing from your shoulders — control the descent or the kip falls apart.",                                                  'isolation', { equipment: 'home' }),

  // ── FULL BODY ─────────────────────────────────────────────────────────────
  // Barbell
  e('Clean & Press',                'fullbody', 'full body',   "Nail the front rack position on the catch before you press — two movements linked, both done right.",                                           'compound', { barbell: true, equipment: 'gym' }),
  e('Barbell Complex',              'fullbody', 'full body',   "Light weight, zero rest between movements — this is conditioning work, not a strength session.",                                                'compound', { barbell: true, equipment: 'gym' }),

  // Dumbbell / kettlebell
  e('Turkish Get-Up',               'fullbody', 'full body',   "Move deliberately through each position — this is a skill as much as a strength exercise.",                                                     'compound', { equipment: 'dumbbells' }),
  e('Man Makers',                   'fullbody', 'full body',   "Control each transition — row, push-up, squat, press — don't rush through the complexity.",                                                     'compound', { equipment: 'dumbbells' }),
  e('Renegade Row',                 'fullbody', 'full body',   "Minimize hip rotation as you row — the goal is to stay perfectly square, not twist.",                                                           'compound', { equipment: 'dumbbells' }),
  e('DB Complex',                   'fullbody', 'full body',   "Move through each exercise without putting the weights down — builds conditioning and strength at the same time.",                              'compound', { equipment: 'dumbbells' }),
  e('KB Snatch',                    'fullbody', 'full body',   "Drive from your hips and guide the bell overhead — punch through at the top for a locked-out finish.",                                         'compound', { equipment: 'dumbbells' }),

  // Bodyweight / loaded carry
  e('Farmers Carry',                'fullbody', 'grip / core', "Stand tall with shoulders back — the weight wants to pull you down, your job is to resist that the whole way.",                                'compound', { equipment: 'dumbbells' }),
  e('Suitcase Deadlift',            'fullbody', 'full body',   "Weight on one side, hinge and pull — great for anti-lateral flexion and real-world core strength.",                                             'compound', { equipment: 'dumbbells' }),

  // ── YOGA ─────────────────────────────────────────────────────────────────
  e('Sun Salutation',               'yoga', 'full body',       "Move with your breath — inhale to lengthen and open, exhale to fold and soften.",                                                               undefined, { equipment: 'home' }),
  e('Downward Dog',                 'yoga', 'hamstrings / shoulders', "Press the floor away and drive your hips up and back — your heels don't need to touch the floor.",                                      undefined, { equipment: 'home' }),
  e('Warrior I',                    'yoga', 'hips / quads',    "Square your hips forward and reach actively through your fingertips — feel the stretch through your back hip.",                                undefined, { equipment: 'home' }),
  e('Warrior II',                   'yoga', 'hips / quads',    "Sink your back hip down and gaze over your front fingers — hold it and breathe, don't rush.",                                                  undefined, { equipment: 'home' }),
  e('Pigeon Pose',                  'yoga', 'hips',            "Ease in slowly and breathe through the tightness — this one opens with patience, not force.",                                                  undefined, { equipment: 'home' }),
  e("Child's Pose",                 'yoga', 'back / hips',     "Reach your arms forward and let gravity do the work — a great reset between harder poses.",                                                    undefined, { equipment: 'home' }),
  e('Triangle Pose',                'yoga', 'obliques / hips', "Don't collapse your chest — rotate it open toward the ceiling and breathe.",                                                                    undefined, { equipment: 'home' }),
  e('Seated Forward Fold',          'yoga', 'hamstrings',      "Hinge from your hips, not your lower back — reach for your feet, not the floor.",                                                               undefined, { equipment: 'home' }),
  e('Cat-Cow',                      'yoga', 'spine',           "Move slowly through each vertebra — great for waking up or cooling down the spine.",                                                            undefined, { equipment: 'home' }),
  e('Low Lunge',                    'yoga', 'hip flexors',     "Drop your back knee and push your hips forward — feel the stretch in the front of your back hip.",                                             undefined, { equipment: 'home' }),
  e('Cobra Pose',                   'yoga', 'chest / spine',   "Keep elbows soft and press gently through your hands — open the chest without compressing your lower back.",                                   undefined, { equipment: 'home' }),
  e('Bridge Pose',                  'yoga', 'glutes / hips',   "Drive through your heels and squeeze your glutes — a great counter-stretch after sitting for long periods.",                                   undefined, { equipment: 'home' }),
  e('Lizard Pose',                  'yoga', 'hips / groin',    "Walk your front foot to the outside of your hand — one of the deepest hip openers you can do.",                                               undefined, { equipment: 'home' }),
  e('Supine Twist',                 'yoga', 'spine',           "Both shoulders stay flat on the floor — the twist comes from your thoracic spine, not your lower back.",                                       undefined, { equipment: 'home' }),
];
