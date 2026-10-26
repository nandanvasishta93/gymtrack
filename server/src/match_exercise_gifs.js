const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Fetching exercise GIF dataset...");
  const csvText = await fetch('https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/exercises.csv').then(r => r.text());
  const lines = csvText.split('\n');
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length >= 4) {
      items.push({
        id: parts[2].trim(),
        name: parts[3].trim().toLowerCase()
      });
    }
  }
  console.log(`Parsed ${items.length} GIF exercises.`);

  const dbExercises = await prisma.exercise.findMany();
  const matchedMap = {};

  for (const ex of dbExercises) {
    const name = ex.name.toLowerCase();
    
    // Direct match
    let match = items.find(it => it.name === name);
    
    // Fuzzy substring
    if (!match) {
      match = items.find(it => it.name.includes(name) || name.includes(it.name));
    }
    
    // Keyword match
    if (!match) {
      const words = name.replace(/(\(|\)|or assisted)/g, '').split(' ')
        .filter(w => w.length > 3 && !['barbell', 'dumbbell', 'cable', 'machine', 'seated', 'lying', 'standing'].includes(w));
      if (words.length > 0) {
        match = items.find(it => words.every(w => it.name.includes(w)));
      }
    }

    if (match) {
      matchedMap[ex.name] = match;
      console.log(`✅ ${ex.name} -> ID: ${match.id} (${match.name})`);
    } else {
      console.log(`❌ ${ex.name} -> NOT MATCHED`);
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
