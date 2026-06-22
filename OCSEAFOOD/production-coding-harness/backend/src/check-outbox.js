const prisma = require('./config/prisma');

async function main() {
  const records = await prisma.notificationOutbox.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
  console.log("=== LAST 10 NOTIFICATION OUTBOX RECORDS ===");
  console.log(JSON.stringify(records, null, 2));
}

main()
  .catch(err => {
    console.error("Error executing script:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
