const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Admin User
  const adminEmail = 'admin@ocseafood.vn';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Quản trị viên OCSEAFOOD',
        role: 'ADMIN'
      }
    });
    console.log(`✅ Created Admin user: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
  }

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Cua - Ghẹ',
      slug: 'cua-ghe',
      description: 'Cua ghẹ tươi sống chất lượng cao nhập khẩu và nội địa sạch từ vùng biển sâu'
    },
    {
      name: 'Tôm',
      slug: 'tom',
      description: 'Tôm các loại tươi sống bơi tại bể, chuẩn xuất khẩu'
    },
    {
      name: 'Cá',
      slug: 'ca',
      description: 'Cá biển cao cấp làm sạch phi lê hoặc tươi sống nguyên con'
    }
  ];

  const categories = {};
  for (const cat of categoriesData) {
    let category = await prisma.category.findUnique({
      where: { slug: cat.slug }
    });

    if (!category) {
      category = await prisma.category.create({
        data: cat
      });
      console.log(`✅ Created Category: ${cat.name}`);
    } else {
      console.log(`ℹ️ Category already exists: ${cat.name}`);
    }
    categories[cat.slug] = category;
  }

  // 3. Create Products for Cua - Ghẹ (slug: cua-ghe)
  const cuaGheId = categories['cua-ghe'].id;
  const productsData = [
    {
      name: 'Cua Hoàng Đế (King Crab)',
      slug: 'cua-hoang-de-king-crab',
      description: 'Cua hoàng đế nhập khẩu trực tiếp từ vùng biển lạnh Alaska, thịt chắc ngọt đậm đà đẳng cấp đầu bếp 5 sao.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 3200000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Huỳnh Đế Đại Dương',
      slug: 'cua-huynh-de-dai-duong',
      description: 'Cua Huỳnh Đế đánh bắt từ vùng biển lạnh sâu xa bờ khơi Việt Nam, cực kỳ hiếm và bổ dưỡng cao.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 2500000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Dungeness Mỹ',
      slug: 'cua-dungeness-my',
      description: 'Cua Dungeness nổi tiếng từ bờ Tây nước Mỹ, nổi danh với phần gạch béo ngậy và sớ thịt ngọt dai tuyệt vời.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 1650000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Lột Mỹ Soft Shell',
      slug: 'cua-lot-my-soft-shell',
      description: 'Cua lột nhập khẩu Mỹ có thể ăn cả vỏ sau khi chế biến chiên giòn sốt me hoặc sốt trứng muối.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 1100000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Nâu Ireland Cao Cấp',
      slug: 'cua-nau-ireland-cao-cap',
      description: 'Cua nâu nhập khẩu Ireland siêu gạch béo ngậy ngập tràn vỏ cua, hương vị thơm bùi đặc trưng.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 950000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Năm Căn Cà Mau Loại I',
      slug: 'cua-nam-can-ca-mau-loai-i',
      description: 'Cua thịt được thu hoạch tự nhiên tại rừng ngập mặn Năm Căn Cà Mau, thịt chắc ngọt vô đối, không óp.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 850000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Ghẹ Xanh Phan Thiết Loại I',
      slug: 'ghe-xanh-phan-thiet-loai-i',
      description: 'Ghẹ xanh tự nhiên Phan Thiết bơi sống tại hồ, thịt ngọt lịm dai thơm, giàu canxi.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 650000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Đá Đảo Lý Sơn',
      slug: 'cua-da-dao-ly-son',
      description: 'Cua đá tự nhiên đảo Lý Sơn ăn rong biển núi lửa nên thịt rất thơm bùi, chắc nịch và ngọt đậm.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 420000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Đồng Vĩnh Long Sạch',
      slug: 'cua-dong-vinh-long-sach',
      description: 'Cua đồng quê Vĩnh Long xay sẵn nấu canh thanh mát giải nhiệt mùa hè, giàu giá trị dinh dưỡng.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'kg',
      priceReference: 120000,
      showContact: false,
      isVisible: true,
      categoryId: cuaGheId
    },
    {
      name: 'Cua Huỳnh Đế Khổng Lồ (Liên Hệ)',
      slug: 'cua-huynh-de-khong-lo-contact',
      description: 'Cua Huỳnh Đế kích cỡ khủng trên 2.5kg/con đánh bắt theo mùa. Vui lòng liên hệ hotline để nhận báo giá chi tiết.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      unit: 'con',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categoryId: cuaGheId
    }
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug }
    });

    if (!existing) {
      await prisma.product.create({
        data: prod
      });
      console.log(`✅ Created Product: ${prod.name}`);
    } else {
      console.log(`ℹ️ Product already exists: ${prod.name}`);
    }
  }

  // 4. Create Blog Posts
  const blogPostsData = [
    {
      title: 'Cách hấp cua hoàng đế ngon nhất tại nhà chuẩn 5 sao',
      slug: 'cach-hap-cua-hoang-de-ngon-nhat-tai-nha',
      content: 'Cua hoàng đế hấp bia sả gừng là món ăn đơn giản nhưng giữ trọn vị ngon ngọt tinh khiết tự nhiên của sớ thịt cua dày nạc...',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      isVisible: true,
      authorId: admin.id
    },
    {
      title: 'Bí quyết chọn cua Năm Căn Cà Mau nhiều thịt đầy gạch',
      slug: 'bi-quyet-chon-cua-nam-can-ca-mau-nhieu-thit-day-gach',
      content: 'Cua Năm Căn Cà Mau nổi tiếng chắc ngọt thơm ngon nhưng để chọn được cua chuẩn nhiều thịt và gạch béo bạn cần lưu ý phần mai và yếm...',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0FsNUIfEqFdwlA2XXjkc1OX3Z_4TChMVrC8Il63AjzyK7Cthamul_cIIp6AVCRkS4KdyUUktW0eKE15gXNtM-4P1vReWSOLg2_o7bdA3n65p5KtM09Q3cHJHeIzBC0Tm35kcMHsjvs6G-XfjAPnxVtVsorIFyhU4XKKXPT4fHqp1gBr69GH7r8FQDpNnjkKNnA0X8-xRgqUeMCd0gbElUDElnkNKF_MG6cRUyIFYsMMvHp-DsL-dy4VbZstCBRtCV37QfabGOBw',
      isVisible: true,
      authorId: admin.id
    }
  ];

  for (const post of blogPostsData) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug }
    });

    if (!existing) {
      await prisma.blogPost.create({
        data: post
      });
      console.log(`✅ Created Blog post: ${post.title}`);
    } else {
      console.log(`ℹ️ Blog post already exists: ${post.title}`);
    }
  }

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
