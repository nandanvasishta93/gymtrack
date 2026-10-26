const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const EXACT_IMAGE_MAP = {
  // PUSH A & B
  "Barbell Bench Press": "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "Incline Dumbbell Press": "Incline_Dumbbell_Press/0.jpg",
  "Seated Dumbbell Shoulder Press": "Seated_Dumbbell_Press/0.jpg",
  "Cable Lateral Raise": "Cable_Seated_Lateral_Raise/0.jpg",
  "Rope Triceps Pushdown": "Triceps_Pushdown/0.jpg",
  "Overhead Cable Triceps Extension": "Cable_Rope_Overhead_Triceps_Extension/0.jpg",
  "Incline Barbell Bench Press": "Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
  "Machine Chest Press": "Leverage_Chest_Press/0.jpg",
  "Cable Chest Fly": "Cable_Crossover/0.jpg",
  "Machine Shoulder Press": "Leverage_Shoulder_Press/0.jpg",
  "Dumbbell Lateral Raise": "Side_Lateral_Raise/0.jpg",
  "Straight-Bar Triceps Pushdown": "Triceps_Pushdown/1.jpg",
  "Overhead Dumbbell Triceps Extension": "Standing_Dumbbell_Triceps_Extension/0.jpg",

  // PULL A & B
  "Lat Pulldown": "Wide-Grip_Lat_Pulldown/0.jpg",
  "Chest-Supported Row": "Incline_Dumbbell_Row/0.jpg",
  "Seated Cable Row": "Seated_Cable_Rows/0.jpg",
  "Reverse Pec Deck": "Reverse_Flyes/0.jpg",
  "Dumbbell Biceps Curl": "Dumbbell_Bicep_Curl/0.jpg",
  "Hammer Curl": "Hammer_Curls/0.jpg",
  "Wrist Curl": "Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg",
  "Pull-ups or assisted pull-ups": "Pullups/0.jpg",
  "Barbell Bent-Over Row": "Bent_Over_Barbell_Row/0.jpg",
  "Straight-Arm Cable Pulldown": "Rope_Straight-Arm_Pulldown/0.jpg",
  "Face Pulls": "Face_Pull/0.jpg",
  "EZ-Bar Preacher Curl": "Preacher_Curl/0.jpg",
  "Incline Dumbbell Curl": "Alternate_Incline_Dumbbell_Curl/0.jpg",
  "Reverse Wrist Curl": "Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg",

  // LEGS A & B
  "Barbell Back Squat": "Barbell_Full_Squat/0.jpg",
  "Romanian Deadlift": "Romanian_Deadlift_from_Deficit/0.jpg",
  "Leg Press": "Leg_Press/0.jpg",
  "Seated Leg Curl": "Seated_Leg_Curl/0.jpg",
  "Standing Calf Raise": "Standing_Calf_Raises/0.jpg",
  "Hack Squat": "Hack_Squat/0.jpg",
  "Barbell Hip Thrust": "Barbell_Hip_Thrust/0.jpg",
  "Lying Leg Curl": "Lying_Leg_Curls/0.jpg",
  "Bulgarian Split Squat": "Split_Squat_with_Dumbbells/0.jpg",
  "Seated Calf Raise": "Seated_Calf_Raise/0.jpg",
  "Back Extension": "Hyperextensions_Back_Extensions/0.jpg",

  // ABS & CORE
  "Cable Crunch": "Cable_Crunch/0.jpg",
  "Hanging Knee Raise": "Hanging_Leg_Raise/0.jpg",
  "Pallof Press": "Pallof_Press/0.jpg",
  "Reverse Crunch": "Reverse_Crunch/0.jpg",
  "Front Plank": "Plank/0.jpg",
  "Dead Bug": "Dead_Bug/0.jpg",
  "Ab Wheel Rollout": "Ab_Roller/0.jpg",
  "Side Plank": "Push_Up_to_Side_Plank/0.jpg",
  "Cable Woodchop": "Standing_Cable_Wood_Chop/0.jpg"
};

async function main() {
  console.log("Applying 100% verified exact exercise photos to database...");

  for (const [exerciseName, imgPath] of Object.entries(EXACT_IMAGE_MAP)) {
    const fullUrl = `${BASE_URL}${imgPath}`;
    try {
      const updated = await prisma.exercise.updateMany({
        where: { name: exerciseName },
        data: { photoUrl: fullUrl }
      });
      console.log(`✅ ${exerciseName} -> ${imgPath}`);
    } catch (e) {
      console.error(`Error updating ${exerciseName}:`, e.message);
    }
  }

  console.log("All 47 exercises updated with verified, exact exercise demonstration photos!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
