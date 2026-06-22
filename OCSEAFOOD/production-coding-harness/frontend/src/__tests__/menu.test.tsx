import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import MenuPage from "../app/menu/page";
import { useCartStore } from "../store/useCartStore";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

const mockCategories = [
  { id: 1, name: "Cá hồi", slug: "ca-hoi" },
  { id: 2, name: "Tôm hùm", slug: "tom-hum" },
];

const mockProducts = [
  {
    id: 101,
    name: "Cá hồi Na Uy",
    slug: "ca-hoi-na-uy",
    description: "Tươi ngon ngọt thịt",
    image: "/cahoi.jpg",
    unit: "kg",
    priceReference: 350000,
    showContact: false,
    isVisible: true,
    categoryId: 1,
  },
  {
    id: 102,
    name: "Tôm hùm Alaska",
    slug: "tom-hum-alaska",
    description: "Sống khỏe mạnh",
    image: "/tomhum.jpg",
    unit: "con",
    priceReference: 1200000,
    showContact: false,
    isVisible: true,
    categoryId: 2,
  },
  {
    id: 103,
    name: "Cua hoàng đế khổng lồ",
    slug: "cua-hoang-de-khong-lo",
    description: "Hàng tuyển chọn đặc biệt",
    image: "/kingcrab.jpg",
    unit: "kg",
    priceReference: null,
    showContact: true,
    isVisible: true,
    categoryId: 2,
  },
  {
    id: 104,
    name: "Sản phẩm ẩn",
    slug: "san-pham-an",
    description: "Sản phẩm ẩn",
    image: "/hidden.jpg",
    unit: "kg",
    priceReference: 100000,
    showContact: false,
    isVisible: false,
    categoryId: 1,
  },
];

describe("Product Menu Page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
    useCartStore.getState().clearCart();

    // Mock global fetch
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        });
      }
      if (url.includes("/api/products")) {
        const urlObj = new URL(url, "http://localhost");
        const categoryId = urlObj.searchParams.get("categoryId");
        let filtered = mockProducts;
        if (categoryId) {
          filtered = mockProducts.filter(
            (p) => p.categoryId === parseInt(categoryId, 10)
          );
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(filtered),
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  });

  it("should render categories tabs and products grid", async () => {
    render(<MenuPage />);

    // Check header
    expect(screen.getByText("OCSEAFOOD")).not.toBeNull();

    // Wait for categories tabs to load
    const allTab = await screen.findByText("Tất cả");
    expect(allTab).not.toBeNull();
    const caHoiTab = await screen.findByText("Cá hồi");
    expect(caHoiTab).not.toBeNull();
    const tomHumTab = await screen.findByText("Tôm hùm");
    expect(tomHumTab).not.toBeNull();

    // Wait for visible products to load
    const caHoiProduct = await screen.findByText("Cá hồi Na Uy");
    expect(caHoiProduct).not.toBeNull();
    const tomHumProduct = await screen.findByText("Tôm hùm Alaska");
    expect(tomHumProduct).not.toBeNull();
    const kingCrabProduct = await screen.findByText("Cua hoàng đế khổng lồ");
    expect(kingCrabProduct).not.toBeNull();

    // Check description / specifications
    expect(screen.getAllByText("kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("con").length).toBeGreaterThan(0);

    // Hidden product should not be rendered
    expect(screen.queryByText("Sản phẩm ẩn")).toBeNull();
  });

  it("should format VND price for normal products and show Contact for contact-only products", async () => {
    render(<MenuPage />);

    // Wait for data load
    await screen.findByText("Cá hồi Na Uy");

    // Price for Cá hồi Na Uy: 350.000 ₫
    // VND formatted: 350.000 ₫ (or 350.000₫ in ProductCard replacement regex)
    const formattedPrice1 = screen.getByText(/350\.000/);
    expect(formattedPrice1).not.toBeNull();

    // Price for Cua hoàng đế khổng lồ is "Liên hệ"
    const contactText = screen.getByText("Liên hệ");
    expect(contactText).not.toBeNull();

    // "Gọi tư vấn" link button for contact product should be present
    const callButton = screen.getByRole("link", { name: /Gọi tư vấn/i });
    expect(callButton).not.toBeNull();
    expect(callButton.getAttribute("href")).toBe("tel:19001234");
  });

  it("should support adding to cart for normal products", async () => {
    render(<MenuPage />);

    // Wait for data load
    await screen.findByText("Cá hồi Na Uy");

    // Click "Thêm vào giỏ" button for Cá hồi Na Uy
    const addButtons = screen.getAllByRole("button", { name: /Thêm vào giỏ/i });
    expect(addButtons.length).toBe(2); // Cá hồi Na Uy and Tôm hùm Alaska

    fireEvent.click(addButtons[0]); // Cá hồi Na Uy

    // Cart store should have 1 item
    const cartItems = useCartStore.getState().items;
    expect(cartItems.length).toBe(1);
    expect(cartItems[0]).toEqual({
      id: 101,
      name: "Cá hồi Na Uy",
      priceReference: 350000,
      image: "/cahoi.jpg",
      unit: "kg",
      quantity: 1,
    });
  });

  it("should filter products by category tab click and push new URL route", async () => {
    render(<MenuPage />);

    // Wait for data load
    await screen.findByText("Cá hồi Na Uy");
    await screen.findByText("Tôm hùm Alaska");

    // Click "Cá hồi" tab
    const caHoiTab = screen.getByText("Cá hồi");
    fireEvent.click(caHoiTab);

    // Should push to router
    expect(mockPush).toHaveBeenCalledWith("/menu?categoryId=1");

    // Now wait for products list to update
    // In our test, clicking the tab updates the selectedCategoryId state,
    // which triggers fetch with query parameter, which should only return Cá hồi
    await waitFor(() => {
      expect(screen.queryByText("Tôm hùm Alaska")).toBeNull();
    });
    expect(screen.getByText("Cá hồi Na Uy")).not.toBeNull();
  });

  it("should read initial categoryId from search params on mount", async () => {
    // Set query parameter categoryId=2
    mockSearchParams = new URLSearchParams("categoryId=2");

    render(<MenuPage />);

    // Wait for data load
    // Since categoryId=2 is set, only Tôm hùm products should load
    await screen.findByText("Tôm hùm Alaska");
    expect(screen.queryByText("Cá hồi Na Uy")).toBeNull();
  });
});
