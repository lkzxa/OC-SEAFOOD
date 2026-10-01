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

  it("should support current Vietnam province and ward address select filtering", () => {
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

    const inputs = screen.getAllByRole("combobox") as HTMLInputElement[];
    const provinceInput = inputs[0];
    const wardInput = inputs[1];

    expect(inputs).toHaveLength(2);
    expect(wardInput.disabled).toBe(true);

    fireEvent.change(provinceInput, { target: { value: "hồ" } });
    fireEvent.click(screen.getByRole("option", { name: "Thành phố Hồ Chí Minh" }));

    expect(provinceInput.value).toBe("Thành phố Hồ Chí Minh");
    expect(wardInput.disabled).toBe(false);

    fireEvent.change(wardInput, { target: { value: "sài" } });
    fireEvent.click(screen.getByRole("option", { name: "Phường Sài Gòn" }));
    expect(wardInput.value).toBe("Phường Sài Gòn");
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
    const addressInputs = screen.getAllByRole("combobox") as HTMLInputElement[];
    fireEvent.change(addressInputs[0], { target: { value: "hồ" } });
    fireEvent.click(screen.getByRole("option", { name: "Thành phố Hồ Chí Minh" }));
    fireEvent.change(addressInputs[1], { target: { value: "sài" } });
    fireEvent.click(screen.getByRole("option", { name: "Phường Sài Gòn" }));
    fireEvent.change(screen.getByPlaceholderText("Số 12, Ngõ 345, Đường Lê Lợi"), { target: { value: "10 Nguyễn Huệ" } });

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
          province: "Thành phố Hồ Chí Minh",
          district: "Đơn vị cấp xã trực thuộc",
          ward: "Phường Sài Gòn",
          streetAddress: "10 Nguyễn Huệ",
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
    
    const addressInputs = screen.getAllByRole("combobox") as HTMLInputElement[];
    fireEvent.change(addressInputs[0], { target: { value: "hồ" } });
    fireEvent.click(screen.getByRole("option", { name: "Thành phố Hồ Chí Minh" }));
    fireEvent.change(addressInputs[1], { target: { value: "sài" } });
    fireEvent.click(screen.getByRole("option", { name: "Phường Sài Gòn" }));
    
    fireEvent.change(screen.getByPlaceholderText("Số 12, Ngõ 345, Đường Lê Lợi"), { target: { value: "10 Nguyễn Huệ" } });

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
        province: "Thành phố Hồ Chí Minh",
        district: "Đơn vị cấp xã trực thuộc",
        ward: "Phường Sài Gòn",
        streetAddress: "10 Nguyễn Huệ",
        items: [{ productId: 2, quantity: 1 }],
      })
    );

    expect(screen.getByText("ORD-12345678-ABCD")).not.toBeNull();
    expect(screen.getByText(/1\.200\.000/)).not.toBeNull();
    expect(screen.getByText(/Test User/)).not.toBeNull();
    expect(screen.getByText(/0912345678/)).not.toBeNull();
    expect(screen.getByText(/10 Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh/)).not.toBeNull();

    // Cart store should have been cleared
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
