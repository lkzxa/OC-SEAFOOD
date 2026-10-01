import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ComboPage from "../app/combo/page";
import { useCartStore } from "../store/useCartStore";
import { COMBOS } from "../data/combos";

vi.mock("next/navigation", () => ({
  usePathname: () => "/combo",
}));

describe("Combo Selection Page", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(COMBOS),
    }) as unknown as typeof global.fetch;
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

  it("should render all premium combos with correct names and prices", async () => {
    render(<ComboPage />);

    // Verify combo tiers are rendered using findBy to wait for async loading state
    expect(await screen.findByText("Combo Gia Đình Tiết Kiệm")).not.toBeNull();
    expect(screen.getByText("Set Lẩu Hải Sản Đại Dương")).not.toBeNull();
    expect(screen.getByText("Combo BBQ Hải Sản Cao Cấp")).not.toBeNull();
    expect(screen.getByText("Combo Hải Sản Hoàng Gia")).not.toBeNull();
    expect(screen.getByText("Combo Tiệc Gia Đình Premium")).not.toBeNull();
    expect(screen.getByText("Set Đại Tiệc Sashimi & BBQ")).not.toBeNull();
    expect(screen.getByText("Combo King Crab Party")).not.toBeNull();
    expect(screen.getByText("Combo Tiệc Công Ty VIP")).not.toBeNull();
    expect(screen.getByText("Set Luxury Seafood Banquet")).not.toBeNull();
    expect(screen.getByText("Combo Đại Tiệc Hoàng Gia")).not.toBeNull();

    // Verify badges
    expect(screen.getByText("-12%")).not.toBeNull();
    expect(screen.getByText("POPULAR")).not.toBeNull();
    expect(screen.getByText("HOÀNG GIA")).not.toBeNull();

    // Verify some formatted prices
    expect(screen.getByText(/2\.000\.000/)).not.toBeNull(); // Gia đình tiết kiệm
    expect(screen.getByText(/7\.500\.000/)).not.toBeNull(); // Combo Hoàng Gia
    expect(screen.getByText(/Từ 50\.000\.000/)).not.toBeNull(); // VIP top tier
  });

  it("should render promo banner and promo code details", () => {
    render(<ComboPage />);

    expect(screen.getByText(/Ưu đãi độc quyền cho COMBO 5 NGƯỜI/i)).not.toBeNull();
    expect(screen.getByText("COMBO50")).not.toBeNull();
    expect(screen.getByText("Freeship 10km")).not.toBeNull();
    expect(screen.getByText("Tặng Vang Trắng")).not.toBeNull();
  });

  it("should support adding combos to cart when clicking Mua Ngay", async () => {
    render(<ComboPage />);

    const buyButtons = await screen.findAllByRole("button", { name: /Mua Ngay/i });
    expect(buyButtons.length).toBe(6);
    expect(await screen.findAllByRole("link", { name: /Liên Hệ/i })).toHaveLength(4);

    // Click on "Combo Gia Đình Tiết Kiệm"; default sort places it after the higher-priced tiers
    fireEvent.click(buyButtons[5]);

    // Cart store should have 1 item
    const cartItems = useCartStore.getState().items;
    expect(cartItems.length).toBe(1);
    expect(cartItems[0]).toEqual({
      id: 9001,
      name: "Combo Gia Đình Tiết Kiệm",
      priceReference: 2000000,
      image: "/Banner.png",
      unit: "set",
      quantity: 1,
      isCombo: true,
    });
  });
});
