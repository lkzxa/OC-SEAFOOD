import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import CategoryContent from "../app/category/[slug]/CategoryContent";
import { useCartStore } from "../store/useCartStore";

const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

const mockCategories = [
  { id: 1, name: "Cua - Ghẹ", slug: "cua-ghe", description: "Cua ghẹ tươi sống" },
  { id: 2, name: "Tôm", slug: "tom", description: "Tôm các loại" },
];

// 9 products to trigger pagination (limit is 8)
const mockProducts = [
  { id: 201, name: "Cua Hoàng Đế", slug: "cua-king", description: "Cua to", image: "/king.jpg", unit: "kg", priceReference: 3000000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 202, name: "Cua Năm Căn", slug: "cua-nam-can", description: "Cua ngon", image: "/namcan.jpg", unit: "kg", priceReference: 800000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 203, name: "Cua Đá", slug: "cua-da", description: "Cua cứng", image: "/da.jpg", unit: "kg", priceReference: 400000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 204, name: "Cua Huỳnh Đế", slug: "cua-huynh-de", description: "Cua hiếm", image: "/huynh.jpg", unit: "kg", priceReference: 2500000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 205, name: "Ghẹ Xanh", slug: "ghe-xanh", description: "Ghẹ tươi", image: "/ghe.jpg", unit: "kg", priceReference: 600000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 206, name: "Cua Dungeness", slug: "cua-dung", description: "Cua Mỹ", image: "/dung.jpg", unit: "kg", priceReference: 1500000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 207, name: "Cua Nâu Ireland", slug: "cua-nau", description: "Cua Ireland", image: "/nau.jpg", unit: "kg", priceReference: 900000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 208, name: "Cua Mặt Trăng", slug: "cua-mat-trang", description: "Cua tròn", image: "/mattrang.jpg", unit: "kg", priceReference: 700000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 209, name: "Cua Đồng Vĩnh Long", slug: "cua-dong", description: "Cua làm lẩu", image: "/dong.jpg", unit: "kg", priceReference: 120000, showContact: false, isVisible: true, categoryId: 1 },
  { id: 210, name: "Tôm Sú", slug: "tom-su", description: "Tôm sú to", image: "/tom.jpg", unit: "kg", priceReference: 500000, showContact: false, isVisible: true, categoryId: 2 },
];

describe("Category Details Page", () => {
  beforeEach(() => {
    mockNotFound.mockClear();
    useCartStore.getState().clearCart();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockCategories, pagination: { total: mockCategories.length } }),
        });
      }
      if (url.includes("/api/products")) {
        const urlObj = new URL(url, "http://localhost");
        const categoryId = urlObj.searchParams.get("categoryId");
        const filtered = mockProducts.filter(
          (p) => p.categoryId === parseInt(categoryId || "0", 10)
        );
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: filtered, pagination: { total: filtered.length } }),
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    }) as unknown as typeof global.fetch;
  });

  it("should render active category info, sidebar navigation and products", async () => {
    render(<CategoryContent slug="cua-ghe" />);

    // Wait for categories and products to load
    await screen.findByText("Cua Hoàng Đế");
    expect(screen.getByText("Cua ghẹ tươi sống")).not.toBeNull();

    // Verify sidebar categories exist
    expect(screen.getAllByText("Cua - Ghẹ").length).toBeGreaterThan(0);
    expect(screen.getByText("Tôm")).not.toBeNull();

    // Verify first page products are loaded (1-8 products)
    expect(screen.getByText("Cua Hoàng Đế")).not.toBeNull();
    expect(screen.getByText("Cua Năm Căn")).not.toBeNull();
    expect(screen.getByText("Cua Đá")).not.toBeNull();
    
    // Product 9 (Cua Đồng Vĩnh Long) should be on page 2, so not on page 1
    expect(screen.queryByText("Cua Đồng Vĩnh Long")).toBeNull();

    // Verify trust badges
    expect(screen.getByText("100% Tươi Sống")).not.toBeNull();
    expect(screen.getByText("Giao Hàng Nhanh")).not.toBeNull();
  });

  it("should support client-side sorting of products by price", async () => {
    render(<CategoryContent slug="cua-ghe" />);

    await screen.findByText("Cua Hoàng Đế");

    const sortSelect = screen.getByRole("combobox");
    expect(sortSelect).not.toBeNull();

    // 1. Sort by Price: Low to High
    fireEvent.change(sortSelect, { target: { value: "price-asc" } });

    // After sorting low to high, Cua Đá (400k) should be listed first, Cua Hoàng Đế (3M) is on page 2 or last
    // Let's verify products on page 1 sorted order
    const productTitlesAsc = screen.getAllByRole("heading", { level: 3 })
      .map(el => el.textContent)
      .filter(title => title !== "Danh mục");
    expect(productTitlesAsc[0]).toBe("Cua Đồng Vĩnh Long"); // 120k
    expect(productTitlesAsc[1]).toBe("Cua Đá"); // 400k

    // 2. Sort by Price: High to Low
    fireEvent.change(sortSelect, { target: { value: "price-desc" } });
    
    const productTitlesDesc = screen.getAllByRole("heading", { level: 3 })
      .map(el => el.textContent)
      .filter(title => title !== "Danh mục");
    expect(productTitlesDesc[0]).toBe("Cua Hoàng Đế"); // 3M
    expect(productTitlesDesc[1]).toBe("Cua Huỳnh Đế"); // 2.5M
  });

  it("should support client-side pagination", async () => {
    render(<CategoryContent slug="cua-ghe" />);

    await screen.findByText("Cua Hoàng Đế");

    // Click page 2 button
    const page2Button = screen.getByRole("button", { name: "2" });
    expect(page2Button).not.toBeNull();
    fireEvent.click(page2Button);

    // Now product 9 (Cua Đồng Vĩnh Long) should be visible, and product 1 (Cua Hoàng Đế) hidden
    expect(screen.getByText("Cua Đồng Vĩnh Long")).not.toBeNull();
    expect(screen.queryByText("Cua Hoàng Đế")).toBeNull();

    // Click previous button (chevron_left)
    const prevButton = screen.getByText("chevron_left").closest("button");
    expect(prevButton).not.toBeNull();
    fireEvent.click(prevButton!);

    // Back to page 1
    expect(screen.getByText("Cua Hoàng Đế")).not.toBeNull();
    expect(screen.queryByText("Cua Đồng Vĩnh Long")).toBeNull();
  });

  it("should trigger notFound when slug doesn't exist", async () => {
    render(<CategoryContent slug="unknown-category" />);

    await waitFor(() => {
      expect(mockNotFound).toHaveBeenCalled();
    });
  });
});
