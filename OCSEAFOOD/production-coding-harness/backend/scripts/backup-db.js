/**
 * Xuất toàn bộ dữ liệu database ra 1 file JSON — dùng làm bản backup thủ công.
 * Không đụng gì tới database (chỉ đọc), an toàn để chạy bất cứ lúc nào.
 *
 * Cách dùng:
 *   node scripts/backup-db.js "<DATABASE_URL>" [đường-dẫn-file-output]
 *
 * Ví dụ backup database production:
 *   node scripts/backup-db.js "postgresql://user:pass@host/db" ../backups/prod.json
 *
 * Nếu không truyền đường dẫn output, file sẽ tự lưu vào backend/backups/
 * với tên kèm ngày giờ hiện tại.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const MODELS = [
  'user', 'category', 'product', 'blogPost', 'order', 'orderItem',
  'orderAuditLog', 'notificationOutbox', 'systemSetting', 'passwordResetToken',
  'combo', 'jobOpening',
];

async function main() {
  const dbUrl = process.argv[2];
  if (!dbUrl) {
    console.error('Thiếu DATABASE_URL. Cách dùng:');
    console.error('  node scripts/backup-db.js "<DATABASE_URL>" [đường-dẫn-file-output]');
    process.exit(1);
  }

  const defaultName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const outPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(__dirname, '..', 'backups', defaultName);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const backup = { exportedAt: new Date().toISOString(), data: {} };

  try {
    for (const model of MODELS) {
      const rows = await prisma[model].findMany();
      backup.data[model] = rows;
      console.log(`${model}: ${rows.length} dòng`);
    }

    fs.writeFileSync(
      outPath,
      JSON.stringify(backup, (_key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)
    );
    console.log('\n✅ Đã lưu backup tại:', outPath);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Backup thất bại:', err.message);
  process.exit(1);
});
