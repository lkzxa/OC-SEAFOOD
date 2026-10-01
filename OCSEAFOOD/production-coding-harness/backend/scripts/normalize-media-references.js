const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  if (!process.argv.includes('--apply')) {
    throw new Error('Run with --apply after creating a database backup.');
  }

  const affected = await prisma.user.findMany({
    where: { avatar: { contains: 'googleusercontent.com' } },
    select: { id: true, avatar: true },
  });

  if (affected.length) {
    await prisma.user.updateMany({
      where: { id: { in: affected.map((user) => user.id) } },
      data: { avatar: '/logo_chuan.png' },
    });
  }

  console.log(JSON.stringify({ updatedUsers: affected.map((user) => user.id), replacement: '/logo_chuan.png' }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
