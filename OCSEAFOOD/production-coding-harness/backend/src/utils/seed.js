const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { uploadLocalFile } = require('../config/cloudinary');

const prisma = new PrismaClient();

// Helper to scan product directories, upload each image to Cloudinary,
// and return a comma-separated list of the resulting secure_urls
async function getProductImages(relDir) {
  const uploadsDir = process.env.SEED_IMAGES_DIR || path.join(__dirname, '../../uploads');
  const dirs = Array.isArray(relDir) ? relDir : [relDir];
  const allImages = [];

  for (const d of dirs) {
    const fullPath = path.join(uploadsDir, d.replace(/\//g, path.sep));
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Warning: Folder does not exist: ${fullPath}`);
      continue;
    }
    const files = fs.readdirSync(fullPath);
    const liveFiles = [];
    const processedFiles = [];

    for (const file of files) {
      const fileLower = file.toLowerCase();
      const ext = path.extname(fileLower);
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;

      if (fileLower === 'song.png' || fileLower === 'sống.png') {
        liveFiles.push(file);
      } else if (fileLower.startsWith('che_bien_')) {
        processedFiles.push({
          file,
          num: parseInt(fileLower.replace(/[^0-9]/g, '') || '0', 10)
        });
      }
    }

    // Sort processed images numerically
    processedFiles.sort((a, b) => a.num - b.num);

    const liveImages = [];
    for (const file of liveFiles) {
      const result = await uploadLocalFile(path.join(fullPath, file), 'ocseafood/seed');
      liveImages.push(result.secure_url);
    }
    const processedImages = [];
    for (const { file } of processedFiles) {
      const result = await uploadLocalFile(path.join(fullPath, file), 'ocseafood/seed');
      processedImages.push(result.secure_url);
    }

    allImages.push({ live: liveImages, processed: processedImages });
  }

  // Combine live and processed images (all live first, then all processed)
  const finalLive = [];
  const finalProcessed = [];
  for (const item of allImages) {
    finalLive.push(...item.live);
    finalProcessed.push(...item.processed);
  }

  const combined = [...finalLive, ...finalProcessed];
  return combined.join(',');
}

async function main() {
  console.log('🌱 Starting database seeding with scanned image paths...');

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
  // NOTE: banner source files (/uploads/<timestamp>-<random>.png) were previously uploaded
  // through the admin panel and no longer exist on disk here, so they can't be migrated to
  // Cloudinary automatically. Left null (schema-nullable) — re-upload via admin panel after deploy.
  const categoriesData = [
    {
      name: 'HÀNG NHẬP KHẨU',
      slug: 'hangnhapkhau',
      description: 'Hải sản cao cấp nhập khẩu trực tiếp từ các vùng biển sạch trên thế giới',
      banner: null,
      displayOrder: 0
    },
    {
      name: 'Cua - Ghẹ',
      slug: 'cua-ghe',
      description: 'Cua ghẹ tươi sống chất lượng cao nhập khẩu và nội địa sạch từ vùng biển sâu',
      banner: null,
      displayOrder: 1
    },
    {
      name: 'Tôm',
      slug: 'tom',
      description: 'Tôm các loại tươi sống bơi tại bể, chuẩn xuất khẩu',
      banner: null,
      displayOrder: 2
    },
    {
      name: 'Sò - Ốc',
      slug: 'so-oc',
      description: 'Sò điệp, bào ngư, hàu và các loại ốc tươi sống bồi bổ sức khỏe',
      banner: null,
      displayOrder: 3
    },
    {
      name: 'Cá',
      slug: 'ca',
      description: 'Cá biển cao cấp làm sạch phi lê hoặc tươi sống nguyên con',
      banner: null,
      displayOrder: 4
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
      category = await prisma.category.update({
        where: { id: category.id },
        data: {
          displayOrder: cat.displayOrder,
          banner: cat.banner || category.banner
        }
      });
      console.log(`✅ Updated Category displayOrder: ${cat.name}`);
    }
    categories[cat.slug] = category;
  }

  // Clear existing products to ensure clean seed
  await prisma.product.deleteMany({});
  console.log('🗑️ Deleted all products from database.');

  // 3. Define Products Data with dynamic image folders mapping
  // Note: Bút Đo Độ (missing category/folder) and Ốc Nhảy (missing folder) are deleted as requested.
  const productsData = [
    {
      name: 'Cua King Đỏ Na Uy',
      slug: 'cua-king-do-nauy',
      description: 'Cua King đỏ nhập khẩu trực tiếp từ vùng biển sâu Na Uy, thịt chắc ngọt đẳng cấp.',
      unit: 'kg',
      priceReference: 1312500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Cua Cái: 0,8 - 1,1 Kg:1312500',
        'Cua Đực: 0,8 - 1,1 Kg:1354500',
        'Cua Đực: 1,2 - 1,4 Kg:1417500',
        'Cua Gãy: 0,8 - 1,1 Kg:1207500'
      ],
      categorySlugs: ['cua-ghe', 'hangnhapkhau'],
      relDir: 'CUA/King Đỏ'
    },
    {
      name: 'Cua King Xanh',
      slug: 'cua-king-xanh',
      description: 'Cua King Xanh sống tươi nhập khẩu loại 1.',
      unit: 'kg',
      priceReference: 1816500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        '1,6kg - 1,9kg:1816500',
        '2kg - 2,5kg:1858500',
        '2,5kg - 2,9kg:1879500'
      ],
      categorySlugs: ['cua-ghe', 'hangnhapkhau'],
      relDir: 'CUA/KING XANH'
    },
    {
      name: 'Tôm Hùm Bông (Thiên Nhiên)',
      slug: 'tom-hum-bong-viet-nam',
      description: 'Tôm hùm bông thiên nhiên bơi sống tại hồ, chắc ngọt.',
      unit: 'kg',
      priceReference: 1837500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        '1,0 - 1,25 Kg:1837500',
        '1,3 - 1,45 Kg:1879500',
        '1,5 - 1,75 Kg:1921500',
        '1,8 - 1,95 Kg:1942500',
        '2,0 - 2,25 Kg:1879500',
        '2,3 - 2,5 Kg:1879500',
        '2,5 - 3,0 Kg:1879500'
      ],
      categorySlugs: ['tom'],
      relDir: 'TÔM/TÔM BÔNG VIỆT NAM'
    },
    {
      name: 'Cua Nâu Sofima',
      slug: 'cua-nau-sofima',
      description: 'Cua nâu Sofima nhập khẩu chất lượng cao.',
      unit: 'kg',
      priceReference: 504000,
      showContact: false,
      isVisible: true,
      categorySlugs: ['cua-ghe', 'hangnhapkhau'],
      relDir: 'CUA/CUA NÂU'
    },
    {
      name: 'Ốc Stubugai (Ốc Xà Cừ)',
      slug: 'oc-tsubugai',
      description: 'Ốc Tsubugai nhập khẩu Nhật Bản giòn ngọt thơm ngon.',
      unit: 'kg',
      priceReference: 525000,
      showContact: false,
      isVisible: true,
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/Oc Tsubugai'
    },
    {
      name: 'Sò Điệp Sống',
      slug: 'so-diep-song',
      description: 'Sò điệp bơi sống nhập khẩu từ vùng biển lạnh.',
      unit: 'kg',
      priceReference: 577500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Size 3 - 5:577500',
        'Size 6 - 8:546000',
        'Size 8 - 10:514500',
        'Size 10 - 12:472500'
      ],
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/sò điệp'
    },
    {
      name: 'Bào Ngư Hàn Quốc',
      slug: 'bao-ngu-han-quoc',
      description: 'Bào ngư Hàn Quốc bơi sống chất lượng hàng đầu.',
      unit: 'kg',
      priceReference: 472500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Size 14 - 15:472500',
        'Size 13 - 14:483000',
        'Size 11 - 12:504000',
        'Size 8 - 10:546000',
        'Size 5 - 6:661500'
      ],
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/BÀO NGƯ (HÀN QUỐC)'
    },
    {
      name: 'Hàu Vàng Hàn Quốc',
      slug: 'hau-vang-han-quoc',
      description: 'Hàu vàng Hàn Quốc thơm ngọt giàu dinh dưỡng.',
      unit: 'kg',
      priceReference: 262500,
      showContact: false,
      isVisible: true,
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/hàu vàng'
    },
    {
      name: 'Cá Bơn Vàng',
      slug: 'ca-bon-vang',
      description: 'Cá bơn vàng quý hiếm từ vùng biển sâu.',
      unit: 'kg',
      priceReference: 1459500,
      showContact: false,
      isVisible: true,
      categorySlugs: ['ca', 'hangnhapkhau'],
      relDir: 'Cá/Cá bơn/Cá bơn vàng'
    },
    {
      name: 'Cá Bơn Hàn Quốc',
      slug: 'ca-bon-han-quoc',
      description: 'Cá bơn Hàn Quốc tươi sống bơi khỏe.',
      unit: 'kg',
      priceReference: 661500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Bơn Nâu:661500',
        'Bơn Sao Safari:871500',
        'Bơn Trắng: Liên hệ'
      ],
      categorySlugs: ['ca', 'hangnhapkhau'],
      relDir: ['Cá/Cá bơn/bơn nâu', 'Cá/Cá bơn/TRẮNG']
    },
    {
      name: 'Bào Ngư Úc Ngọc Bích (Xanh Ngọc)',
      slug: 'bao-ngu-uc-ngoc-bich',
      description: 'Bào ngư Úc ngọc bích nổi tiếng với thịt mềm ngọt.',
      unit: 'kg',
      priceReference: 1176000,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Size 9 - 10 con/kg:1176000',
        'Size 7 - 9 con/kg:1207500',
        'Size 6 - 7 con/kg:1291500'
      ],
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/BÀO NGƯ ÚC'
    },
    {
      name: 'Tôm Hùm Đỏ (Tây Úc)',
      slug: 'tom-hum-do-tay-uc',
      description: 'Tôm hùm đỏ Tây Úc nhập khẩu bơi sống chất lượng thượng hạng.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['tom', 'hangnhapkhau'],
      relDir: 'TÔM/Tôm TÂY ÚC'
    },
    {
      name: 'Ốc Vòi Voi Ngà',
      slug: 'oc-voi-voi-nga',
      description: 'Ốc vòi voi ngà tươi sống giòn sần sật.',
      unit: 'kg',
      priceReference: 630000,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Size 0,5 - 0,8 Kg:630000',
        'Size 0,8 Kg+:661500'
      ],
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/ốc vòi voi ngà'
    },
    {
      name: 'Tôm Hùm Alaska',
      slug: 'tom-hum-alaska',
      description: 'Tôm hùm Alaska nhập khẩu trực tiếp từ vùng biển Canada.',
      unit: 'kg',
      priceReference: 808500,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Chix (400 - 550gr):808500',
        'Size 1,0 - 1,2 Kg:892500',
        'Size 1,3 - 1,7 Kg:913500',
        'Size 1,8 - 3,5 Kg:892500'
      ],
      categorySlugs: ['tom', 'hangnhapkhau'],
      relDir: 'TÔM/Tôm ALASKA'
    },
    {
      name: 'Tôm Hùm Xanh',
      slug: 'tom-hum-xanh',
      description: 'Tôm hùm xanh tươi sống bơi khỏe.',
      unit: 'kg',
      priceReference: 924000,
      showContact: false,
      isVisible: true,
      weightOptions: [
        'Size 3 - 4:924000',
        'Size 4 - 5:1018500'
      ],
      categorySlugs: ['tom', 'hangnhapkhau'],
      relDir: 'TÔM/Tom Xanh'
    },
    {
      name: 'Ốc Bulot Sofima',
      slug: 'oc-bulot-sofima',
      description: 'Ốc Bulot đông lạnh Sofima chất lượng nhập khẩu.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['so-oc'],
      relDir: 'So Oc/Bulot'
    },
    {
      name: 'Cua Nâu Sofima (Đông lạnh)',
      slug: 'cua-nau-sofima-frozen',
      description: 'Cua nâu Sofima đông lạnh tiện lợi.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['cua-ghe'],
      relDir: 'CUA/CUA NÂU'
    },
    {
      name: 'Bào Ngư Đông Lạnh',
      slug: 'bao-ngu-dong-lanh',
      description: 'Bào ngư đông lạnh tiện dụng, giữ trọn vị ngon ngọt.',
      unit: 'kg',
      priceReference: 205200,
      showContact: false,
      isVisible: true,
      categorySlugs: ['so-oc'],
      relDir: 'So Oc/BÀO NGƯ (HÀN QUỐC)'
    },
    {
      name: 'Cua Cốm',
      slug: 'cua-com',
      description: 'Cua cốm hai da siêu gạch béo ngọt.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['cua-ghe'],
      relDir: 'CUA/cua cốm'
    },
    {
      name: 'Cua Gạch Cà Mau',
      slug: 'cua-gach-ca-mau',
      description: 'Cua gạch Cà Mau nổi tiếng chắc ngọt đầy gạch.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['cua-ghe'],
      relDir: 'CUA/cua gạch cà mau'
    },
    {
      name: 'Cua Tuyết',
      slug: 'cua-tuyet',
      description: 'Cua Tuyết nhập khẩu tươi sống ngọt dai.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['cua-ghe', 'hangnhapkhau'],
      relDir: 'CUA/cua tuyết'
    },
    {
      name: 'Cá Hồi',
      slug: 'ca-hoi',
      description: 'Cá hồi Nauy nhập khẩu cao cấp.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['ca', 'hangnhapkhau'],
      relDir: 'Cá/cá hồi'
    },
    {
      name: 'Cá Trích Ép Trứng',
      slug: 'ca-trich-ep-trung',
      description: 'Cá trích ép trứng chuẩn Sashimi Nhật Bản.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['ca', 'hangnhapkhau'],
      relDir: 'Cá/cá trích ép trứng'
    },
    {
      name: 'Ốc Vòi Voi Canada Vàng',
      slug: 'oc-voi-voi-canada-vang',
      description: 'Ốc vòi voi Canada vàng nhập khẩu tươi sống.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['so-oc', 'hangnhapkhau'],
      relDir: 'So Oc/ỐC VÒI VOI VÀNG'
    },
    {
      name: 'Tôm Hùm Bông Úc',
      slug: 'tom-hum-bong-uc',
      description: 'Tôm hùm bông nhập khẩu từ Úc.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['tom', 'hangnhapkhau'],
      relDir: 'TÔM/Tôm BÔNG ÚC'
    },
    {
      name: 'Tôm Sú',
      slug: 'tom-su',
      description: 'Tôm sú biển tươi sống bơi khỏe.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['tom'],
      relDir: 'TÔM/Tom Sú'
    },
    {
      name: 'Tôm Mũ Ni',
      slug: 'tom-mu-ni',
      description: 'Tôm mũ ni tươi sống ngọt thịt.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['tom'],
      relDir: 'TÔM/TÔM MŨ NI'
    },
    {
      name: 'Tôm Tít',
      slug: 'tom-tit',
      description: 'Tôm tít (bề bề) sống nhảy bành bạch.',
      unit: 'kg',
      priceReference: null,
      showContact: true,
      isVisible: true,
      categorySlugs: ['tom'],
      relDir: 'TÔM/tôm tít'
    }
  ];

  for (const prod of productsData) {
    const { categorySlugs, relDir, ...productData } = prod;
    
    const categoryConnections = categorySlugs.map(slug => {
      const cat = categories[slug];
      if (!cat) throw new Error(`Category not found for slug: ${slug}`);
      return { id: cat.id };
    });

    const imagePaths = await getProductImages(relDir);

    await prisma.product.create({
      data: {
        ...productData,
        image: imagePaths,
        categories: {
          connect: categoryConnections
        }
      }
    });
    console.log(`✅ Created Product: ${prod.name} (images: ${imagePaths.split(',').length})`);
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
  console.warn('⚠️ Category banners were left null — re-upload the 5 banner images via the admin panel.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
