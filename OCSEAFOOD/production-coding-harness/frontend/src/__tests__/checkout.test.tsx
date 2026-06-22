import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import CartPage from "../app/cart/page";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Cart and Checkout Page Component", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  it("should render empty state when cart is empty", () => {
    render(<CartPage />);

    expect(screen.getByText("Giỏ Hàng Đang Trống")).not.toBeNull();
    expect(screen.getByRole("link", { name: /QUAY LẠI CỬA HÀNG/i })).not.toBeNull();
  });

  it("should render cart items and checkout form when cart has products", () => {
    // Add mock item
    useCartStore.getState().addItem(
      {
        id: 1,
        name: "Cua Huỳnh Đế",
        priceReference: 2500000,
        image: "/cua.jpg",
        unit: "kg",
      },
      2
    );

    render(<CartPage />);

    // Check product display
    expect(screen.getByText("Cua Huỳnh Đế")).not.toBeNull();
    expect(screen.getByText("Quy cách: kg")).not.toBeNull();
    expect(screen.getByText("2")).not.toBeNull(); // quantity
    
    // Total price estimation: 2,500,000 * 2 = 5,000,000đ
    expect(screen.getAllByText(/5\.000\.000/).length).toBeGreaterThan(0);

    // Form inputs presence
    expect(screen.getByPlaceholderText("Nguyễn Văn A")).not.toBeNull();
    expect(screen.getByPlaceholderText("your@email.com")).not.toBeNull();
    expect(screen.getByPlaceholderText("0912345678")).not.toBeNull();
  });

  it("should pre-fill fullName and email if user is logged in", () => {
    useCartStore.getState().addItem(
      {
        id: 2,
        name: "Tôm Hùm",
        priceReference: 1200000,
        image: "/tom.jpg",
        unit: "con",
      },
      1
    );

    // Set logged-in customer in auth store
    useAuthStore.getState().setAuth("mock-token", {
      id: 7,
      email: "testcustomer@example.com",
      name: "Khách Hàng Vip",
      role: "CUSTOMER",
    });

    render(<CartPage />);

    const nameInput = screen.getByPlaceholderText("Nguyễn Văn A") as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText("your@email.com") as HTMLInputElement;

    expect(nameInput.value).toBe("Khách Hàng Vip");
    expect(emailInput.value).toBe("testcustomer@example.com");
  });

  it("should support 3-tier address select filtering", () => {
    useCartStore.getState().addItem(
      {
        id: 1,
        name: "Cua Huỳnh Đế",
        priceReference: 2500000,
        image: "/cua.jpg",
        unit: "kg",
      },
      1
    );

    render(<CartPage />);

    const selects = screen.getAllByRole("combobox");
    const provinceSelect = selects[0] as HTMLSelectElement;
    
    // District select and ward select should be disabled initially (no options except default)
    const districtSelect = selects[1] as HTMLSelectElement;
    const wardSelect = selects[2] as HTMLSelectElement;

    expect(districtSelect.disabled).toBe(true);
    expect(wardSelect.disabled).toBe(true);

    // Select Province "HCM"
    fireEvent.change(provinceSelect, { target: { value: "HCM" } });
    expect(districtSelect.disabled).toBe(false);

    // District select should now contain options for HCM: Quận 1, Quận 3, Quận Bình Thạnh
    fireEvent.change(districtSelect, { target: { value: "District 1" } });
    expect(wardSelect.disabled).toBe(false);

    // Select District "District 1" should populate wards
    fireEvent.change(wardSelect, { target: { value: "Ben Nghe" } });
    expect(wardSelect.value).toBe("Ben Nghe");
  });

  it("should show client validation error if phone or email format is invalid", async () => {
    useCartStore.getState().addItem(
      {
        id: 1,
        name: "Cua Huỳnh Đế",
        priceReference: 2500000,
        image: "/cua.jpg",
        unit: "kg",
      },
      1
    );

    render(<CartPage />);

    // Fill form with bad email
    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn A"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), { target: { value: "bademail" } });
    fireEvent.change(screen.getByPlaceholderText("0912345678"), { target: { value: "0912345678" } });
    
    // Select address
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "HCM" } });
    fireEvent.change(selects[1], { target: { value: "District 1" } });
    fireEvent.change(selects[2], { target: { value: "Ben Nghe" } });
    fireEvent.change(screen.getByPlaceholderText("Số 12, Ngõ 345, Đường Lê Lợi"), { target: { value: "10 Ben Nghe" } });

    // Click submit
    fireEvent.click(screen.getByRole("button", { name: /XÁC NHẬN ĐẶT HÀNG/i }));

    // Should see error
    expect(await screen.findByText("Định dạng email không hợp lệ.")).not.toBeNull();

    // Fix email, set invalid phone
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("0912345678"), { target: { value: "12345" } }); // bad phone

    fireEvent.click(screen.getByRole("button", { name: /XÁC NHẬN ĐẶT HÀNG/i }));

    expect(await screen.findByText("Số điện thoại không đúng định dạng Việt Nam.")).not.toBeNull();
  });

  it("should handle successful api submit and display order details page", async () => {
    useCartStore.getState().addItem(
      {
        id: 2,
        name: "Tôm Hùm",
        priceReference: 1200000,
        image: "/tom.jpg",
        unit: "con",
      },
      1
    );
    useAuthStore.getState().setAuth("mock-token", {
      id: 7,
      email: "testcustomer@example.com",
      name: "Khách Hàng Vip",
      role: "CUSTOMER",
    });

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 42,
          code: "ORD-12345678-ABCD",
          fullName: "Test User",
          email: "test@example.com",
          phone: "0912345678",
          province: "HCM",
          district: "District 1",
          ward: "Ben Nghe",
          streetAddress: "10 Ben Nghe",
          totalFinal: 1200000,
        }),
    });

    render(<CartPage />);

    // Fill form
    await waitFor(() => {
      expect((screen.getByPlaceholderText("Nguyễn Văn A") as HTMLInputElement).value).toBe("Khách Hàng Vip");
    });
    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn A"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("0912345678"), { target: { value: "0912345678" } });
    
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "HCM" } });
    fireEvent.change(selects[1], { target: { value: "District 1" } });
    fireEvent.change(selects[2], { target: { value: "Ben Nghe" } });
    
    fireEvent.change(screen.getByPlaceholderText("Số 12, Ngõ 345, Đường Lê Lợi"), { target: { value: "10 Ben Nghe" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /XÁC NHẬN ĐẶT HÀNG/i }));

    // Check loading/success UI state changes
    await waitFor(() => {
      expect(screen.getByText("Đặt Hàng Thành Công!")).not.toBeNull();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/checkout",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        }),
        body: expect.any(String),
      })
    );
    const checkoutBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(checkoutBody).toEqual(
      expect.objectContaining({
        fullName: "Test User",
        email: "test@example.com",
        phone: "0912345678",
        province: "TP. Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        streetAddress: "10 Ben Nghe",
        items: [{ productId: 2, quantity: 1 }],
      })
    );

    expect(screen.getByText("ORD-12345678-ABCD")).not.toBeNull();
    expect(screen.getByText(/1\.200\.000/)).not.toBeNull();
    expect(screen.getByText(/Test User/)).not.toBeNull();
    expect(screen.getByText(/0912345678/)).not.toBeNull();
    expect(screen.getByText(/10 Ben Nghe, Phường Bến Nghé, Quận 1, TP\. Hồ Chí Minh/)).not.toBeNull();

    // Cart store should have been cleared
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
