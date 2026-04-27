import { Exercise } from '../types';

export const EXERCISES_SEED_VERSION = 3;

let idCounter = 1;
const e = (
  name: string,
  category: Exercise['category'],
  muscle: string,
  tip: string,
  type?: Exercise['type'],
): Exercise => ({ id: `default-${idCounter++}`, name, category, muscle, tip, type });

export const defaultExercises: Exercise[] = [

  // ── PUSH ─────────────────────────────────────────────────────────────────
  // Gym / barbell
  e('Barbell Bench Press',       'push', 'chest',           "Drive through your feet and keep your shoulder blades pinched into the bench — power comes from the whole body, not just your arms.",              'compound'),
  e('Incline Barbell Press',     'push', 'upper chest',     "Set the bench at 30°, not 45° — any steeper and your shoulders take over from your chest.",                                                       'compound'),
  e('Overhead Press',            'push', 'shoulders',       "Brace your core and squeeze your glutes — a solid base is what lets your shoulders press more weight.",                                           'compound'),
  e('Dips',                      'push', 'chest / triceps', "Lean forward for chest, stay upright for triceps — go deep enough to feel a genuine stretch.",                                                    'compound'),
  e('Close-Grip Bench Press',    'push', 'triceps',         "Tuck your elbows to your sides — if they flare out, you've turned it into a regular bench press.",                                               'compound'),
  e('Cable Fly',                 'push', 'chest',           "Keep a slight bend in your elbows and think of hugging a barrel — squeeze hard when the cables meet.",                                            'isolation'),
  e('Cable Lateral Raise',       'push', 'side delts',      "Lead with your pinky and keep a soft elbow — no swinging or shrugging the weight up.",                                                           'isolation'),
  e('Tricep Pushdown',           'push', 'triceps',         "Pin your elbows to your sides — if they're drifting back, your back is doing the work.",                                                         'isolation'),
  e('Overhead Tricep Extension', 'push', 'triceps',         "Get a full stretch at the bottom — the long head loves this range and it's what builds the horseshoe shape.",                                    'isolation'),
  e('Machine Chest Press',       'push', 'chest',           "Great for isolating the chest without worrying about balance — squeeze hard at full extension.",                                                  'isolation'),
  e('Pec Deck',                  'push', 'chest',           "Keep your chest up and don't let your elbows travel too far back — a stretch is good, shoulder pain is not.",                                    'isolation'),

  // Dumbbells
  e('DB Bench Press',            'push', 'chest',           "DBs can travel slightly wider than a barbell — use the extra range for a bigger stretch and better contraction.",                                 'compound'),
  e('Incline DB Press',          'push', 'upper chest',     "Touch the DBs together at the top and squeeze — that last inch of range is where upper chest development lives.",                                'compound'),
  e('DB Shoulder Press',         'push', 'shoulders',       "Press in a slight arc rather than straight up — it's more natural for your shoulder joint.",                                                     'compound'),
  e('DB Lateral Raise',          'push', 'side delts',      "Lean slightly forward at the hips — this single adjustment dramatically improves side delt activation.",                                         'isolation'),
  e('DB Front Raise',            'push', 'front delts',     "Raise to eye level, no higher — going above recruits your traps instead of your front delts.",                                                   'isolation'),
  e('DB Fly',                    'push', 'chest',           "Slight bend in the elbows throughout — never straighten your arms or all the load goes straight to your joints.",                                'isolation'),
  e('DB Overhead Tricep Extension', 'push', 'triceps',      "Use one dumbbell with both hands — keep your upper arms vertical and only move your forearms.",                                                  'isolation'),
  e('DB Skull Crusher',          'push', 'triceps',         "Lower with control — the eccentric is where most tricep growth happens.",                                                                         'isolation'),

  // Bodyweight / home
  e('Push-up',                   'push', 'chest',           "Tuck your elbows to about 45° — flaring them wide turns this into a shoulder exercise.",                                                         'compound'),
  e('Wide Push-up',              'push', 'outer chest',     "Hands wider than shoulder-width hits the outer chest — go all the way down every rep.",                                                          'compound'),
  e('Pike Push-up',              'push', 'shoulders',       "Hips high, lower your head toward the floor between your hands — it mimics an overhead press.",                                                  'compound'),
  e('Decline Push-up',           'push', 'upper chest',     "Feet elevated shifts load to upper chest and front delts — keep your body in a straight line.",                                                  'compound'),
  e('Diamond Push-up',           'push', 'triceps',         "Form a diamond with your hands and track your elbows back — pure tricep focus.",                                                                 'isolation'),

  // ── PULL ─────────────────────────────────────────────────────────────────
  // Gym / barbell
  e('Conventional Deadlift',     'pull', 'back / hamstrings', "Hinge at the hips and keep the bar close — it should brush your shins on the way up.",                                                        'compound'),
  e('Barbell Row',               'pull', 'upper back',      "Pull to your belly button with a flat back — drive your elbows past your hips, not just up.",                                                    'compound'),
  e('Lat Pulldown',              'pull', 'lats',            "Lean back slightly and pull to your upper chest — lead with your elbows, not your hands.",                                                       'compound'),
  e('Cable Row',                 'pull', 'mid back',        "Sit tall and pull your elbows behind you — don't rock your torso back and forth for momentum.",                                                  'compound'),
  e('Chest-Supported Row',       'pull', 'upper back',      "Chest stays on the pad the whole time — this removes any temptation to use your lower back.",                                                    'compound'),
  e('Face Pull',                 'pull', 'rear delts',      "Pull to eye level and externally rotate at the end — this exercise keeps your shoulder health in check long term.",                              'isolation'),
  e('Cable Bicep Curl',          'pull', 'biceps',          "Keep your elbows pinned at your sides — the cable keeps tension at the bottom where a dumbbell can't.",                                         'isolation'),
  e('Straight-Arm Pulldown',     'pull', 'lats',            "Arms stay straight throughout — this isolates your lats without any bicep involvement.",                                                         'isolation'),

  // Bodyweight
  e('Pull-up',                   'pull', 'lats',            "Dead hang at the bottom every rep — partial reps only build partial lats.",                                                                       'compound'),
  e('Chin-up',                   'pull', 'biceps / lats',   "Supinated grip hits your biceps more — squeeze at the top and lower slowly with control.",                                                       'compound'),
  e('Inverted Row',              'pull', 'upper back',      "Keep your body in a straight line and pull your chest to the bar — bend your knees to make it easier.",                                          'compound'),
  e('Superman Hold',             'pull', 'lower back',      "Hold at the top and squeeze your glutes — the goal is time under tension, not how high you go.",                                                 'isolation'),

  // Dumbbells
  e('Single-Arm DB Row',         'pull', 'upper back',      "Drive your elbow back past your hip — think less about your hand and more about where your elbow ends up.",                                     'compound'),
  e('DB Pullover',               'pull', 'lats',            "Keep a slight bend in the elbows — lower until you feel a full lats stretch before pulling back over.",                                          'compound'),
  e('DB Bicep Curl',             'pull', 'biceps',          "Full extension at the bottom, all the way up — don't cheat by leaning back.",                                                                    'isolation'),
  e('Hammer Curl',               'pull', 'brachialis',      "Neutral grip hits the brachialis — the muscle that actually makes your arms look thick from the front.",                                         'isolation'),
  e('Incline DB Curl',           'pull', 'biceps',          "The stretch at the bottom is the whole point — let your arms hang fully before you curl.",                                                       'isolation'),
  e('DB Rear Delt Fly',          'pull', 'rear delts',      "Hinge forward and think of spreading wings — your elbows should travel up and out, not back.",                                                   'isolation'),
  e('DB Shrug',                  'pull', 'traps',           "Hold for a beat at the top — elevate straight up, no rolling or rotating your shoulders.",                                                       'isolation'),
  e('DB Reverse Curl',           'pull', 'forearms',        "Overhand grip with neutral wrists — underrated for forearm and grip development.",                                                               'isolation'),

  // ── LEGS ─────────────────────────────────────────────────────────────────
  // Gym / barbell
  e('Barbell Back Squat',        'legs', 'quads / glutes',  "Chest up, brace your core — sit back and down together, keeping your knees tracking over your toes.",                                            'compound'),
  e('Romanian Deadlift',         'legs', 'hamstrings',      "Push your hips back until you feel a deep hamstring stretch — it's a hip hinge, not a knee bend.",                                              'compound'),
  e('Leg Press',                 'legs', 'quads',           "Don't lock your knees at the top — keep constant tension through the full range of motion.",                                                     'compound'),
  e('Bulgarian Split Squat',     'legs', 'quads / glutes',  "Lower until your back knee nearly touches the floor — most people stop way too short and miss the best range.",                                  'compound'),
  e('Hip Thrust',                'legs', 'glutes',          "Drive through your heel and squeeze hard at the top — don't hyperextend your lower back to fake more range.",                                    'compound'),
  e('Hack Squat',                'legs', 'quads',           "The more upright your torso, the more quad-dominant it is — go deep and control the descent.",                                                   'compound'),
  e('Leg Extension',             'legs', 'quads',           "Squeeze at the full extension and slow down the negative — controlled reps beat heavy sloppy ones here.",                                        'isolation'),
  e('Seated Leg Curl',           'legs', 'hamstrings',      "Seated gives a bigger stretch — slow, deliberate reps are far better than loading up and swinging.",                                             'isolation'),
  e('Leg Curl',                  'legs', 'hamstrings',      "Curl all the way up and squeeze — a partial rep is a partial result.",                                                                           'isolation'),
  e('Standing Calf Raise',       'legs', 'calves',          "Full range every rep — all the way up on your toes, all the way down for a full stretch.",                                                       'isolation'),
  e('Seated Calf Raise',         'legs', 'soleus',          "Seated targets the soleus — often the most neglected calf muscle and essential for full calf development.",                                      'isolation'),

  // Dumbbells
  e('DB Goblet Squat',           'legs', 'quads',           "Hold the DB at your chest and sit as deep as you can — great for quad focus and improving hip mobility.",                                        'compound'),
  e('DB Romanian Deadlift',      'legs', 'hamstrings',      "Same hinge pattern as the barbell version — feel the stretch before you come back up.",                                                          'compound'),
  e('DB Lunge',                  'legs', 'quads / glutes',  "Keep your torso tall and step long — your back knee should gently touch the floor each rep.",                                                    'compound'),
  e('DB Step-up',                'legs', 'quads / glutes',  "Full foot on the platform and drive through your heel — don't push off your back foot.",                                                        'compound'),
  e('DB Hip Thrust',             'legs', 'glutes',          "Hold the DB on your hips and brace it — drive through your heel and squeeze hard at the top.",                                                   'compound'),

  // Bodyweight / home
  e('Bodyweight Squat',          'legs', 'quads',           "Arms forward for balance, sit back — if your heels lift, work on ankle mobility or elevate them slightly.",                                     'compound'),
  e('Walking Lunges',            'legs', 'quads / glutes',  "Long stride with an upright torso — let your back knee gently touch the floor every rep.",                                                       'compound'),
  e('Glute Bridge',              'legs', 'glutes',          "Drive your hips up and squeeze at the top — flatten your lower back against the floor first.",                                                   'compound'),
  e('Single-Leg Glute Bridge',   'legs', 'glutes',          "One leg extended, bridge on the other — keep your hips level and don't let one side drop.",                                                     'compound'),
  e('Jump Squat',                'legs', 'quads / explosive', "Land softly with bent knees — the landing is just as important as the jump for your joints.",                                                 'compound'),
  e('Sumo Squat',                'legs', 'glutes / inner thighs', "Wide stance with toes turned out — let your knees track over your toes as you sit into it.",                                             'compound'),
  e('Wall Sit',                  'legs', 'quads',           "Ninety degrees at the knees and hold — when it burns, breathe through it.",                                                                      'isolation'),

  // ── CORE ─────────────────────────────────────────────────────────────────
  // Gym / cable
  e('Cable Crunch',              'core', 'abs',             "Crunch from your abs, not your hips — your pelvis should not move at all during this exercise.",                                                 'isolation'),
  e('Pallof Press',              'core', 'anti-rotation',   "Resist the cable pulling you sideways — this builds the ability to stay stable under real load.",                                                'isolation'),
  e('Landmine Rotation',         'core', 'obliques',        "Drive from your hips and core — the rotation comes from your whole torso, not just your arms.",                                                  'compound'),

  // Bodyweight
  e('Plank',                     'core', 'abs',             "Squeeze your glutes, abs and quads at once — don't let your hips sag or pike.",                                                                  'isolation'),
  e('Hanging Leg Raise',         'core', 'lower abs',       "Control the descent — if you're swinging, your hip flexors are doing the work, not your abs.",                                                  'isolation'),
  e('Ab Wheel Rollout',          'core', 'abs',             "Only go as far as you can without your lower back caving — range comes as your core gets stronger.",                                              'compound'),
  e('Russian Twist',             'core', 'obliques',        "Rotate from your torso, not just your arms — lifting your feet makes it significantly harder.",                                                  'isolation'),
  e('Dead Bug',                  'core', 'core stability',  "Press your lower back firmly into the floor before you move — if it lifts, you've gone too far.",                                               'isolation'),
  e('Side Plank',                'core', 'obliques',        "Hips in line with your shoulders — sagging hips mean your obliques aren't actually working.",                                                   'isolation'),
  e('Reverse Crunch',            'core', 'lower abs',       "Curl your pelvis toward your chest — it's a pelvic tilt, not just a leg raise.",                                                                'isolation'),
  e('Bicycle Crunch',            'core', 'obliques',        "Slow it down and rotate fully — going fast just means neck strain and no ab activation.",                                                       'isolation'),
  e('Dragon Flag',               'core', 'abs',             "Lower as one rigid unit — this demands total body tension and is one of the hardest core exercises there is.",                                    'compound'),
  e('Mountain Climbers',         'core', 'cardio / core',   "Keep your hips level and drive each knee to your chest — form falls apart when you speed up.",                                                   'compound'),
  e('V-Sit Hold',                'core', 'abs',             "Balance on your tailbone with your legs and chest raised — a great test and builder of static abdominal strength.",                              'isolation'),

  // ── CARDIO ───────────────────────────────────────────────────────────────
  // Machines
  e('Treadmill Run',             'cardio', 'cardiovascular', "Land mid-foot and lean slightly forward — heel striking means you're braking with every single step.",                                          'compound'),
  e('Incline Walk',              'cardio', 'cardiovascular', "Hands off the rails and swing your arms — holding on significantly reduces the calorie burn.",                                                   'compound'),
  e('Stationary Bike',           'cardio', 'cardiovascular', "Set the seat so your knee has a slight bend at the very bottom of the stroke.",                                                                 'compound'),
  e('Stair Climber',             'cardio', 'cardiovascular / glutes', "Don't lean on the rails — they're there for safety, not to hold your bodyweight.",                                                    'compound'),
  e('Rowing Machine',            'cardio', 'full body',     "Legs push first, then lean back, then arms pull — reverse exactly on the way back in.",                                                          'compound'),
  e('Assault Bike',              'cardio', 'full body',     "Push with your legs and pull with your arms — the output is entirely determined by you.",                                                        'compound'),

  // Bodyweight / open floor
  e('HIIT Intervals',            'cardio', 'cardiovascular', "Go all-out during the work period — if you can hold a conversation, you're not working hard enough.",                                           'compound'),
  e('Jump Rope',                 'cardio', 'cardiovascular', "Stay on the balls of your feet with small jumps — timing matters more than how hard you jump.",                                                 'compound'),
  e('Battle Ropes',              'cardio', 'full body',     "Brace your core and generate the waves from your whole body — not just your arms.",                                                              'compound'),
  e('Sled Push',                 'cardio', 'full body',     "Flat back, hips low, drive through your heels — it's a full-body effort.",                                                                       'compound'),

  // ── CROSSFIT ─────────────────────────────────────────────────────────────
  // Olympic / barbell
  e('Power Clean',               'crossfit', 'full body',   "Drive through your legs first, then shrug — it's a jump with a shrug, not a bicep curl.",                                                       'compound'),
  e('Snatch',                    'crossfit', 'full body',   "Bar stays close to your body throughout — think of it brushing your legs and hips all the way up.",                                             'compound'),
  e('Clean & Jerk',              'crossfit', 'full body',   "Two separate movements — nail the front rack catch before you even think about the jerk.",                                                       'compound'),
  e('Thrusters',                 'crossfit', 'full body',   "Squat deep and use leg drive to push the bar overhead — one fluid, powerful movement.",                                                         'compound'),

  // Kettlebell / dumbbell
  e('Kettlebell Swing',          'crossfit', 'posterior chain', "It's a hip hinge, not a squat — the power comes from snapping your hips forward explosively.",                                             'compound'),

  // Bodyweight / gymnastics
  e('Box Jumps',                 'crossfit', 'explosive legs', "Land softly with bent knees — the jump builds power, the landing protects your joints.",                                                     'compound'),
  e('Burpees',                   'crossfit', 'full body',   "Keep your hips level in the plank — don't let them sag or pike while you catch your breath.",                                                   'compound'),
  e('Wall Balls',                'crossfit', 'full body',   "Full squat depth every rep — release the ball on the way up out of the hole, not at the top.",                                                  'compound'),
  e('Double-Unders',             'crossfit', 'cardiovascular', "Jump slightly higher and relax your wrists — the rope does the work, not your arms.",                                                        'compound'),
  e('Kipping Pull-up',           'crossfit', 'back',        "Generate the swing from your hips — the kip assists the pull, it doesn't replace it.",                                                         'compound'),
  e('Handstand Push-up',         'crossfit', 'shoulders',   "Get comfortable holding against a wall first — it's just a strict shoulder press.",                                                             'compound'),
  e('Toes-to-Bar',               'crossfit', 'core',        "Engage your lats and swing from your shoulders — control the descent or the kip falls apart.",                                                  'isolation'),

  // ── FULL BODY ─────────────────────────────────────────────────────────────
  // Barbell
  e('Clean & Press',             'fullbody', 'full body',   "Nail the front rack position on the catch before you press — two movements linked, both done right.",                                           'compound'),
  e('Barbell Complex',           'fullbody', 'full body',   "Light weight, zero rest between movements — this is conditioning work, not a strength session.",                                                'compound'),

  // Dumbbell / kettlebell
  e('Turkish Get-Up',            'fullbody', 'full body',   "Move deliberately through each position — this is a skill as much as a strength exercise.",                                                     'compound'),
  e('Man Makers',                'fullbody', 'full body',   "Control each transition — row, push-up, squat, press — don't rush through the complexity.",                                                     'compound'),
  e('Renegade Row',              'fullbody', 'full body',   "Minimize hip rotation as you row — the goal is to stay perfectly square, not twist.",                                                           'compound'),
  e('DB Complex',                'fullbody', 'full body',   "Move through each exercise without putting the weights down — builds conditioning and strength at the same time.",                              'compound'),
  e('KB Snatch',                 'fullbody', 'full body',   "Drive from your hips and guide the bell overhead — punch through at the top for a locked-out finish.",                                         'compound'),

  // Bodyweight / loaded carry
  e('Farmers Carry',             'fullbody', 'grip / core', "Stand tall with shoulders back — the weight wants to pull you down, your job is to resist that the whole way.",                                'compound'),
  e('Suitcase Deadlift',         'fullbody', 'full body',   "Weight on one side, hinge and pull — great for anti-lateral flexion and real-world core strength.",                                             'compound'),

  // ── YOGA ─────────────────────────────────────────────────────────────────
  // No type tags — compound/isolation ordering doesn't apply to yoga
  e('Sun Salutation',            'yoga', 'full body',       "Move with your breath — inhale to lengthen and open, exhale to fold and soften."),
  e('Downward Dog',              'yoga', 'hamstrings / shoulders', "Press the floor away and drive your hips up and back — your heels don't need to touch the floor."),
  e('Warrior I',                 'yoga', 'hips / quads',    "Square your hips forward and reach actively through your fingertips — feel the stretch through your back hip."),
  e('Warrior II',                'yoga', 'hips / quads',    "Sink your back hip down and gaze over your front fingers — hold it and breathe, don't rush."),
  e('Pigeon Pose',               'yoga', 'hips',            "Ease in slowly and breathe through the tightness — this one opens with patience, not force."),
  e("Child's Pose",              'yoga', 'back / hips',     "Reach your arms forward and let gravity do the work — a great reset between harder poses."),
  e('Triangle Pose',             'yoga', 'obliques / hips', "Don't collapse your chest — rotate it open toward the ceiling and breathe."),
  e('Seated Forward Fold',       'yoga', 'hamstrings',      "Hinge from your hips, not your lower back — reach for your feet, not the floor."),
  e('Cat-Cow',                   'yoga', 'spine',           "Move slowly through each vertebra — great for waking up or cooling down the spine."),
  e('Low Lunge',                 'yoga', 'hip flexors',     "Drop your back knee and push your hips forward — feel the stretch in the front of your back hip."),
  e('Cobra Pose',                'yoga', 'chest / spine',   "Keep elbows soft and press gently through your hands — open the chest without compressing your lower back."),
  e('Bridge Pose',               'yoga', 'glutes / hips',   "Drive through your heels and squeeze your glutes — a great counter-stretch after sitting for long periods."),
  e('Lizard Pose',               'yoga', 'hips / groin',    "Walk your front foot to the outside of your hand — one of the deepest hip openers you can do."),
  e('Supine Twist',              'yoga', 'spine',           "Both shoulders stay flat on the floor — the twist comes from your thoracic spine, not your lower back."),
];
