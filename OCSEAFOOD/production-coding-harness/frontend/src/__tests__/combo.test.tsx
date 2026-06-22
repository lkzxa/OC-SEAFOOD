import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ComboPage from "../app/combo/page";
import { useCartStore } from "../store/useCartStore";

vi.mock("next/navigation", () => ({
  usePathname: () => "/combo",
}));

describe("Combo Selection Page", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("should render page header, introduction and benefits", () => {
    render(<ComboPage />);

    // Check header/introduction text
    expect(screen.getByText(/GÓI TIỆC GIA ĐÌNH/i)).not.toBeNull();
    expect(screen.getByText(/Sản Phẩm Hải Sản/i)).not.toBeNull();
    expect(screen.getAllByText(/ỐC SEAFOOD/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ỐC SEAFOOD là hệ thống siêu thị hải sản cao cấp/i)).not.toBeNull();

    // Check key benefits
    expect(screen.getByText("Nguồn gốc rõ ràng")).not.toBeNull();
    expect(screen.getByText("Bảo quản sống")).not.toBeNull();
    expect(screen.getByText("Dịch vụ tiện lợi")).not.toBeNull();
    expect(screen.getByText("Đổi trả 1-1")).not.toBeNull();
  });

  it("should render all 6 premium combos with correct names and prices", () => {
    render(<ComboPage />);

    // Verify 6 combos are rendered
    expect(screen.getByText("Combo Hải Sản Hoàng Gia")).not.toBeNull();
    expect(screen.getByText("Set Lẩu Hải Sản Đại Dương")).not.toBeNull();
    expect(screen.getByText("Combo Nướng BBQ Special")).not.toBeNull();
    expect(screen.getByText("Set Sashimi Thượng Hạng")).not.toBeNull();
    expect(screen.getByText("Combo Cua Cà Mau Sốt")).not.toBeNull();
    expect(screen.getByText("Set Nghêu Sò Toàn Diện")).not.toBeNull();

    // Verify badges
    expect(screen.getByText("-15%")).not.toBeNull();
    expect(screen.getByText("POPULAR")).not.toBeNull();

    // Verify some formatted prices
    expect(screen.getByText(/6\.350\.000/)).not.toBeNull(); // Combo Hoàng Gia
    expect(screen.getByText(/2\.890\.000/)).not.toBeNull(); // Set Lẩu
    expect(screen.getByText(/1\.680\.000/)).not.toBeNull(); // Set Nghêu Sò
  });

  it("should render promo banner and promo code details", () => {
    render(<ComboPage />);

    expect(screen.getByText(/Ưu đãi độc quyền cho COMBO 5 NGƯỜI/i)).not.toBeNull();
    expect(screen.getByText("COMBO50")).not.toBeNull();
    expect(screen.getByText("Freeship 10km")).not.toBeNull();
    expect(screen.getByText("Tặng Vang Trắng")).not.toBeNull();
  });

  it("should support adding combos to cart when clicking Mua Ngay", () => {
    render(<ComboPage />);

    const buyButtons = screen.getAllByRole("button", { name: /Mua Ngay/i });
    expect(buyButtons.length).toBe(6);

    // Click on "Combo Hải Sản Hoàng Gia" which is the first one
    fireEvent.click(buyButtons[0]);

    // Cart store should have 1 item
    const cartItems = useCartStore.getState().items;
    expect(cartItems.length).toBe(1);
    expect(cartItems[0]).toEqual({
      id: 9001,
      name: "Combo Hải Sản Hoàng Gia",
      priceReference: 6350000,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a6RxEO1vB73aKYmRIRDah7wSPW-C1gGL5-XkJU5jbKr0nbysvyD-C5AMGkjg0itfZKd2Z4PXgcO3csDHbrnfuBeW7vxuxR2iAR79v64Z0--2KOiwUqszSqc3ubtgmXmMDDeYRfa8AeBsd6wiQjyAjhChyYyBv2Mx-dEwqt4QsU-FNVv5L1GShmqEU_qJc6t1uPXLgtisHjTGpFiNwt9H8qd_nZGRgYr998yTdWfH01vI8xvzjQVNhBgH0CcWomu1RuCz_JvhJ0",
      unit: "set",
      quantity: 1,
    });
  });
});
