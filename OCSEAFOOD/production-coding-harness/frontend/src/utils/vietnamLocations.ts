export interface LocationNode {
  code: string;
  name: string;
}

export interface DistrictNode extends LocationNode {
  wards: LocationNode[];
}

export interface ProvinceNode extends LocationNode {
  districts: DistrictNode[];
}

export const vietnamLocations: ProvinceNode[] = [
  {
    code: 'Hanoi',
    name: 'Hà Nội',
    districts: [
      {
        code: 'Hoan Kiem',
        name: 'Quận Hoàn Kiếm',
        wards: [
          { code: 'Hang Bac', name: 'Phường Hàng Bạc' },
          { code: 'Hang Dao', name: 'Phường Hàng Đào' },
          { code: 'Trang Tien', name: 'Phường Tràng Tiền' },
        ]
      },
      {
        code: 'Ba Dinh',
        name: 'Quận Ba Đình',
        wards: [
          { code: 'Cong Vi', name: 'Phường Cống Vị' },
          { code: 'Dien Bien', name: 'Phường Điện Biên' },
        ]
      },
      {
        code: 'Cau Giay',
        name: 'Quận Cầu Giấy',
        wards: [
          { code: 'Dich Vong', name: 'Phường Dịch Vọng' },
          { code: 'Nghia Tan', name: 'Phường Nghĩa Tân' },
        ]
      }
    ]
  },
  {
    code: 'HCM',
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        code: 'District 1',
        name: 'Quận 1',
        wards: [
          { code: 'Ben Nghe', name: 'Phường Bến Nghé' },
          { code: 'Ben Thanh', name: 'Phường Bến Thành' },
          { code: 'Da Kao', name: 'Phường Đa Kao' },
        ]
      },
      {
        code: 'District 3',
        name: 'Quận 3',
        wards: [
          { code: 'Vo Thi Sau', name: 'Phường Võ Thị Sáu' },
        ]
      },
      {
        code: 'Binh Thanh',
        name: 'Quận Bình Thạnh',
        wards: [
          { code: 'Ward 25', name: 'Phường 25' },
        ]
      }
    ]
  },
  {
    code: 'Danang',
    name: 'Đà Nẵng',
    districts: [
      {
        code: 'Hai Chau',
        name: 'Quận Hải Châu',
        wards: [
          { code: 'Thach Thang', name: 'Phường Thạch Thang' },
          { code: 'Hoa Cuong Bac', name: 'Phường Hòa Cường Bắc' },
        ]
      },
      {
        code: 'Son Tra',
        name: 'Quận Sơn Trà',
        wards: [
          { code: 'An Hai Bac', name: 'Phường An Hải Bắc' },
        ]
      }
    ]
  }
];
