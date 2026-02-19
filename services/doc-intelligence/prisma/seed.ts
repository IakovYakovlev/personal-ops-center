import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      limitRequests: 100,
      limitSymbols: 100000,
    },
  });

  await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      limitRequests: 1000,
      limitSymbols: 1000000,
    },
  });

  await prisma.plan.upsert({
    where: { name: 'ultra' },
    update: {},
    create: {
      name: 'ultra',
      limitRequests: 10000,
      limitSymbols: 10000000,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
