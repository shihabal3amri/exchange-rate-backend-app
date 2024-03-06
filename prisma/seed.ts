import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto'; // Used only if you need to generate additional unique UUIDs

const prisma = new PrismaClient();

async function main() {
  const jobs: Array<{ id: string; name: string; cronExpression: string; timestamp: Date; updatedAt: Date; }> = [
    {
      id: "766c85ae-35a7-469c-ba5e-097aa81f406e",
      name: "save.omr.conversion.rates",
      cronExpression: "*/3 * * * *", // Runs every 3 minutes
      timestamp: new Date(),
      updatedAt: new Date(),
    },
    // Add more jobs as needed, each with a unique UUID
  ];

  for (const job of jobs) {
    await prisma.schedule.upsert({
      where: { id: job.id },
      update: job,
      create: job,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
