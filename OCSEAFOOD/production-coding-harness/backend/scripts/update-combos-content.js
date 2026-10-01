const prisma = require('../src/config/prisma');

const combos = [
  {
    id: 9001,
    name: 'Combo Gia Đình Tiết Kiệm',
    slug: 'combo-hai-san-hoang-gia',
    description: 'Set hải sản gọn cho 3-4 người, cân đối giữa tôm hùm, sò điệp, hàu và bào ngư để gia đình dễ dùng trong bữa cuối tuần.',
    originalPrice: null,
    price: 2000000,
    showContact: false,
    discountBadge: null,
    tag: '2 TRIỆU',
    items: [
      'Tôm Hùm Xanh khoảng 1kg',
      'Sò Điệp Sống khoảng 0.5kg',
      'Hàu Vàng Hàn Quốc khoảng 1kg',
      'Bào Ngư Đông Lạnh khoảng 0.5kg',
      'Sốt bơ tỏi và muối ớt xanh dùng kèm',
    ],
  },
  {
    id: 9002,
    name: 'Set Lẩu Hải Sản Đại Dương',
    slug: 'set-lau-hai-san-dai-duong',
    description: 'Set lẩu 4-5 người dùng Tôm Hùm Alaska, Tôm Hùm Xanh, Sò Điệp Sống và Bào Ngư Hàn Quốc, phù hợp tiệc gia đình.',
    originalPrice: null,
    price: 3500000,
    showContact: false,
    discountBadge: null,
    tag: 'POPULAR',
    items: [
      'Tôm Hùm Alaska khoảng 1kg',
      'Tôm Hùm Xanh khoảng 1kg',
      'Sò Điệp Sống khoảng 1kg',
      'Bào Ngư Hàn Quốc khoảng 0.5kg',
      'Nước lẩu hải sản, rau nấm và mì tươi ăn kèm',
    ],
  },
  {
    id: 9003,
    name: 'Combo BBQ Hải Sản Cao Cấp',
    slug: 'combo-nuong-bbq-special',
    description: 'Combo nướng 5-6 người với Tôm Hùm Xanh, Cua Nâu Sofima, Sò Điệp, Hàu Vàng và Bào Ngư; phù hợp tiệc sân vườn.',
    originalPrice: null,
    price: 5000000,
    showContact: false,
    discountBadge: null,
    tag: null,
    items: [
      'Tôm Hùm Xanh khoảng 1.5kg nướng bơ tỏi hoặc muối ớt',
      'Cua Nâu Sofima khoảng 1kg',
      'Sò Điệp Sống khoảng 1kg',
      'Hàu Vàng Hàn Quốc khoảng 1kg',
      'Bào Ngư Hàn Quốc khoảng 0.5kg, kèm sốt BBQ hải sản',
    ],
  },
  {
    id: 9004,
    name: 'Combo Hải Sản Hoàng Gia',
    slug: 'set-sashimi-thuong-hang',
    description: 'Set tiệc 6-8 người từ Cua King Xanh, Tôm Hùm Bông, Bào Ngư Úc, Sò Điệp Sống và Bào Ngư Hàn Quốc.',
    originalPrice: 8500000,
    price: 7500000,
    showContact: false,
    discountBadge: '-12%',
    tag: null,
    items: [
      'Cua King Xanh sống tuyển size lớn, khoảng 1.5kg',
      'Tôm Hùm Bông thiên nhiên khoảng 1kg',
      'Bào Ngư Úc Ngọc Bích khoảng 1kg',
      'Sò Điệp Sống khoảng 1kg',
      'Bào Ngư Hàn Quốc khoảng 0.5kg',
    ],
  },
  {
    id: 9005,
    name: 'Combo Tiệc Gia Đình Premium',
    slug: 'combo-cua-ca-mau-sot',
    description: 'Combo 8-10 người dành cho tiệc gia đình cao cấp với Cua King Đỏ Na Uy, Tôm Hùm Alaska, Bào Ngư Úc và Cá Bơn Hàn Quốc.',
    originalPrice: null,
    price: 10000000,
    showContact: false,
    discountBadge: null,
    tag: null,
    items: [
      'Cua King Đỏ Na Uy khoảng 2kg',
      'Tôm Hùm Alaska khoảng 2kg',
      'Bào Ngư Úc Ngọc Bích khoảng 1kg',
      'Cá Bơn Hàn Quốc khoảng 1kg',
      'Sò Điệp Sống khoảng 1kg, kèm sốt chế biến',
    ],
  },
  {
    id: 9006,
    name: 'Set Đại Tiệc Sashimi & BBQ',
    slug: 'set-ngheu-so-toan-dien',
    description: 'Set 10-12 người kết hợp sashimi và BBQ từ Cá Bơn Vàng, Ốc Vòi Voi Ngà, Ốc Tsubugai, Tôm Hùm Bông và Sò Điệp.',
    originalPrice: null,
    price: 15000000,
    showContact: false,
    discountBadge: null,
    tag: 'PREMIUM',
    items: [
      'Cá Bơn Vàng khoảng 2kg thái sashimi',
      'Ốc Vòi Voi Ngà khoảng 1.5kg',
      'Ốc Tsubugai khoảng 1kg',
      'Tôm Hùm Bông thiên nhiên khoảng 2kg',
      'Sò Điệp Sống khoảng 1.5kg, kèm gia vị sashimi và BBQ',
    ],
  },
  {
    id: 9007,
    name: 'Combo King Crab Party',
    slug: 'combo-king-crab-party',
    description: 'Set đặt trước cho 12-15 người, tập trung Cua King Xanh, Cua King Đỏ, Tôm Hùm Bông, Bào Ngư Úc và Sò Điệp.',
    originalPrice: null,
    price: 20000000,
    showContact: true,
    discountBadge: null,
    tag: 'ĐẶT TRƯỚC',
    items: [
      'Cua King Xanh khoảng 3kg',
      'Cua King Đỏ Na Uy khoảng 3kg',
      'Tôm Hùm Bông thiên nhiên khoảng 2kg',
      'Bào Ngư Úc Ngọc Bích khoảng 2kg',
      'Sò Điệp Sống khoảng 2kg, tư vấn chế biến theo tiệc',
    ],
  },
  {
    id: 9008,
    name: 'Combo Tiệc Công Ty VIP',
    slug: 'combo-tiec-cong-ty-vip',
    description: 'Set tư vấn riêng cho 18-25 người, phù hợp tiệc công ty, khai trương hoặc chiêu đãi đối tác với nhiều dòng hải sản cao cấp.',
    originalPrice: null,
    price: 30000000,
    showContact: true,
    discountBadge: null,
    tag: 'VIP',
    items: [
      'Cua King Xanh và Cua King Đỏ tổng khoảng 6kg',
      'Tôm Hùm Bông và Tôm Hùm Alaska tổng khoảng 5kg',
      'Bào Ngư Úc Ngọc Bích khoảng 2kg',
      'Cá Bơn Vàng khoảng 2kg',
      'Sò Điệp Sống, Ốc Vòi Voi và hàu theo ngân sách tiệc',
    ],
  },
  {
    id: 9009,
    name: 'Set Luxury Seafood Banquet',
    slug: 'set-luxury-seafood-banquet',
    description: 'Set luxury cho 25-35 người, ưu tiên King Crab, tôm hùm, bào ngư, sashimi cá bơn và ốc vòi voi cho bàn tiệc cao cấp.',
    originalPrice: null,
    price: 40000000,
    showContact: true,
    discountBadge: null,
    tag: 'LUXURY',
    items: [
      'Cua King Xanh và Cua King Đỏ tổng khoảng 8kg',
      'Tôm Hùm Bông, Tôm Hùm Alaska và Tôm Hùm Xanh tổng khoảng 7kg',
      'Bào Ngư Úc và Bào Ngư Hàn Quốc tổng khoảng 4kg',
      'Cá Bơn Vàng sashimi khoảng 3kg',
      'Ốc Vòi Voi Ngà, Sò Điệp Sống và Hàu Vàng Hàn Quốc theo set tiệc',
    ],
  },
  {
    id: 9010,
    name: 'Combo Đại Tiệc Hoàng Gia',
    slug: 'combo-dai-tiec-hoang-gia',
    description: 'Combo cao cấp nhất cho 35-50 người, thiết kế theo ngân sách 50 triệu với các dòng cua king, tôm hùm, bào ngư, cá bơn và ốc vòi voi.',
    originalPrice: null,
    price: 50000000,
    showContact: true,
    discountBadge: null,
    tag: 'HOÀNG GIA',
    items: [
      'Cua King Xanh và Cua King Đỏ chọn size lớn theo ngày hàng',
      'Tôm Hùm Bông, Tôm Hùm Alaska và Tôm Hùm Xanh chia theo món',
      'Bào Ngư Úc Ngọc Bích, Bào Ngư Hàn Quốc và Bào Ngư Đông Lạnh',
      'Cá Bơn Vàng, Cá Bơn Hàn Quốc, Ốc Vòi Voi Ngà và Ốc Tsubugai',
      'Tư vấn menu chế biến, chia món và lịch giao riêng cho sự kiện',
    ],
  },
];

async function main() {
  for (const combo of combos) {
    const existing = await prisma.combo.findUnique({ where: { id: combo.id } });
    if (existing) {
      await prisma.combo.update({ where: { id: combo.id }, data: combo });
      console.log(`updated ${combo.id} ${combo.name}`);
    } else {
      await prisma.combo.create({
        data: {
          ...combo,
          image: '/Banner.png',
          isVisible: true,
        },
      });
      console.log(`created ${combo.id} ${combo.name}`);
    }
  }
}

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error.message || error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = {
  combos,
  main,
};
