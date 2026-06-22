import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ProductDetailContent from "../app/product/[slug]/ProductDetailContent";
import { useCartStore } from "../store/useCartStore";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockProduct = {
  id: 101,
  name: "Cua Huỳnh Đế Hoàng Gia",
  slug: "cua-huynh-de-hoang-gia",
  description: "Cua siêu ngon tươi rói béo ngậy",
  image: "https://example.com/cua.jpg",
  unit: "Con (1.5kg - 2kg)",
  priceReference: 1500000,
  showContact: false,
  isVisible: true,
  categoryId: 1,
  category: {
    id: 1,
    name: "Cua - Ghẹ",
    slug: "cua-ghe",
  },
};

const mockRelatedProducts = {
  data: [
    {
      id: 102,
      name: "Ghẹ Xanh Phan Thiết",
      slug: "ghe-xanh-phan-thiet",
      description: "Ghẹ tươi ngọt",
      image: "https://example.com/ghe.jpg",
      unit: "kg",
      priceReference: 650000,
      showContact: false,
      isVisible: true,
      categoryId: 1,
    },
    {
      id: 103,
      name: "Tôm Hùm Bông",
      slug: "tom-hum-bong",
      description: "Tôm hùm thượng hạng",
      image: "https://example.com/tom.jpg",
      unit: "kg",
      priceReference: 0,
      showContact: true,
      isVisible: true,
      categoryId: 1,
    },
  ],
  pagination: {
    total: 2,
  },
};

