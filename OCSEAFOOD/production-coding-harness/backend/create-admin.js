const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Đang kiểm tra tài khoản Admin...');

  const adminEmail = 'admin@ocseafood.vn';
  const adminPassword = 'admin'; // Mật khẩu mặc định

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminUser) {
    console.log(`Chưa có tài khoản Admin. Đang tạo mới với email: ${adminEmail}`);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Quản trị viên',
        role: 'ADMIN'
      }
    });
    console.log('Đã tạo tài khoản Admin thành công!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Mật khẩu: ${adminPassword}`);
  } else {
    console.log(`Tài khoản Admin đã tồn tại!`);
    console.log(`Email: ${adminUser.email}`);
    if (adminUser.role !== 'ADMIN') {
      console.log('Cập nhật quyền ADMIN cho tài khoản này...');
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      });
      console.log('Đã cập nhật quyền thành công.');
    }
  }
}

main()
  .catch(e => {
    console.error('Lỗi khi tạo admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
