const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const EXERCISES_DATA = [
  // PUSH A & B EXERCISES
  {
    name: "Barbell Bench Press",
    primaryMuscle: "Chest",
    secondaryMuscles: JSON.stringify(["Triceps", "Front Deltoids"]),
    equipment: "Barbell, Flat Bench",
    category: "Chest",
    difficulty: "Intermediate",
    instructions: "Lie flat on the bench with feet firmly planted. Grip the barbell slightly wider than shoulder-width. Unrack, lower bar with control to mid-chest while tucking elbows slightly (45-75 degrees). Press upwards explosively until arms are extended without locking hard.",
    formCues: JSON.stringify(["Retract and depress shoulder blades", "Maintain natural lower back arch", "Drive through legs", "Keep wrists stacked directly over elbows"]),
    commonMistakes: JSON.stringify(["Flaring elbows at 90 degrees", "Bouncing bar off chest", "Lifting hips off the bench"]),
    safetyNotes: "Always use safety pins or a reliable spotter when training near failure.",
    setsRepsTarget: "3 x 6-8",
    restSeconds: 150,
    variations: JSON.stringify(["Dumbbell Bench Press", "Floor Press", "Touch-and-Go Bench Press"]),
    substitutions: JSON.stringify(["Machine Chest Press", "Heavy Dumbbell Flat Press", "Weighted Dip"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0025.gif"
  },
  {
    name: "Incline Dumbbell Press",
    primaryMuscle: "Chest",
    secondaryMuscles: JSON.stringify(["Front Deltoids", "Triceps"]),
    equipment: "Dumbbells, Incline Bench (30-45 deg)",
    category: "Chest",
    difficulty: "Intermediate",
    instructions: "Set bench at a 30-degree incline. Sit down with dumbbells resting on knees. Kick dumbbells up to shoulder level, retract scapulae, and press weights up with a slight inward arc without clanging dumbbells.",
    formCues: JSON.stringify(["Set incline to 30 degrees to avoid over-emphasizing shoulders", "Control the eccentric descent for 2-3 seconds", "Chest tall and shoulders pulled back"]),
    commonMistakes: JSON.stringify(["Bench set too steep (45+ degrees)", "Arching excessively to flatten angle", "Dropping dumbbells abruptly"]),
    safetyNotes: "Lower dumbbells carefully to knees when finishing a set.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 120,
    variations: JSON.stringify(["Incline Barbell Bench Press", "Low-Incline Dumbbell Press"]),
    substitutions: JSON.stringify(["Incline Smith Machine Press", "Incline Cable Press"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0314.gif"
  },
  {
    name: "Seated Dumbbell Shoulder Press",
    primaryMuscle: "Shoulders",
    secondaryMuscles: JSON.stringify(["Triceps", "Upper Chest"]),
    equipment: "Dumbbells, Adjustable Bench",
    category: "Shoulders",
    difficulty: "Intermediate",
    instructions: "Sit upright with back supported. Hold dumbbells at shoulder level, palms facing forward or slightly angled (neutral-to-pronated). Press vertically until arms are fully extended overhead.",
    formCues: JSON.stringify(["Brace core to keep ribs down", "Do not hyperextend lower back", "Full controlled range of motion down to ear level"]),
    commonMistakes: JSON.stringify(["Excessive lumbar arching", "Incomplete range of motion", "Elbows flaring excessively behind torso"]),
    safetyNotes: "Keep feet flat on the floor to stabilize your kinetic chain.",
    setsRepsTarget: "3 x 8-10",
    restSeconds: 120,
    variations: JSON.stringify(["Standing Overhead Barbell Press", "Neutral Grip DB Shoulder Press"]),
    substitutions: JSON.stringify(["Machine Shoulder Press", "Arnold Press"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0377.gif"
  },
  {
    name: "Cable Lateral Raise",
    primaryMuscle: "Shoulders",
    secondaryMuscles: JSON.stringify(["Traps"]),
    equipment: "Cable Machine, D-Handle",
    category: "Shoulders",
    difficulty: "Beginner",
    instructions: "Set cable pulley at wrist or knee height. Stand with cable behind or in front of body. Raise arm outward in scapular plane (slight 15-20 degree forward angle) until parallel with floor.",
    formCues: JSON.stringify(["Lead with elbows, not wrists", "Maintain continuous tension at the bottom", "Slight forward torso lean"]),
    commonMistakes: JSON.stringify(["Shrugging traps to hoist weight", "Swinging torso for momentum", "Raising hands higher than elbows"]),
    safetyNotes: "Select moderate weights that allow pristine form without neck straining.",
    setsRepsTarget: "3 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Dumbbell Lateral Raise", "Behind-the-Back Cable Lateral Raise"]),
    substitutions: JSON.stringify(["Machine Lateral Raise", "Dumbbell Lateral Raise"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0178.gif"
  },
  {
    name: "Rope Triceps Pushdown",
    primaryMuscle: "Triceps",
    secondaryMuscles: JSON.stringify(["Forearms"]),
    equipment: "Cable Machine, Rope Attachment",
    category: "Triceps",
    difficulty: "Beginner",
    instructions: "Attach rope to high pulley. Stand with slight forward torso lean. Pin elbows by your ribs. Extend elbows fully down and spread the rope apart at the bottom contraction.",
    formCues: JSON.stringify(["Keep upper arms glued to torso", "Pause 1 second at full lockout", "Control the return up to 90 degrees"]),
    commonMistakes: JSON.stringify(["Letting elbows drift forward and back", "Using bodyweight to press down", "Half reps"]),
    safetyNotes: "Maintain wrist neutrality to prevent forearm strain.",
    setsRepsTarget: "3 x 10-15",
    restSeconds: 90,
    variations: JSON.stringify(["Straight-Bar Pushdown", "V-Bar Pushdown"]),
    substitutions: JSON.stringify(["Straight-Bar Triceps Pushdown", "Dips"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0200.gif"
  },
  {
    name: "Overhead Cable Triceps Extension",
    primaryMuscle: "Triceps",
    secondaryMuscles: JSON.stringify(["Core"]),
    equipment: "Cable Machine, Rope Attachment",
    category: "Triceps",
    difficulty: "Intermediate",
    instructions: "Facing away from cable, hold rope behind head with elbows pointed forward. Lean forward in a staggered stance. Extend elbows forward and up to full extension, emphasizing long head stretch.",
    formCues: JSON.stringify(["Feel deep stretch on long head of triceps behind head", "Keep elbows stable and pointed forwards", "Brace core against cable pull"]),
    commonMistakes: JSON.stringify(["Excessive lumbar arching", "Flaring elbows wide"]),
    safetyNotes: "Step forward into a staggered stance for rock-solid stability.",
    setsRepsTarget: "2 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Overhead Dumbbell Extension", "Cable French Press"]),
    substitutions: JSON.stringify(["Overhead Dumbbell Triceps Extension", "Skull Crushers"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0193.gif"
  },
  {
    name: "Incline Barbell Bench Press",
    primaryMuscle: "Chest",
    secondaryMuscles: JSON.stringify(["Front Deltoids", "Triceps"]),
    equipment: "Barbell, Incline Bench",
    category: "Chest",
    difficulty: "Intermediate",
    instructions: "Position on 30-degree incline bench. Grip barbell slightly wider than shoulder width. Lower bar with control to upper chest/clavicle area. Press explosively back to starting position.",
    formCues: JSON.stringify(["Keep shoulder blades retracted", "Lower bar under control (2-3s)", "Touch upper sternum cleanly"]),
    commonMistakes: JSON.stringify(["Excessive arch turning it into flat bench", "Bouncing bar", "Incomplete depth"]),
    safetyNotes: "Always use safety arms or a spotter.",
    setsRepsTarget: "3 x 6-10",
    restSeconds: 150,
    variations: JSON.stringify(["Incline Dumbbell Press", "Incline Smith Machine Press"]),
    substitutions: JSON.stringify(["Incline Dumbbell Press", "Machine Chest Press"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0047.gif"
  },
  {
    name: "Machine Chest Press",
    primaryMuscle: "Chest",
    secondaryMuscles: JSON.stringify(["Front Deltoids", "Triceps"]),
    equipment: "Chest Press Machine",
    category: "Chest",
    difficulty: "Beginner",
    instructions: "Adjust seat so handles align with mid-chest. Sit back firmly against pad. Push handles forward until arms are almost fully extended, squeeze chest, and return slowly with a deep stretch.",
    formCues: JSON.stringify(["Chest high throughout", "Focus on squeezing pecs together", "Do not shrug shoulders"]),
    commonMistakes: JSON.stringify(["Setting seat too low or too high", "Locking elbows harshly"]),
    safetyNotes: "Machine track provides safe failure threshold without spotter.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 90,
    variations: JSON.stringify(["Converging Chest Press", "Single-Arm Machine Press"]),
    substitutions: JSON.stringify(["Dumbbell Bench Press", "Push-Ups"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0314.gif"
  },
  {
    name: "Cable Chest Fly",
    primaryMuscle: "Chest",
    secondaryMuscles: JSON.stringify(["Front Deltoids"]),
    equipment: "Dual Cable Machine",
    category: "Chest",
    difficulty: "Intermediate",
    instructions: "Set pulleys at chest height. Take handles, step forward with staggered stance. With slight bend in elbows, bring hands together in a hugging motion until knuckles touch. Squeeze pecs hard.",
    formCues: JSON.stringify(["Imagine hugging a wide barrel", "Keep elbow angle fixed throughout", "Control the stretch"]),
    commonMistakes: JSON.stringify(["Turning the fly into a press", "Bending elbows too much during eccentric"]),
    safetyNotes: "Do not hyperextend shoulders backward past comfort range.",
    setsRepsTarget: "2 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Incline Cable Fly", "Pec Deck Fly"]),
    substitutions: JSON.stringify(["Dumbbell Fly", "Pec Deck Machine"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0171.gif"
  },
  {
    name: "Machine Shoulder Press",
    primaryMuscle: "Shoulders",
    secondaryMuscles: JSON.stringify(["Triceps", "Upper Chest"]),
    equipment: "Overhead Shoulder Press Machine",
    category: "Shoulders",
    difficulty: "Beginner",
    instructions: "Adjust seat so handles start around ear level. Sit upright with back against pad. Press upwards in controlled motion. Lower slowly to ear level without letting weights slam.",
    formCues: JSON.stringify(["Maintain neutral spine against pad", "Breathe out as you press up", "Keep wrists straight"]),
    commonMistakes: JSON.stringify(["Arching lower back off pad", "Rebounding at the bottom"]),
    safetyNotes: "Great safe alternative to free-weight overhead pressing.",
    setsRepsTarget: "2 x 8-12",
    restSeconds: 90,
    variations: JSON.stringify(["Neutral Grip Machine Press", "Single-Arm Machine Press"]),
    substitutions: JSON.stringify(["Seated Dumbbell Shoulder Press", "Smith Machine OHP"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0377.gif"
  },
  {
    name: "Dumbbell Lateral Raise",
    primaryMuscle: "Shoulders",
    secondaryMuscles: JSON.stringify(["Traps"]),
    equipment: "Dumbbells",
    category: "Shoulders",
    difficulty: "Beginner",
    instructions: "Stand with dumbbells at sides, slight bend in knees and hips. Raise dumbbells out to sides in slight scapular plane until parallel to floor. Lower with a 2-second eccentric.",
    formCues: JSON.stringify(["Pour out the water cue (pinky slightly up/level)", "Lead with elbows", "Slight forward torso pitch"]),
    commonMistakes: JSON.stringify(["Using body swing", "Shrugging neck to ears", "Using too much weight"]),
    safetyNotes: "Quality over weight for lateral deltoid isolation.",
    setsRepsTarget: "3 x 12-20",
    restSeconds: 90,
    variations: JSON.stringify(["Cable Lateral Raise", "Seated DB Lateral Raise"]),
    substitutions: JSON.stringify(["Cable Lateral Raise", "Machine Lateral Raise"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0334.gif"
  },
  {
    name: "Straight-Bar Triceps Pushdown",
    primaryMuscle: "Triceps",
    secondaryMuscles: JSON.stringify(["Forearms"]),
    equipment: "Cable Machine, Straight Bar",
    category: "Triceps",
    difficulty: "Beginner",
    instructions: "Grip straight bar overhand with shoulder-width spacing. Lock elbows by ribcage. Press bar down until elbows lock out fully. Control bar back up to 90 degrees.",
    formCues: JSON.stringify(["Keep shoulders down and back", "Keep elbows fixed in place", "Squeeze triceps at bottom"]),
    commonMistakes: JSON.stringify(["Leaning excessively over the bar", "Letting elbows travel back and forth"]),
    safetyNotes: "Keep wrists aligned with forearms.",
    setsRepsTarget: "3 x 10-15",
    restSeconds: 90,
    variations: JSON.stringify(["V-Bar Pushdown", "Rope Pushdown"]),
    substitutions: JSON.stringify(["Rope Triceps Pushdown", "Triceps Dips"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0201.gif"
  },
  {
    name: "Overhead Dumbbell Triceps Extension",
    primaryMuscle: "Triceps",
    secondaryMuscles: JSON.stringify(["Core"]),
    equipment: "Single Heavy Dumbbell, Bench",
    category: "Triceps",
    difficulty: "Intermediate",
    instructions: "Sit on bench. Hold dumbbell with both hands forming a diamond under the top plate. Lower dumbbell behind head by bending elbows, then press back overhead.",
    formCues: JSON.stringify(["Keep elbows pointing towards the ceiling", "Get a deep stretch at the bottom", "Keep core engaged"]),
    commonMistakes: JSON.stringify(["Flaring elbows wide", "Hitting head with dumbbell"]),
    safetyNotes: "Check grip security carefully before lifting dumbbell over head.",
    setsRepsTarget: "2 x 10-15",
    restSeconds: 90,
    variations: JSON.stringify(["Overhead Cable Triceps Extension", "EZ-Bar French Press"]),
    substitutions: JSON.stringify(["Overhead Cable Triceps Extension", "Skull Crushers"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0092.gif"
  },

  // PULL A & B EXERCISES
  {
    name: "Lat Pulldown",
    primaryMuscle: "Back",
    secondaryMuscles: JSON.stringify(["Biceps", "Rear Deltoids", "Forearms"]),
    equipment: "Lat Pulldown Machine, Wide Bar",
    category: "Back",
    difficulty: "Beginner",
    instructions: "Grip bar slightly wider than shoulder width. Sit with thighs secured under pads. Lean back 10-15 degrees. Pull bar down to upper chest, pulling elbows down and back. Let bar return slowly to full lat stretch.",
    formCues: JSON.stringify(["Think of pulling with your elbows", "Depress scapulae first before pulling", "Chest up to meet the bar"]),
    commonMistakes: JSON.stringify(["Swinging torso excessively", "Pulling behind the neck", "Incomplete range of motion"]),
    safetyNotes: "Always pull to front of chest, never behind neck.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 120,
    variations: JSON.stringify(["Close-Grip Pulldown", "Neutral-Grip Lat Pulldown"]),
    substitutions: JSON.stringify(["Pull-ups", "Assisted Pull-ups"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/2330.gif"
  },
  {
    name: "Chest-Supported Row",
    primaryMuscle: "Back",
    secondaryMuscles: JSON.stringify(["Rear Deltoids", "Biceps", "Rhomboids"]),
    equipment: "Incline Bench, Dumbbells or T-Bar Machine",
    category: "Back",
    difficulty: "Beginner",
    instructions: "Lie chest down on an incline bench set to 30-45 degrees. Let arms hang with dumbbells. Pull dumbbells toward hips, driving elbows back and squeezing shoulder blades together.",
    formCues: JSON.stringify(["Keep sternum glued to pad", "Pull elbows towards back pockets", "Squeeze upper back at top"]),
    commonMistakes: JSON.stringify(["Lifting chest off pad", "Jerking the weights"]),
    safetyNotes: "Chest support completely unloads the lower back, allowing safe maximal back isolation.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 90,
    variations: JSON.stringify(["T-Bar Supported Row", "Seal Row"]),
    substitutions: JSON.stringify(["Seated Cable Row", "Barbell Bent-Over Row"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0293.gif"
  },
  {
    name: "Seated Cable Row",
    primaryMuscle: "Back",
    secondaryMuscles: JSON.stringify(["Biceps", "Forearms", "Lower Back"]),
    equipment: "Low Cable Row Machine, V-Bar Attachment",
    category: "Back",
    difficulty: "Intermediate",
    instructions: "Sit with feet on footplates, knees slightly bent. Grasp handle with arms extended. Sit upright with chest proud. Pull handle into lower abdomen while driving elbows back. Return with controlled stretch.",
    formCues: JSON.stringify(["Keep torso upright with slight natural hinge", "Do not round lower back", "Full stretch forward followed by strong retraction"]),
    commonMistakes: JSON.stringify(["Rocking back and forth using momentum", "Rounding thoracic/lumbar spine"]),
    safetyNotes: "Keep knees slightly bent to protect hamstrings and lower back.",
    setsRepsTarget: "2 x 10-12",
    restSeconds: 90,
    variations: JSON.stringify(["Wide-Grip Seated Row", "Single-Arm Cable Row"]),
    substitutions: JSON.stringify(["Chest-Supported Row", "Dumbbell One-Arm Row"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0861.gif"
  },
  {
    name: "Reverse Pec Deck",
    primaryMuscle: "Shoulders",
    secondaryMuscles: JSON.stringify(["Upper Back", "Traps", "Rhomboids"]),
    equipment: "Pec Deck / Rear Delt Machine",
    category: "Shoulders",
    difficulty: "Beginner",
    instructions: "Sit facing the machine with chest against pad. Adjust seat so handles are at shoulder height. With elbows slightly bent, sweep arms outward in horizontal arc until hands are in line with shoulders.",
    formCues: JSON.stringify(["Lead with elbows moving backwards", "Keep shoulders depressed", "Control the negative return"]),
    commonMistakes: JSON.stringify(["Using traps and shrugging", "Bending arms into a row"]),
    safetyNotes: "Isolates the posterior deltoid crucial for shoulder balance and posture.",
    setsRepsTarget: "3 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Bent-Over Dumbbell Lateral Raise", "Face Pulls"]),
    substitutions: JSON.stringify(["Face Pulls", "Bent-Over DB Rear Delt Fly"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0203.gif"
  },
  {
    name: "Dumbbell Biceps Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: JSON.stringify(["Forearms", "Brachialis"]),
    equipment: "Dumbbells",
    category: "Biceps",
    difficulty: "Beginner",
    instructions: "Stand tall with dumbbells in hand, palms facing forward or neutral. Curl dumbbells upward while supinating wrists (palms up at top). Squeeze biceps at peak and lower with control.",
    formCues: JSON.stringify(["Pin elbows by your side", "Full range of motion down to straight arm", "Supinate wrist as you curl up"]),
    commonMistakes: JSON.stringify(["Swinging hips for momentum", "Letting elbows drift forward excessively"]),
    safetyNotes: "Avoid locking out harshly at the bottom under heavy loads.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 90,
    variations: JSON.stringify(["Incline DB Curl", "Alternating DB Curl"]),
    substitutions: JSON.stringify(["EZ-Bar Curl", "Cable Biceps Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0294.gif"
  },
  {
    name: "Hammer Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: JSON.stringify(["Brachialis", "Brachioradialis", "Forearms"]),
    equipment: "Dumbbells",
    category: "Biceps",
    difficulty: "Beginner",
    instructions: "Hold dumbbells with neutral grip (palms facing each other). Keep elbows stationary, curl dumbbells up toward shoulder level. Lower slowly.",
    formCues: JSON.stringify(["Keep palms facing each other the entire rep", "Target brachialis for arm thickness", "Control 2-second descent"]),
    commonMistakes: JSON.stringify(["Swinging torso", "Using momentum"]),
    safetyNotes: "Neutral wrist orientation reduces bicep tendon strain.",
    setsRepsTarget: "2 x 10-12",
    restSeconds: 90,
    variations: JSON.stringify(["Rope Cable Hammer Curl", "Cross-Body Hammer Curl"]),
    substitutions: JSON.stringify(["Rope Cable Hammer Curl", "Reverse Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0165.gif"
  },
  {
    name: "Wrist Curl",
    primaryMuscle: "Forearms",
    secondaryMuscles: JSON.stringify(["Grip"]),
    equipment: "Dumbbells or Barbell, Flat Bench",
    category: "Forearms",
    difficulty: "Beginner",
    instructions: "Rest forearms on bench with wrists hanging over the edge, palms facing up. Allow dumbbell to roll down fingers slightly, then curl weight upward using wrist flexors.",
    formCues: JSON.stringify(["Full range of motion at wrist joint", "Keep forearms flat against bench pad"]),
    commonMistakes: JSON.stringify(["Lifting forearms off bench", "Using overly heavy weight"]),
    safetyNotes: "Use light to moderate weight with high repetitions for joint health.",
    setsRepsTarget: "2 x 12-20",
    restSeconds: 60,
    variations: JSON.stringify(["Barbell Wrist Curl", "Behind-the-Back Barbell Wrist Curl"]),
    substitutions: JSON.stringify(["Farmer's Carry", "Plate Pinch Hold"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0125.gif"
  },
  {
    name: "Pull-ups or assisted pull-ups",
    primaryMuscle: "Back",
    secondaryMuscles: JSON.stringify(["Biceps", "Rear Deltoids", "Forearms"]),
    equipment: "Pull-up Bar or Assisted Pull-up Machine",
    category: "Back",
    difficulty: "Intermediate",
    instructions: "Grip bar slightly wider than shoulder-width with overhand grip. Hang with arms straight. Pull body up by driving elbows down to your ribs until chin clears bar. Lower under control to dead hang.",
    formCues: JSON.stringify(["Depress scapulae first", "Drive elbows toward ribcage", "Keep core engaged to prevent swinging"]),
    commonMistakes: JSON.stringify(["Kicking legs for momentum", "Half reps without full extension"]),
    safetyNotes: "Use resistance bands or assisted machine if unable to complete 6 strict bodyweight reps.",
    setsRepsTarget: "3 x 6-10",
    restSeconds: 150,
    variations: JSON.stringify(["Chin-ups", "Neutral-Grip Pull-ups"]),
    substitutions: JSON.stringify(["Lat Pulldown", "Assisted Pull-up Machine"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0017.gif"
  },
  {
    name: "Barbell Bent-Over Row",
    primaryMuscle: "Back",
    secondaryMuscles: JSON.stringify(["Biceps", "Lower Back", "Hamstrings"]),
    equipment: "Barbell, Weight Plates",
    category: "Back",
    difficulty: "Intermediate",
    instructions: "Hinge at hips with knees slightly bent and torso roughly 45 degrees to floor. Grip barbell overhand shoulder-width. Row bar up to lower ribcage/navel, keeping elbows close. Lower under control.",
    formCues: JSON.stringify(["Maintain neutral flat spine throughout", "Brace core as in a deadlift", "Pull bar toward belly button"]),
    commonMistakes: JSON.stringify(["Rounding lumbar spine", "Jerking torso upright on each rep"]),
    safetyNotes: "Drop the weight if form breaks down to protect lower back.",
    setsRepsTarget: "3 x 8-10",
    restSeconds: 120,
    variations: JSON.stringify(["Underhand Barbell Row (Yates)", "Pendlay Row"]),
    substitutions: JSON.stringify(["Chest-Supported Row", "Seated Cable Row"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0027.gif"
  },
  {
    name: "Straight-Arm Cable Pulldown",
    primaryMuscle: "Back",
    secondaryMuscles: JSON.stringify(["Triceps", "Abs"]),
    equipment: "Cable Machine, Straight or Rope Attachment",
    category: "Back",
    difficulty: "Beginner",
    instructions: "Stand facing high pulley with arms extended holding bar. With slight torso lean and slight bend in elbows, pull bar down in an arc to thighs using pure lat contraction.",
    formCues: JSON.stringify(["Keep elbows locked at a slight angle", "Depress shoulders and feel lats contract", "Pause 1s at thighs"]),
    commonMistakes: JSON.stringify(["Bending arms into a tricep pushdown", "Swinging upper body"]),
    safetyNotes: "Great isolation movement with zero spinal loading.",
    setsRepsTarget: "2 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Dumbbell Pullover", "Rope Straight-Arm Pulldown"]),
    substitutions: JSON.stringify(["Dumbbell Pullover", "Lat Pulldown"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0199.gif"
  },
  {
    name: "Face Pulls",
    primaryMuscle: "Shoulders",
    secondaryMuscles: JSON.stringify(["Rear Deltoids", "Rotator Cuff", "Rhomboids", "Traps"]),
    equipment: "Cable Machine, Rope Attachment",
    category: "Shoulders",
    difficulty: "Beginner",
    instructions: "Set pulley at eye level. Hold rope with thumbs facing backwards. Step back, pull rope directly towards face, flaring elbows wide and rotating wrists back in a double-bicep pose.",
    formCues: JSON.stringify(["Pull hands apart towards temples", "Externally rotate shoulders at end of pull", "Lead with elbows high"]),
    commonMistakes: JSON.stringify(["Using too much weight and leaning backwards", "Pulling down to chest instead of face"]),
    safetyNotes: "Crucial for shoulder longevity and rotator cuff balance.",
    setsRepsTarget: "3 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Band Face Pulls", "High Cable Face Pulls"]),
    substitutions: JSON.stringify(["Reverse Pec Deck", "Bent-Over DB Rear Delt Fly"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0203.gif"
  },
  {
    name: "EZ-Bar Preacher Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: JSON.stringify(["Forearms"]),
    equipment: "Preacher Bench, EZ-Bar",
    category: "Biceps",
    difficulty: "Intermediate",
    instructions: "Sit at preacher bench with armpits snug against top pad. Grip inner curves of EZ-bar. Curl bar up towards chin. Lower with strict control until arms are almost straight without hyperextending elbows.",
    formCues: JSON.stringify(["Do not hyperextend at bottom", "Strict isolation without shoulder involvement", "Squeeze peak bicep contraction"]),
    commonMistakes: JSON.stringify(["Dropping weight quickly to bottom bounce", "Lifting hips off seat"]),
    safetyNotes: "Stop 5 degrees short of full lockout to protect the distal bicep tendon.",
    setsRepsTarget: "3 x 10-12",
    restSeconds: 90,
    variations: JSON.stringify(["Dumbbell Preacher Curl", "Machine Preacher Curl"]),
    substitutions: JSON.stringify(["Dumbbell Preacher Curl", "Incline Dumbbell Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0070.gif"
  },
  {
    name: "Incline Dumbbell Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: JSON.stringify(["Forearms"]),
    equipment: "Incline Bench (45-60 deg), Dumbbells",
    category: "Biceps",
    difficulty: "Intermediate",
    instructions: "Sit on incline bench reclined to 45-60 degrees. Let arms hang straight down behind torso. Curl dumbbells up while keeping elbows pinned back, producing deep stretch on long head.",
    formCues: JSON.stringify(["Keep elbows back behind torso for maximal long-head stretch", "Supinate wrists at top", "Slow controlled eccentric"]),
    commonMistakes: JSON.stringify(["Swinging elbows forward to cheat", "Setting bench angle too low"]),
    safetyNotes: "Avoid over-stretching shoulder joint; 45 to 60 degrees is ideal.",
    setsRepsTarget: "2 x 10-12",
    restSeconds: 90,
    variations: JSON.stringify(["Seated Alternating DB Curl", "Spider Curl"]),
    substitutions: JSON.stringify(["EZ-Bar Preacher Curl", "Cable Bicep Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0072.gif"
  },
  {
    name: "Reverse Wrist Curl",
    primaryMuscle: "Forearms",
    secondaryMuscles: JSON.stringify(["Wrist Extensors"]),
    equipment: "Dumbbells or Barbell, Flat Bench",
    category: "Forearms",
    difficulty: "Beginner",
    instructions: "Rest forearms on bench with wrists hanging over edge, palms facing DOWN. Curl weight upward using wrist extensor muscles. Lower under control.",
    formCues: JSON.stringify(["Focus on wrist extensors on top of forearm", "Keep forearms pressed flat on bench"]),
    commonMistakes: JSON.stringify(["Using excessive weight", "Jerking the movement"]),
    safetyNotes: "Key for preventing golfer/tennis elbow imbalances.",
    setsRepsTarget: "2 x 15-20",
    restSeconds: 60,
    variations: JSON.stringify(["Standing Cable Reverse Wrist Curl"]),
    substitutions: JSON.stringify(["Reverse Barbell Curl", "Farmer's Walk"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0994.gif"
  },

  // LEGS A & B EXERCISES
  {
    name: "Barbell Back Squat",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: JSON.stringify(["Glutes", "Hamstrings", "Lower Back", "Calves", "Core"]),
    equipment: "Barbell, Squat Rack",
    category: "Quadriceps",
    difficulty: "Advanced",
    instructions: "Rest barbell across upper traps (high bar) or rear delts (low bar). Stand feet shoulder-width apart, toes turned slightly out. Inhale, brace core with Valsalva maneuver, break at hips and knees simultaneously. Squat down until thighs are parallel or below. Drive out of hole through midfoot.",
    formCues: JSON.stringify(["Brace 360-degree core pressure", "Keep knees tracking over toes", "Chest proud, spine neutral", "Drive floor away"]),
    commonMistakes: JSON.stringify(["Knees caving inwards (valgus)", "Heels lifting off floor", "Rounding lower back (butt wink)"]),
    safetyNotes: "Always set safety catches at proper depth in the power rack.",
    setsRepsTarget: "3 x 6-8",
    restSeconds: 180,
    variations: JSON.stringify(["Front Squat", "Box Squat", "Paused Squat"]),
    substitutions: JSON.stringify(["Leg Press", "Hack Squat", "Goblet Squat"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/1461.gif"
  },
  {
    name: "Romanian Deadlift",
    primaryMuscle: "Hamstrings",
    secondaryMuscles: JSON.stringify(["Glutes", "Lower Back", "Forearms", "Core"]),
    equipment: "Barbell or Dumbbells",
    category: "Hamstrings",
    difficulty: "Intermediate",
    instructions: "Stand tall holding barbell with overhand grip at thighs. Soften knees slightly. Hinge back at hips, pushing butt towards wall behind you while keeping bar skimming down your legs. Lower until hamstrings are fully stretched (around mid-shin). Drive hips forward to stand.",
    formCues: JSON.stringify(["Hips move backward, knees remain soft but static", "Bar stays in contact with shins/thighs", "Flat spine from neck to tailbone"]),
    commonMistakes: JSON.stringify(["Squatting down instead of hip hinging", "Rounding lower back", "Allowing bar to drift away from legs"]),
    safetyNotes: "Do not exceed hamstring flexibility; stop when hips stop moving backward.",
    setsRepsTarget: "3 x 8-10",
    restSeconds: 150,
    variations: JSON.stringify(["Dumbbell RDL", "Single-Leg RDL"]),
    substitutions: JSON.stringify(["Dumbbell Romanian Deadlift", "Seated Leg Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0085.gif"
  },
  {
    name: "Leg Press",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: JSON.stringify(["Glutes", "Hamstrings", "Calves"]),
    equipment: "45-Degree Leg Press Machine",
    category: "Quadriceps",
    difficulty: "Intermediate",
    instructions: "Sit with back and head flat against seat. Place feet shoulder-width on platform. Disengage safety catches. Lower sled until knees reach 90-degree angle without pelvis tucking. Press platform up through midfoot without hyper-locking knees.",
    formCues: JSON.stringify(["Keep lower back and hips firmly planted against pad", "Never let pelvis roll forward at the bottom", "Do not hyperextend knees at lockout"]),
    commonMistakes: JSON.stringify(["Letting lower back curl off pad", "Locking knees with sudden force", "Hands on knees instead of handles"]),
    safetyNotes: "Never allow butt to lift off pad; set safety stops appropriately.",
    setsRepsTarget: "3 x 10-12",
    restSeconds: 120,
    variations: JSON.stringify(["Single-Leg Press", "Narrow-Stance Leg Press"]),
    substitutions: JSON.stringify(["Hack Squat", "Barbell Back Squat", "Goblet Squat"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/2287.gif"
  },
  {
    name: "Seated Leg Curl",
    primaryMuscle: "Hamstrings",
    secondaryMuscles: JSON.stringify(["Calves"]),
    equipment: "Seated Leg Curl Machine",
    category: "Hamstrings",
    difficulty: "Beginner",
    instructions: "Adjust pad so knee pivot aligns with machine axis. Lock thigh pad securely over quads. Curl heels down and under your seat, contracting hamstrings. Return slowly through a 3-second eccentric to full knee extension.",
    formCues: JSON.stringify(["Align knee joint with machine pivot axis", "Lean slightly forward to stretch hamstring origin", "Control the return"]),
    commonMistakes: JSON.stringify(["Loose thigh pad allowing hips to rise", "Using momentum"]),
    safetyNotes: "Lock thigh pad securely to isolate hamstrings without hip flexor compensation.",
    setsRepsTarget: "3 x 10-15",
    restSeconds: 90,
    variations: JSON.stringify(["Lying Leg Curl", "Single-Leg Seated Curl"]),
    substitutions: JSON.stringify(["Lying Leg Curl", "Swiss Ball Leg Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0599.gif"
  },
  {
    name: "Standing Calf Raise",
    primaryMuscle: "Calves",
    secondaryMuscles: JSON.stringify(["Soleus"]),
    equipment: "Standing Calf Machine or Smith Machine with Step",
    category: "Calves",
    difficulty: "Beginner",
    instructions: "Place balls of feet on block with heels hanging off. Shoulder pads resting on shoulders with straight legs (micro-bend in knees). Lower heels into deep stretch and hold 2s. Press up onto big toes and hold peak contraction for 1s.",
    formCues: JSON.stringify(["2-second pause in full stretch to eliminate Achilles bounce", "1-second peak squeeze on balls of feet", "Keep legs straight to target gastrocnemius"]),
    commonMistakes: JSON.stringify(["Bouncing quickly without pause", "Bending knees excessively"]),
    safetyNotes: "Step off safely once machine hook is engaged.",
    setsRepsTarget: "4 x 10-15",
    restSeconds: 90,
    variations: JSON.stringify(["Single-Leg Standing Calf Raise", "Donkey Calf Raise"]),
    substitutions: JSON.stringify(["Seated Calf Raise", "Leg Press Calf Extension"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/1372.gif"
  },
  {
    name: "Hack Squat",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: JSON.stringify(["Glutes", "Hamstrings"]),
    equipment: "Hack Squat Machine",
    category: "Quadriceps",
    difficulty: "Intermediate",
    instructions: "Position shoulders and back against machine pads. Place feet midway on platform shoulder-width. Release safety levers. Squat down to 90 degrees or below while keeping back against pad. Drive back up through feet.",
    formCues: JSON.stringify(["Keep back firmly against sled pad", "Knees track over toes", "Smooth controlled eccentric"]),
    commonMistakes: JSON.stringify(["Lifting heels off platform", "Placing feet too low"]),
    safetyNotes: "Ensure safety catch handles are within quick reach at all times.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 150,
    variations: JSON.stringify(["Reverse Hack Squat", "Leg Press"]),
    substitutions: JSON.stringify(["Leg Press", "Barbell Back Squat"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0046.gif"
  },
  {
    name: "Barbell Hip Thrust",
    primaryMuscle: "Glutes",
    secondaryMuscles: JSON.stringify(["Hamstrings", "Core"]),
    equipment: "Barbell, Squat Sponge Pad, Sturdy Bench",
    category: "Glutes",
    difficulty: "Intermediate",
    instructions: "Sit on floor with upper back against bench. Roll padded barbell over hips. Feet flat on floor, shoulder-width apart. Drive through heels to extend hips toward ceiling until thighs and torso are in straight line. Squeeze glutes hard at top.",
    formCues: JSON.stringify(["Tuck chin and look forward, not up at ceiling", "Posterior pelvic tilt at the top lock-out", "Shins vertical at peak extension"]),
    commonMistakes: JSON.stringify(["Hyperextending lumbar spine", "Placing feet too close or far"]),
    safetyNotes: "Always use a thick foam barbell pad to protect pelvic bones.",
    setsRepsTarget: "3 x 8-12",
    restSeconds: 120,
    variations: JSON.stringify(["Single-Leg Hip Thrust", "Dumbbell Glute Bridge"]),
    substitutions: JSON.stringify(["Glute Bridge", "Cable Pull-Through"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/3562.gif"
  },
  {
    name: "Lying Leg Curl",
    primaryMuscle: "Hamstrings",
    secondaryMuscles: JSON.stringify(["Calves"]),
    equipment: "Lying Leg Curl Machine",
    category: "Hamstrings",
    difficulty: "Beginner",
    instructions: "Lie face down with Achilles tendon tucked under roller pad. Hold handles firmly. Curl feet upward toward glutes, keeping hips pressed flat against bench pad. Lower slowly under control.",
    formCues: JSON.stringify(["Keep hips pressed down into pad", "Do not hyperextend lower back to pull weight", "Pause 1s at top"]),
    commonMistakes: JSON.stringify(["Lifting hips up to hoist the weight", "Dropping weight fast"]),
    safetyNotes: "Position pad just below calves, directly above Achilles tendon.",
    setsRepsTarget: "3 x 10-15",
    restSeconds: 90,
    variations: JSON.stringify(["Seated Leg Curl", "Single-Leg Lying Curl"]),
    substitutions: JSON.stringify(["Seated Leg Curl", "Nordic Hamstring Curl"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0586.gif"
  },
  {
    name: "Bulgarian Split Squat",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: JSON.stringify(["Glutes", "Hamstrings", "Calves", "Core"]),
    equipment: "Dumbbells, Bench or Platform",
    category: "Quadriceps",
    difficulty: "Advanced",
    instructions: "Stand 2-3 feet in front of bench. Place top of rear foot on bench. Lower hips vertically by bending front knee until front thigh is parallel to floor. Drive back up through front heel.",
    formCues: JSON.stringify(["Most weight (85%) stays on front foot", "Slight forward torso pitch targets glutes", "Keep front knee tracking over second toe"]),
    commonMistakes: JSON.stringify(["Putting too much pressure on back knee", "Front foot too close to bench"]),
    safetyNotes: "Master bodyweight balance before adding heavy dumbbells.",
    setsRepsTarget: "2 x 8-10 per leg",
    restSeconds: 90,
    variations: JSON.stringify(["Barbell Bulgarian Split Squat", "Walking Lunges"]),
    substitutions: JSON.stringify(["Walking Lunges", "Step-Ups", "Leg Press"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0410.gif"
  },
  {
    name: "Seated Calf Raise",
    primaryMuscle: "Calves",
    secondaryMuscles: JSON.stringify(["Soleus"]),
    equipment: "Seated Calf Machine",
    category: "Calves",
    difficulty: "Beginner",
    instructions: "Sit with balls of feet on platform, thigh pad clamped snugly over lower thighs. Release safety lever. Lower heels for a 2-second deep stretch, then elevate heels as high as possible.",
    formCues: JSON.stringify(["Targets the soleus muscle underneath gastrocnemius", "Pause 2s in deep stretch", "Full ankle plantarflexion"]),
    commonMistakes: JSON.stringify(["Bouncing the weights", "Incomplete range of motion"]),
    safetyNotes: "Fasten knee pads tightly so feet do not slip off platform.",
    setsRepsTarget: "4 x 12-20",
    restSeconds: 90,
    variations: JSON.stringify(["Standing Calf Raise", "Leg Press Calf Extension"]),
    substitutions: JSON.stringify(["Standing Calf Raise", "Dumbbell Single-Leg Calf Raise"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0088.gif"
  },
  {
    name: "Back Extension",
    primaryMuscle: "Lower back",
    secondaryMuscles: JSON.stringify(["Glutes", "Hamstrings"]),
    equipment: "45-Degree Hyperextension Bench",
    category: "Lower back",
    difficulty: "Beginner",
    instructions: "Position on hyperextension bench with hips just above pad. Cross arms across chest. Hinge at hips to lower upper body down. Extend spine back up until body forms straight line with legs. Do not hyperextend.",
    formCues: JSON.stringify(["Maintain neutral spine at peak extension", "Squeeze glutes and hamstrings to rise", "Do not over-arch spine backwards"]),
    commonMistakes: JSON.stringify(["Aggressive hyperextension past straight line", "Using momentum"]),
    safetyNotes: "Great for lumbar durability and erector spinae health.",
    setsRepsTarget: "2 x 12-15",
    restSeconds: 90,
    variations: JSON.stringify(["Weighted Back Extension", "Glute-Focused 45-Degree Extension"]),
    substitutions: JSON.stringify(["Bird Dog", "Good Mornings"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/1314.gif"
  },

  // ABS & CORE EXERCISES
  {
    name: "Cable Crunch",
    primaryMuscle: "Abs",
    secondaryMuscles: JSON.stringify(["Obliques"]),
    equipment: "Cable Machine, Rope Attachment",
    category: "Abs",
    difficulty: "Intermediate",
    instructions: "Kneel beneath high pulley holding rope near forehead. Hinge slightly at hips. Contract abs by curling spine, bringing ribcage down towards pelvis like an accordion. Return with control.",
    formCues: JSON.stringify(["Flex your spine, do not just sit back on your heels", "Lock hips in place; movement occurs only at spine", "Exhale all air at the crunch"]),
    commonMistakes: JSON.stringify(["Sitting back on heels using hip flexors", "Pulling with arms rather than crunching with abs"]),
    safetyNotes: "Keep neck neutral; avoid pulling head aggressively with rope.",
    setsRepsTarget: "3 x 12-15",
    restSeconds: 60,
    variations: JSON.stringify(["Weighted Machine Crunch", "Floor Crunch"]),
    substitutions: JSON.stringify(["Decline Crunch", "Machine Ab Crunch"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0175.gif"
  },
  {
    name: "Hanging Knee Raise",
    primaryMuscle: "Abs",
    secondaryMuscles: JSON.stringify(["Hip Flexors", "Forearms / Grip"]),
    equipment: "Pull-up Bar or Captain's Chair",
    category: "Abs",
    difficulty: "Intermediate",
    instructions: "Hang from pull-up bar with arms straight or use captain's chair. Brace core. Curl knees up toward chest while tilting pelvis upward. Lower knees slowly without swinging body.",
    formCues: JSON.stringify(["Tilt pelvis upward at top to recruit rectus abdominis", "Prevent body swing by controlling eccentric", "Exhale forcefully as knees rise"]),
    commonMistakes: JSON.stringify(["Swinging legs using momentum", "Only lifting knees without pelvic tilt"]),
    safetyNotes: "Use straps or captain's chair if grip gives out before abdominal fatigue.",
    setsRepsTarget: "3 x 10-15",
    restSeconds: 60,
    variations: JSON.stringify(["Hanging Straight-Leg Raise", "Captain's Chair Knee Raise"]),
    substitutions: JSON.stringify(["Reverse Crunch", "Captain's Chair Knee Raise"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0011.gif"
  },
  {
    name: "Pallof Press",
    primaryMuscle: "Obliques",
    secondaryMuscles: JSON.stringify(["Transverse Abdominis", "Glutes"]),
    equipment: "Cable Machine or Resistance Band",
    category: "Obliques",
    difficulty: "Beginner",
    instructions: "Stand perpendicular to cable pulley with handle at sternum level. Hold handle with both hands at chest. Press handle straight out in front of chest. Hold for 2 seconds resisting cable rotation. Return to chest.",
    formCues: JSON.stringify(["Resist rotation through anti-rotational core tension", "Squeeze glutes and brace core", "Square shoulders and hips straight ahead"]),
    commonMistakes: JSON.stringify(["Allowing cable to twist torso", "Shrugging shoulders"]),
    safetyNotes: "Superior anti-rotational exercise protecting the lumbar spine.",
    setsRepsTarget: "2 x 10-12 per side",
    restSeconds: 60,
    variations: JSON.stringify(["Half-Kneeling Pallof Press", "Pallof Press with Overhead Raise"]),
    substitutions: JSON.stringify(["Side Plank", "Suitcase Carry"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0979.gif"
  },
  {
    name: "Reverse Crunch",
    primaryMuscle: "Abs",
    secondaryMuscles: JSON.stringify(["Hip Flexors"]),
    equipment: "Exercise Mat or Flat Bench",
    category: "Abs",
    difficulty: "Beginner",
    instructions: "Lie on back with knees bent at 90 degrees, hands at sides or gripping bench. Contract abs to roll pelvis backward, lifting tailbone off the floor. Lower under control without arching lower back.",
    formCues: JSON.stringify(["Lift hips using lower abs, not momentum", "Keep lower back pressed into floor at bottom", "Smooth 2-second eccentric"]),
    commonMistakes: JSON.stringify(["Throwing legs over head", "Hyperextending lumbar spine on descent"]),
    safetyNotes: "Gentle on the neck and spine while effectively targeting the lower portion of rectus abdominis.",
    setsRepsTarget: "3 x 12-15",
    restSeconds: 60,
    variations: JSON.stringify(["Incline Reverse Crunch", "Hanging Knee Raise"]),
    substitutions: JSON.stringify(["Dead Bug", "Hanging Knee Raise"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0872.gif"
  },
  {
    name: "Front Plank",
    primaryMuscle: "Abs",
    secondaryMuscles: JSON.stringify(["Transverse Abdominis", "Shoulders", "Glutes"]),
    equipment: "Exercise Mat",
    category: "Abs",
    difficulty: "Beginner",
    instructions: "Rest on forearms and toes with elbows directly below shoulders. Form a straight line from heels to head. Actively squeeze glutes, pull belly button inward, and hold with steady breathing.",
    formCues: JSON.stringify(["Create active tension by pulling elbows toward toes", "Posterior pelvic tilt protects lower back", "Do not let hips sag or hike into a tent"]),
    commonMistakes: JSON.stringify(["Sagging hips causing lumbar extension", "Holding breath"]),
    safetyNotes: "End the hold if hips begin sagging into lumbar lordosis.",
    setsRepsTarget: "3 x 30-45 seconds",
    restSeconds: 60,
    variations: JSON.stringify(["RKC Hardstyle Plank", "Elevated Plank"]),
    substitutions: JSON.stringify(["Dead Bug", "Bird Dog"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/2135.gif"
  },
  {
    name: "Dead Bug",
    primaryMuscle: "Abs",
    secondaryMuscles: JSON.stringify(["Transverse Abdominis", "Lower Back"]),
    equipment: "Exercise Mat",
    category: "Abs",
    difficulty: "Beginner",
    instructions: "Lie on back with arms pointing to ceiling and knees bent at 90 degrees above hips. Flatten lower back into floor. Slowly extend right arm overhead and left leg straight toward floor simultaneously. Return and alternate sides.",
    formCues: JSON.stringify(["Press lower back firmly into the floor (zero gap)", "Slow and deliberate movement", "Breathe out as limbs extend"]),
    commonMistakes: JSON.stringify(["Lower back arching off the floor", "Rushing through reps"]),
    safetyNotes: "Exceptional core stability drill for preventing lower back pain.",
    setsRepsTarget: "2 x 10 per side",
    restSeconds: 60,
    variations: JSON.stringify(["Dead Bug with Exercise Ball", "Banded Dead Bug"]),
    substitutions: JSON.stringify(["Bird Dog", "Front Plank"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0276.gif"
  },
  {
    name: "Ab Wheel Rollout",
    primaryMuscle: "Abs",
    secondaryMuscles: JSON.stringify(["Lats", "Shoulders", "Lower Back"]),
    equipment: "Ab Wheel Roller, Knee Mat",
    category: "Abs",
    difficulty: "Advanced",
    instructions: "Kneel on mat holding ab wheel handles below shoulders. Maintain slight spinal flexion (hollow body). Roll wheel forward slowly while lowering torso. Squeeze abs hard to pull wheel back to starting position.",
    formCues: JSON.stringify(["Maintain posterior pelvic tilt and rounded upper back", "Only roll as far as you can maintain abdominal control", "Do not let hips collapse downward"]),
    commonMistakes: JSON.stringify(["Letting lower back arch and taking load in lumbar spine", "Rolling past strength threshold"]),
    safetyNotes: "Beginners should roll toward a wall stop to limit range of motion safely.",
    setsRepsTarget: "2 x 6-10",
    restSeconds: 90,
    variations: JSON.stringify(["Wall-Blocked Ab Wheel Rollout", "Standing Ab Wheel Rollout"]),
    substitutions: JSON.stringify(["Plank Walkouts", "Stability Ball Rollout", "Front Plank"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0857.gif"
  },
  {
    name: "Side Plank",
    primaryMuscle: "Obliques",
    secondaryMuscles: JSON.stringify(["Gluteus Medius", "Shoulders"]),
    equipment: "Exercise Mat",
    category: "Obliques",
    difficulty: "Beginner",
    instructions: "Lie on side with forearm flat on floor below shoulder. Stack feet on top of each other. Lift hips off floor until body forms a straight diagonal line. Hold steady while bracing obliques.",
    formCues: JSON.stringify(["Keep hips pushed forward and up", "Do not roll top shoulder forward", "Breathe steadily"]),
    commonMistakes: JSON.stringify(["Dropping hips toward floor", "Shoulder collapsing into neck"]),
    safetyNotes: "Bend knees for a modified version if shoulder or oblique strength is limited.",
    setsRepsTarget: "2 x 30-45 seconds per side",
    restSeconds: 60,
    variations: JSON.stringify(["Knee Side Plank", "Side Plank with Hip Dip"]),
    substitutions: JSON.stringify(["Pallof Press", "Suitcase Carry"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/3544.gif"
  },
  {
    name: "Cable Woodchop",
    primaryMuscle: "Obliques",
    secondaryMuscles: JSON.stringify(["Abs", "Shoulders", "Hips"]),
    equipment: "Cable Machine with Single Handle",
    category: "Obliques",
    difficulty: "Intermediate",
    instructions: "Set pulley at high position. Stand sideways, grip handle with both hands. Pull cable diagonally downward across body towards opposite hip, rotating through torso and pivoting on rear foot.",
    formCues: JSON.stringify(["Initiate rotation from core and hips, not arms", "Pivot back foot as you rotate", "Control return to starting height"]),
    commonMistakes: JSON.stringify(["Pulling only with arms", "Rounding back violently"]),
    safetyNotes: "Keep core braced to protect lumbar spine during rotational force.",
    setsRepsTarget: "2 x 10-12 per side",
    restSeconds: 60,
    variations: JSON.stringify(["Low-to-High Cable Woodchop", "Band Woodchop"]),
    substitutions: JSON.stringify(["Russian Twist", "Pallof Press"]),
    photoUrl: "https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/1007.gif"
  }
];

const TEMPLATES = [
  {
    name: "Push A",
    dayOfWeek: "Monday",
    type: "STRENGTH",
    description: "Chest, front/lateral delts, and triceps emphasis with heavy barbell bench priority",
    exercises: [
      { name: "Barbell Bench Press", targetSets: 3, targetReps: "6-8", restSeconds: 150, targetRir: 2 },
      { name: "Incline Dumbbell Press", targetSets: 3, targetReps: "8-12", restSeconds: 120, targetRir: 2 },
      { name: "Seated Dumbbell Shoulder Press", targetSets: 3, targetReps: "8-10", restSeconds: 120, targetRir: 2 },
      { name: "Cable Lateral Raise", targetSets: 3, targetReps: "12-15", restSeconds: 90, targetRir: 1 },
      { name: "Rope Triceps Pushdown", targetSets: 3, targetReps: "10-15", restSeconds: 90, targetRir: 1 },
      { name: "Overhead Cable Triceps Extension", targetSets: 2, targetReps: "12-15", restSeconds: 90, targetRir: 1 }
    ]
  },
  {
    name: "Pull A",
    dayOfWeek: "Tuesday",
    type: "STRENGTH",
    description: "Vertical and horizontal back pulling, rear deltoid and biceps development",
    exercises: [
      { name: "Lat Pulldown", targetSets: 3, targetReps: "8-12", restSeconds: 120, targetRir: 2 },
      { name: "Chest-Supported Row", targetSets: 3, targetReps: "8-12", restSeconds: 90, targetRir: 2 },
      { name: "Seated Cable Row", targetSets: 2, targetReps: "10-12", restSeconds: 90, targetRir: 2 },
      { name: "Reverse Pec Deck", targetSets: 3, targetReps: "12-15", restSeconds: 90, targetRir: 1 },
      { name: "Dumbbell Biceps Curl", targetSets: 3, targetReps: "8-12", restSeconds: 90, targetRir: 1 },
      { name: "Hammer Curl", targetSets: 2, targetReps: "10-12", restSeconds: 90, targetRir: 1 },
      { name: "Wrist Curl", targetSets: 2, targetReps: "12-20", restSeconds: 60, targetRir: 1 }
    ]
  },
  {
    name: "Legs A",
    dayOfWeek: "Wednesday",
    type: "STRENGTH",
    description: "Quad and hamstring dominant leg day anchored by heavy barbell back squats",
    exercises: [
      { name: "Barbell Back Squat", targetSets: 3, targetReps: "6-8", restSeconds: 180, targetRir: 2 },
      { name: "Romanian Deadlift", targetSets: 3, targetReps: "8-10", restSeconds: 150, targetRir: 2 },
      { name: "Leg Press", targetSets: 3, targetReps: "10-12", restSeconds: 120, targetRir: 2 },
      { name: "Seated Leg Curl", targetSets: 3, targetReps: "10-15", restSeconds: 90, targetRir: 1 },
      { name: "Standing Calf Raise", targetSets: 4, targetReps: "10-15", restSeconds: 90, targetRir: 1 },
      { name: "Cable Crunch", targetSets: 3, targetReps: "12-15", restSeconds: 60, targetRir: 1 }
    ]
  },
  {
    name: "Push B",
    dayOfWeek: "Thursday",
    type: "STRENGTH",
    description: "Upper chest angle focus, machine stability, high-pump lateral delts and triceps",
    exercises: [
      { name: "Incline Barbell Bench Press", targetSets: 3, targetReps: "6-10", restSeconds: 150, targetRir: 2 },
      { name: "Machine Chest Press", targetSets: 3, targetReps: "8-12", restSeconds: 90, targetRir: 2 },
      { name: "Cable Chest Fly", targetSets: 2, targetReps: "12-15", restSeconds: 90, targetRir: 1 },
      { name: "Machine Shoulder Press", targetSets: 2, targetReps: "8-12", restSeconds: 90, targetRir: 2 },
      { name: "Dumbbell Lateral Raise", targetSets: 3, targetReps: "12-20", restSeconds: 90, targetRir: 1 },
      { name: "Straight-Bar Triceps Pushdown", targetSets: 3, targetReps: "10-15", restSeconds: 90, targetRir: 1 },
      { name: "Overhead Dumbbell Triceps Extension", targetSets: 2, targetReps: "10-15", restSeconds: 90, targetRir: 1 }
    ]
  },
  {
    name: "Pull B",
    dayOfWeek: "Friday",
    type: "STRENGTH",
    description: "Bodyweight pull-ups, barbell rows, shoulder rotator cuff durability and arms",
    exercises: [
      { name: "Pull-ups or assisted pull-ups", targetSets: 3, targetReps: "6-10", restSeconds: 150, targetRir: 2 },
      { name: "Barbell Bent-Over Row", targetSets: 3, targetReps: "8-10", restSeconds: 120, targetRir: 2 },
      { name: "Straight-Arm Cable Pulldown", targetSets: 2, targetReps: "12-15", restSeconds: 90, targetRir: 1 },
      { name: "Face Pulls", targetSets: 3, targetReps: "12-15", restSeconds: 90, targetRir: 1 },
      { name: "EZ-Bar Preacher Curl", targetSets: 3, targetReps: "10-12", restSeconds: 90, targetRir: 1 },
      { name: "Incline Dumbbell Curl", targetSets: 2, targetReps: "10-12", restSeconds: 90, targetRir: 1 },
      { name: "Reverse Wrist Curl", targetSets: 2, targetReps: "15-20", restSeconds: 60, targetRir: 1 }
    ]
  },
  {
    name: "Legs B",
    dayOfWeek: "Saturday",
    type: "STRENGTH",
    description: "Hack squat, heavy hip thrust for glute development, unilateral work and posterior chain",
    exercises: [
      { name: "Hack Squat", targetSets: 3, targetReps: "8-12", restSeconds: 150, targetRir: 2 },
      { name: "Barbell Hip Thrust", targetSets: 3, targetReps: "8-12", restSeconds: 120, targetRir: 2 },
      { name: "Lying Leg Curl", targetSets: 3, targetReps: "10-15", restSeconds: 90, targetRir: 1 },
      { name: "Bulgarian Split Squat", targetSets: 2, targetReps: "8-10 per leg", restSeconds: 90, targetRir: 1 },
      { name: "Seated Calf Raise", targetSets: 4, targetReps: "12-20", restSeconds: 90, targetRir: 1 },
      { name: "Hanging Knee Raise", targetSets: 3, targetReps: "10-15", restSeconds: 60, targetRir: 1 },
      { name: "Pallof Press", targetSets: 2, targetReps: "10-12 per side", restSeconds: 60, targetRir: 1 },
      { name: "Back Extension", targetSets: 2, targetReps: "12-15", restSeconds: 90, targetRir: 1 }
    ]
  },
  // CORE TEMPLATES
  {
    name: "Core A",
    dayOfWeek: "Monday",
    type: "CORE",
    description: "Cable flexion, hanging pelvic curl, anti-rotation tension",
    exercises: [
      { name: "Cable Crunch", targetSets: 3, targetReps: "12-15", restSeconds: 60, targetRir: 1 },
      { name: "Hanging Knee Raise", targetSets: 3, targetReps: "10-15", restSeconds: 60, targetRir: 1 },
      { name: "Pallof Press", targetSets: 2, targetReps: "10-12 per side", restSeconds: 60, targetRir: 1 }
    ]
  },
  {
    name: "Core B",
    dayOfWeek: "Tuesday",
    type: "CORE",
    description: "Lower abdominal tuck, isometric anterior core hold, cross-body stabilizing",
    exercises: [
      { name: "Reverse Crunch", targetSets: 3, targetReps: "12-15", restSeconds: 60, targetRir: 1 },
      { name: "Front Plank", targetSets: 3, targetReps: "30-45 seconds", restSeconds: 60, targetRir: 1 },
      { name: "Dead Bug", targetSets: 2, targetReps: "10 per side", restSeconds: 60, targetRir: 1 }
    ]
  },
  {
    name: "Core C",
    dayOfWeek: "Wednesday",
    type: "CORE",
    description: "Dynamic wheel rollout, lateral core endurance, rotational power",
    exercises: [
      { name: "Ab Wheel Rollout", targetSets: 2, targetReps: "6-10", restSeconds: 90, targetRir: 2 },
      { name: "Side Plank", targetSets: 2, targetReps: "30-45 seconds per side", restSeconds: 60, targetRir: 1 },
      { name: "Cable Woodchop", targetSets: 2, targetReps: "10-12 per side", restSeconds: 60, targetRir: 1 }
    ]
  }
];

function getPhaseName(weekNumber) {
  if (weekNumber <= 2) return "Phase 1: Baseline Establishment";
  if (weekNumber <= 4) return "Phase 2: Repetition & Form Refinement";
  if (weekNumber <= 7) return "Phase 3: Progressive Load Accumulation";
  if (weekNumber === 8) return "Phase 4: Scheduled Deload (Volume -40%)";
  if (weekNumber <= 11) return "Phase 5: Resumed Progressive Overload";
  if (weekNumber === 12) return "Phase 6: Strength Consolidation";
  return "Phase 7: Assessment & Next Cycle Prep";
}

// Function to generate the 90 days from a start date
async function seedProgramDaysForUser(user, templatesByName) {
  const startDateObj = new Date(user.startDate + "T00:00:00Z");

  for (let day = 1; day <= 90; day++) {
    const currentDayDate = new Date(startDateObj);
    currentDayDate.setUTCDate(startDateObj.getUTCDate() + (day - 1));
    const dateStr = currentDayDate.toISOString().split('T')[0];
    
    // Day of week: 0 is Sunday, 1 is Monday, etc.
    const dayOfWeekIndex = currentDayDate.getUTCDay();
    const weekNumber = Math.ceil(day / 7);
    const phaseName = getPhaseName(weekNumber);

    let templateId = null;
    let status = "NOT_STARTED";

    if (dayOfWeekIndex === 0) {
      status = "REST_DAY";
    } else if (dayOfWeekIndex === 1) {
      templateId = templatesByName["Push A"]?.id;
    } else if (dayOfWeekIndex === 2) {
      templateId = templatesByName["Pull A"]?.id;
    } else if (dayOfWeekIndex === 3) {
      templateId = templatesByName["Legs A"]?.id;
    } else if (dayOfWeekIndex === 4) {
      templateId = templatesByName["Push B"]?.id;
    } else if (dayOfWeekIndex === 5) {
      templateId = templatesByName["Pull B"]?.id;
    } else if (dayOfWeekIndex === 6) {
      templateId = templatesByName["Legs B"]?.id;
    }

    await prisma.programDay.upsert({
      where: {
        userId_dayNumber: {
          userId: user.id,
          dayNumber: day
        }
      },
      update: {
        date: dateStr,
        weekNumber,
        phaseName,
        workoutTemplateId: templateId,
        status: status === "REST_DAY" ? "REST_DAY" : undefined
      },
      create: {
        userId: user.id,
        dayNumber: day,
        date: dateStr,
        weekNumber,
        phaseName,
        status,
        workoutTemplateId: templateId
      }
    });
  }
}

async function main() {
  console.log("🌱 Starting seed database for 90-Day Gym Tracker...");

  // 1. Seed or Update Default User
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Find current Monday or today for clean start date
  const today = new Date();
  const dayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay(); // Most recent Monday
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + dayOffset);
  const formattedStartDate = mondayDate.toISOString().split('T')[0];

  const defaultUser = await prisma.user.upsert({
    where: { email: "athlete@gymtracker.local" },
    update: {
      name: "Athlete",
      age: 23,
      weight: 62.0,
      height: 168.0,
      experience: "Intermediate",
      goal: "Build muscle and gradually reduce body fat",
      trainingFrequency: 6,
      workoutDuration: "60-90 minutes",
      diet: "Vegetarian",
      restDay: "Sunday",
      units: "kg/cm",
      theme: "dark",
      dailyProteinTarget: 115.0
    },
    create: {
      email: "athlete@gymtracker.local",
      password: hashedPassword,
      name: "Athlete",
      age: 23,
      weight: 62.0,
      height: 168.0,
      experience: "Intermediate",
      goal: "Build muscle and gradually reduce body fat",
      trainingFrequency: 6,
      workoutDuration: "60-90 minutes",
      diet: "Vegetarian",
      gymEquipment: "Full commercial gym with barbells, dumbbells, cables, machines, racks",
      programDuration: 90,
      restDay: "Sunday",
      startDate: formattedStartDate,
      units: "kg/cm",
      theme: "dark",
      avoidDuplicateCore: true,
      dailyProteinTarget: 115.0,
      dailyWaterTarget: 3000.0,
      cardioTargetMins: 120
    }
  });

  console.log(`✅ User profile established: ${defaultUser.name} (${defaultUser.email})`);

  // 2. Seed Exercises
  const exerciseMap = {};
  for (const exData of EXERCISES_DATA) {
    const exercise = await prisma.exercise.upsert({
      where: { name: exData.name },
      update: exData,
      create: exData
    });
    exerciseMap[exercise.name] = exercise;
  }
  console.log(`✅ Seeded ${Object.keys(exerciseMap).length} comprehensive exercises with instructions and cues.`);

  // 3. Seed Workout Templates & Exercises
  const templatesByName = {};
  for (const tData of TEMPLATES) {
    const template = await prisma.workoutTemplate.upsert({
      where: { name: tData.name },
      update: {
        dayOfWeek: tData.dayOfWeek,
        type: tData.type,
        description: tData.description
      },
      create: {
        name: tData.name,
        dayOfWeek: tData.dayOfWeek,
        type: tData.type,
        description: tData.description
      }
    });
    templatesByName[tData.name] = template;

    // Clear existing items in template to ensure clean order
    await prisma.workoutTemplateExercise.deleteMany({
      where: { templateId: template.id }
    });

    // Add exercises in order
    for (let i = 0; i < tData.exercises.length; i++) {
      const item = tData.exercises[i];
      const ex = exerciseMap[item.name];
      if (ex) {
        await prisma.workoutTemplateExercise.create({
          data: {
            templateId: template.id,
            exerciseId: ex.id,
            orderIndex: i + 1,
            targetSets: item.targetSets,
            targetReps: item.targetReps,
            restSeconds: item.restSeconds,
            targetRir: item.targetRir
          }
        });
      }
    }
  }
  console.log(`✅ Seeded ${TEMPLATES.length} templates (Push A/B, Pull A/B, Legs A/B, Core A/B/C) with exercises.`);

  // 4. Seed 90-Day Calendar for Default User
  await seedProgramDaysForUser(defaultUser, templatesByName);
  console.log(`✅ Program days 1 through 90 generated with phases, week calculations, and template links.`);

  // 5. Seed Initial Body Measurement baseline for user
  await prisma.bodyMeasurement.create({
    data: {
      userId: defaultUser.id,
      date: formattedStartDate,
      weightKg: 62.0,
      waistCm: 76.0,
      chestCm: 94.0,
      armCm: 32.5,
      thighCm: 53.0,
      hipCm: 90.0,
      notes: "Day 1 Baseline measurements before beginning the 90-day transformation."
    }
  });

  // 6. Seed Sample Vegetarian Nutrition Log
  const sampleMeals = [
    { mealType: "Breakfast", foodItem: "Rolled Oats with Milk and Peanuts", quantity: "60g oats + 250ml milk + 20g peanuts", calories: 480, proteinG: 22, carbsG: 62, fatG: 16 },
    { mealType: "Lunch", foodItem: "Tofu / Paneer Curry with 3 Roti & Dal", quantity: "150g tofu + 1 cup yellow dal + 3 rotis", calories: 650, proteinG: 38, carbsG: 82, fatG: 18 },
    { mealType: "Snack", foodItem: "Roasted Chana & Curd (Dahi)", quantity: "50g roasted chana + 150g curd", calories: 310, proteinG: 20, carbsG: 34, fatG: 9 },
    { mealType: "Dinner", foodItem: "Soy Chunks & Mixed Vegetable Pulao", quantity: "50g raw soy chunks + 1 bowl rice + veggies", calories: 520, proteinG: 36, carbsG: 70, fatG: 8 }
  ];

  for (const meal of sampleMeals) {
    await prisma.nutritionEntry.create({
      data: {
        userId: defaultUser.id,
        date: formattedStartDate,
        ...meal
      }
    });
  }

  // Water log
  await prisma.waterLog.upsert({
    where: {
      userId_date: {
        userId: defaultUser.id,
        date: formattedStartDate
      }
    },
    update: { glasses: 10, amountMl: 2500 },
    create: {
      userId: defaultUser.id,
      date: formattedStartDate,
      glasses: 10,
      amountMl: 2500
    }
  });

  console.log("🌱 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
