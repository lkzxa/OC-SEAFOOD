const prisma = require('./prisma');

async function seedCombos() {
  try {
    const count = await prisma.combo.count();
    if (count > 0) {
      console.log('Combos already seeded in database.');
      return;
    }

    console.log('Database table "Combo" is empty. Seeding 6 premium combos...');

    const initialCombos = [
      {
        id: 9001,
        name: "Combo Hải Sản Hoàng Gia",
        slug: "combo-hai-san-hoang-gia",
        description: "Set bao gồm: King Crab (1.5kg), 2 Tôm Hùm Canada, 5 Bào Ngư Hàn Quốc, Sò Điệp Nhật áp chảo.",
        originalPrice: 7500000,
        price: 6350000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a6RxEO1vB73aKYmRIRDah7wSPW-C1gGL5-XkJU5jbKr0nbysvyD-C5AMGkjg0itfZKd2Z4PXgcO3csDHbrnfuBeW7vxuxR2iAR79v64Z0--2KOiwUqszSqc3ubtgmXmMDDeYRfa8AeBsd6wiQjyAjhChyYyBv2Mx-dEwqt4QsU-FNVv5L1GShmqEU_qJc6t1uPXLgtisHjTGpFiNwt9H8qd_nZGRgYr998yTdWfH01vI8xvzjQVNhBgH0CcWomu1RuCz_JvhJ0",
        discountBadge: "-15%",
        items: [
          "1 King Crab sống nguyên con (1.5kg)",
          "2 Tôm Hùm Canada tươi sống nhập khẩu",
          "5 Bào Ngư Hàn Quốc thượng hạng",
          "Sò Điệp Nhật áp chảo sốt bơ tỏi thơm lừng"
        ]
      },
      {
        id: 9002,
        name: "Set Lẩu Hải Sản Đại Dương",
        slug: "set-lau-hai-san-dai-duong",
        description: "Nước dùng lẩu đặc biệt, 1kg Tôm Càng, Mực lá, Ngao hai cồi, Cá hồi Nauy, Rau nấm đi kèm.",
        price: 2890000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHnBDbiAYEdjJ5rd06Icy6xWoxw8t37Uqtfw447_WshQ20keFiFR2brdjaBNR-v7v7cSQ-mBTH03RkYsR2xk8qpYe2DUBDlhlaBk_ns3ET8_gXZuvYjge8wa_do8FUph04YFiFkLYS2svjd8z-rI4K9FNmm1L2pC9szu_EPUBNSoHanuuXUTWXPgbXu47FaWGyFdmXBxiKZXUgigDLvTlCwqT40i1RhUVjzBvW6cgrB_DucrCwZvxHzql6EVbARQakJKkoV_QUJt4",
        tag: "POPULAR",
        items: [
          "Nước lẩu chua cay Tomyum đặc chế từ đầu bếp Ốc Seafood",
          "1kg Tôm Càng xanh tươi sống bật nhảy",
          "Mực lá Phan Thiết dày cơm, thái khoanh giòn ngọt",
          "Ngao hai cồi lớn chắc thịt",
          "Cá hồi Nauy tươi cắt lát",
          "Đĩa rau nấm thập cẩm, mì tươi ăn kèm"
        ]
      },
      {
        id: 9003,
        name: "Combo Nướng BBQ Special",
        slug: "combo-nuong-bbq-special",
        description: "10 Tôm Sú nướng muối ớt, Mực trứng nướng sa tế, 10 Hàu mỡ hành, Bạch tuộc sốt cay.",
        price: 1950000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWROMU8tRJjSla2O1w_YNEbcFzMb4pGK01OXsgmyhz6EK7nSmm9tuW1XoRvwfCryte0lYV-yU3BG5FNSF7mZgAoDywbQbDsH3Zz51xFp8rBYo7FWb_Rg85KiuitBQjBWjDHv8v9paTbGJV5er5rg6swCtq2cNLBdv792g4RyHHOX6Ge7IJvMlaNqdMYSWnxTMvHgjAR5WE5X4QOQ4-owM7b0AmtEBXj0jXUT9UbJCKisD7habqtRE2NjSZyWC43Q1uGJK0CgrKgQc",
        items: [
          "10 Tôm Sú lớn nướng muối ớt cay nồng đậm vị",
          "Mực trứng nướng sa tế giòn giòn béo béo",
          "10 Hàu sữa Thái Bình Dương nướng mỡ hành thơm phức",
          "Bạch tuộc nướng sốt cay đậm đà chuẩn vị"
        ]
      },
      {
        id: 9004,
        name: "Set Sashimi Thượng Hạng",
        slug: "set-sashimi-thuong-hang",
        description: "Cá hồi Nauy, Cá trích ép trứng, Sò đỏ Nhật, Bạch tuộc, Tôm ngọt Amaebi (Dành cho 5 khách).",
        price: 3450000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1hcEW7Y6VFVrcWBFhM7XBe-M6pid0MIL2A4bsdbNQP4ahWXlVPyqWTYMg_2SUY6gxxoqTfvmscwXR_xHy_H6E3n9rAYKlg6eAIOQeBFejhBeYBkJO-FBQXuS3MJO9liB7cXby8cFgy2NkbjvIaNw_Mo6Ut8ksvYn5O6m1SjrMmYqP20L3_jaOQBoRo31sOPXDEbq9Z1S76tTChDffs5KFrKIwuBoYNuTi_AFssrgR7sKkm9FKbGyrrgvGEddVrzhel9yx3NlYI8s",
        items: [
          "Sashimi Cá hồi Nauy fillet béo ngậy thái dày",
          "Sashimi Cá trích ép trứng Nhật Bản giòn sần sật",
          "Sashimi Sò đỏ Hokkigai tươi ngọt tự nhiên",
          "Sashimi Bạch tuộc Tako luộc chín thái mỏng",
          "Sashimi Tôm ngọt Amaebi ngọt lịm cao cấp",
          "Tặng kèm set Wasabi tươi, gừng hồng Nhật và nước tương"
        ]
      },
      {
        id: 9005,
        name: "Combo Cua Cà Mau Sốt",
        slug: "combo-cua-ca-mau-sot",
        description: "3 Cua Cà Mau lớn (800g/con) sốt Trứng muối hoặc sốt Singapore, kèm bánh mì nóng giòn.",
        price: 2200000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsIEm9JE51ckFL8T11IKcVqVUjwo3Hvx50t4_Sgx2Tl3zmakRCgVzJ6eCtojatljmrRJli-Nw3uF3sonxCxxaoxikYrmyoUX1Kv-Zacn0NarhNndOlaN5zSP268pPD6kS_-pd1o741S0da5Q380r70kFmOh1CqZjW7h4YARWlku-jkzXAEHJLmbAHi8TB646NhijBu1DR3znQ-Lzr7XyNK9fLzqiKIsFwsMpT2_Techq4_FupmQPZ1RriJzQSVAL56o76-rwRdJSo",
        items: [
          "3 Cua Cà Mau lớn chắc thịt đầy gạch (khoảng 800g/con)",
          "Lựa chọn Sốt Trứng Muối hoàng kim béo ngậy hoặc Sốt Ớt Singapore cay cay nồng nàn",
          "4 ổ Bánh mì đặc ruột nóng hổi giòn rụm dùng kèm nước sốt thần thánh"
        ]
      },
      {
        id: 9006,
        name: "Set Nghêu Sò Toàn Diện",
        slug: "set-ngheu-so-toan-dien",
        description: "Ốc hương cháy tỏi, Ngao hai cồi hấp sả, Sò dương nướng mỡ hành, Ốc móng tay xào rau muống.",
        price: 1680000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTBlWqWPDBWt2EjjpKWQp3x1SXsSAdGspaFJnE2uORAZq6vbJGJHlLbOvzDUfPsf8395e6ePT1dwkYECkMuHV8vaLROPZZxzMBiccXVZ7YZeBOTvOxiygWRcQfJkymgJQRoOmtnescNNHoOMTq0b32UZlYqA5PBn7B17wijIQQ-XJWFrastx9q1u6-sXBEDtxQ7eBlXg4t1oC2GuPIoBB3T-eDKbO4HJDa07MnG08tYVHuZhZYZR1969ZQv2GCIUWHiJfKhKFEI5o",
        items: [
          "Ốc hương thiên nhiên xào bơ tỏi thơm giòn quyến rũ",
          "Ngao hai cồi hấp sả ớt nước trong ngọt thanh thanh",
          "Sò dương lớn nướng mỡ hành đậu phộng thơm bùi",
          "Ốc móng tay xào rau muống tỏi giòn ngọt xanh mướt"
        ]
      }
    ];

    await prisma.combo.createMany({
      data: initialCombos
    });
    console.log('Seeded 6 premium combos successfully!');
  } catch (err) {
    console.error('Error seeding combos:', err);
  }
}

module.exports = {
  seedCombos
};
