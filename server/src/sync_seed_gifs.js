const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.js');
let content = fs.readFileSync(seedPath, 'utf8');

const GIF_BASE = 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/';

const EXERCISE_GIF_MAP = {
  "Barbell Bench Press": "0025.gif",
  "Incline Dumbbell Press": "0314.gif",
  "Seated Dumbbell Shoulder Press": "0377.gif",
  "Cable Lateral Raise": "0178.gif",
  "Rope Triceps Pushdown": "0200.gif",
  "Overhead Cable Triceps Extension": "0193.gif",
  "Incline Barbell Bench Press": "0047.gif",
  "Machine Chest Press": "0314.gif",
  "Cable Chest Fly": "0171.gif",
  "Machine Shoulder Press": "0377.gif",
  "Dumbbell Lateral Raise": "0334.gif",
  "Straight-Bar Triceps Pushdown": "0201.gif",
  "Overhead Dumbbell Triceps Extension": "0092.gif",
  "Lat Pulldown": "2330.gif",
  "Chest-Supported Row": "0293.gif",
  "Seated Cable Row": "0861.gif",
  "Reverse Pec Deck": "0203.gif",
  "Dumbbell Biceps Curl": "0294.gif",
  "Hammer Curl": "0165.gif",
  "Wrist Curl": "0125.gif",
  "Pull-ups or assisted pull-ups": "0017.gif",
  "Barbell Bent-Over Row": "0027.gif",
  "Straight-Arm Cable Pulldown": "0199.gif",
  "Face Pulls": "0203.gif",
  "EZ-Bar Preacher Curl": "0070.gif",
  "Incline Dumbbell Curl": "0072.gif",
  "Reverse Wrist Curl": "0994.gif",
  "Barbell Back Squat": "1461.gif",
  "Romanian Deadlift": "0085.gif",
  "Leg Press": "2287.gif",
  "Seated Leg Curl": "0599.gif",
  "Standing Calf Raise": "1372.gif",
  "Hack Squat": "0046.gif",
  "Barbell Hip Thrust": "3562.gif",
  "Lying Leg Curl": "0586.gif",
  "Bulgarian Split Squat": "0410.gif",
  "Seated Calf Raise": "0088.gif",
  "Back Extension": "1314.gif",
  "Cable Crunch": "0175.gif",
  "Hanging Knee Raise": "0011.gif",
  "Pallof Press": "0979.gif",
  "Reverse Crunch": "0872.gif",
  "Front Plank": "2135.gif",
  "Dead Bug": "0276.gif",
  "Ab Wheel Rollout": "0857.gif",
  "Side Plank": "3544.gif",
  "Cable Woodchop": "1007.gif"
};

for (const [name, gif] of Object.entries(EXERCISE_GIF_MAP)) {
  const url = `${GIF_BASE}${gif}`;
  // Find block for exercise
  const pattern = new RegExp(`(name:\\s*["']${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}["'][\\s\\S]*?photoUrl:\\s*["'])[^"']+`, 'g');
  content = content.replace(pattern, `$1${url}`);
}

fs.writeFileSync(seedPath, content, 'utf8');
console.log("Successfully synced seed.js with animated exercise GIFs!");