describe("Product Detail Page Content", () => {
  beforeEach(() => {
    mockPush.mockClear();
    useCartStore.getState().clearCart();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/products/slug/cua-huynh-de-hoang-gia")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }
      if (url.includes("/api/products?categoryId=1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRelatedProducts),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Product not found" }),
      });
    }) as unknown as typeof global.fetch;
  });

  it("should render loading skeleton first, then load and render product details", async () => {
    render(<ProductDetailContent slug="cua-huynh-de-hoang-gia" />);

    // Wait for the product name to be displayed in h1 heading
    await screen.findByRole("heading", { name: "Cua Huỳnh Đế Hoàng Gia" });

    // Check breadcrumbs
    expect(screen.getByText("Trang chủ")).not.toBeNull();
    expect(screen.getByText("Thực đơn")).not.toBeNull();
    expect(screen.getByText("Cua - Ghẹ")).not.toBeNull();

    // Check pricing and details
    expect(screen.getByText(/1\.500\.000/)).not.toBeNull();
    expect(screen.getByText(/Con \(1\.5kg - 2kg\)/)).not.toBeNull();
    expect(screen.getByText("Cua siêu ngon tươi rói béo ngậy")).not.toBeNull();

    // Verify Tab buttons
    expect(screen.getByText("Mô tả sản phẩm")).not.toBeNull();
    expect(screen.getByText("Gợi ý chế biến món ngon")).not.toBeNull();
    expect(screen.getByText("Hướng dẫn bảo quản")).not.toBeNull();
  });

  it("should handle quantity adjustment limits (1 to 99)", async () => {
    render(<ProductDetailContent slug="cua-huynh-de-hoang-gia" />);
    await screen.findByRole("heading", { name: "Cua Huỳnh Đế Hoàng Gia" });

    const quantityInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(quantityInput.value).toBe("1");

    // Click plus button
    const plusBtn = screen.getByLabelText("Increase quantity");
    fireEvent.click(plusBtn);
    expect(quantityInput.value).toBe("2");

    // Click minus button
    const minusBtn = screen.getByLabelText("Decrease quantity");
    fireEvent.click(minusBtn);
    expect(quantityInput.value).toBe("1");

    // Click minus again, should stay at 1
    fireEvent.click(minusBtn);
    expect(quantityInput.value).toBe("1");

    // Set input value manually
    fireEvent.change(quantityInput, { target: { value: "10" } });
    expect(quantityInput.value).toBe("10");

    // Set out-of-bound value (e.g. 150), should clamp to 99
    fireEvent.change(quantityInput, { target: { value: "150" } });
    expect(quantityInput.value).toBe("99");
  });

  it("should support adding to cart and showing success toast", async () => {
    render(<ProductDetailContent slug="cua-huynh-de-hoang-gia" />);
    await screen.findByRole("heading", { name: "Cua Huỳnh Đế Hoàng Gia" });

    const addBtn = screen.getAllByRole("button", { name: "Thêm vào giỏ" })[0];
    fireEvent.click(addBtn);

    // Verify cart store has item with quantity 1
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(101);
    expect(items[0].quantity).toBe(1);

    // Verify Toast is shown
    expect(screen.getByText(/Đã thêm 1 sản phẩm vào giỏ hàng!/i)).not.toBeNull();
  });

  it("should support Buy Now action, adding to cart and redirecting to /cart", async () => {
    render(<ProductDetailContent slug="cua-huynh-de-hoang-gia" />);
    await screen.findByRole("heading", { name: "Cua Huỳnh Đế Hoàng Gia" });

    // Increase quantity first to 3
    const plusBtn = screen.getByLabelText("Increase quantity");
    fireEvent.click(plusBtn);
    fireEvent.click(plusBtn);

    const buyNowBtn = screen.getByRole("button", { name: "Mua ngay" });
    fireEvent.click(buyNowBtn);

    // Verify cart store has item with quantity 3
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(3);

    // Verify router pushed to /cart
    expect(mockPush).toHaveBeenCalledWith("/cart");
  });

  it("should render error view if product is not found", async () => {
    render(<ProductDetailContent slug="non-existent" />);

    // Wait for the error heading
    await screen.findByText("Sản phẩm không tồn tại");
    expect(screen.getByText("Quay lại thực đơn")).not.toBeNull();
  });

  it("should show Zalo and Hotline contact buttons if product has showContact or price <= 0", async () => {
    const contactProduct = {
      ...mockProduct,
      id: 104,
      name: "Tôm Hùm Bông Liên Hệ",
      slug: "tom-hum-bong-lien-he",
      priceReference: 0,
      showContact: true,
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/products/slug/tom-hum-bong-lien-he")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(contactProduct),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    }) as unknown as typeof global.fetch;

    render(<ProductDetailContent slug="tom-hum-bong-lien-he" />);
    await screen.findByRole("heading", { name: "Tôm Hùm Bông Liên Hệ" });

    // Price should show "Liên hệ"
    expect(screen.getByText("Liên hệ")).not.toBeNull();

    // Should NOT show quantity selector or standard buy buttons
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("button", { name: "Thêm vào giỏ" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mua ngay" })).toBeNull();

    // Should show Call hotline and Zalo chat links
    expect(screen.getByText(/Gọi hotline: 1900 1234/i)).not.toBeNull();
    expect(screen.getByText(/Chat Zalo hỗ trợ/i)).not.toBeNull();
  });

  it("should render weight options and select an option when added to cart", async () => {
    const crabProduct = {
      ...mockProduct,
      id: 105,
      name: "Cua Đá Lực Sĩ",
      slug: "cua-da-luc-si",
      priceReference: 500000,
      weightOptions: ["0.3kg - 1kg:450000", "1kg - 3kg:1200000"],
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/products/slug/cua-da-luc-si")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(crabProduct),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    }) as unknown as typeof global.fetch;

    render(<ProductDetailContent slug="cua-da-luc-si" />);
    await screen.findByRole("heading", { name: "Cua Đá Lực Sĩ" });

    // Verify initial price shows the first option's price (450.000)
    expect(screen.getByText(/450\.000/)).not.toBeNull();

    // Verify weight options badges are rendered
    expect(screen.getByText("0.3kg - 1kg")).not.toBeNull();
    expect(screen.getByText("1kg - 3kg")).not.toBeNull();

    // Select the second option "1kg - 3kg"
    const secondOptionBtn = screen.getByText("1kg - 3kg");
    fireEvent.click(secondOptionBtn);

    // Verify price updates to the second option's price (1.200.000)
    expect(screen.getByText(/1\.200\.000/)).not.toBeNull();

    // Click "Thêm vào giỏ"
    const addBtn = screen.getAllByRole("button", { name: "Thêm vào giỏ" })[0];
    fireEvent.click(addBtn);

    // Verify cart store has item with selectedWeight "1kg - 3kg" and option price 1200000
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(105);
    expect(items[0].selectedWeight).toBe("1kg - 3kg");
    expect(items[0].priceReference).toBe(1200000);
  });
});
