const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const sample = await prisma.exercise.findMany({
    select: { name: true, photoUrl: true },
    take: 8
  });
  console.log("Sample updated exercise photos:");
  sample.forEach(s => console.log(`• ${s.name} => ${s.photoUrl}`));
}

check().finally(() => prisma.$disconnect());
