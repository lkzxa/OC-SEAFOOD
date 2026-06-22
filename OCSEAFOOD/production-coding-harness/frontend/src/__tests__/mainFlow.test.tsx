import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MenuPage from "../app/menu/page";
import CartPage from "../app/cart/page";
import AdminOrdersPage from "../app/admin/orders/page";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useOrderHistoryStore } from "../store/useOrderHistoryStore";
import { useOrderAuditStore } from "../store/useOrderAuditStore";

const pushMock = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/admin/orders",
}));

describe("Main customer-to-admin flow", () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockSearchParams = new URLSearchParams();
    useAuthStore.getState().clearAuth();
    useCartStore.getState().clearCart();
    useOrderHistoryStore.getState().clearOrders();
    useOrderAuditStore.getState().clear();
    vi.restoreAllMocks();
  });

  it("supports guest checkout and admin order editing", async () => {
    const checkoutOrder = {
      id: 99,
      code: "ORD-0099",
      fullName: "Nguyễn Khách",
      email: "guest@example.com",
      phone: "0912345678",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      streetAddress: "10 Lê Lợi",
      totalFinal: 2400000,
    };

    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      const method = options?.method || "GET";

      if (url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, name: "Hải sản", slug: "hai-san" },
              { id: 2, name: "Combo", slug: "combo" },
            ]),
        } as Response);
      }

      if (url.includes("/api/products")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 101,
                  name: "Tôm hùm Alaska",
                  slug: "tom-hum-alaska",
                  description: "Tươi sống",
                  image: "/tomhum.jpg",
                  unit: "con",
                  priceReference: 1200000,
                  showContact: false,
                  isVisible: true,
                  categoryId: 1,
                },
              ],
            }),
        } as Response);
      }

      if (url.includes("/api/checkout") && method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...checkoutOrder,
            }),
        } as Response);
      }

      if (url.includes("/api/orders") && method === "GET") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 99,
                  code: "ORD-0099",
                  fullName: "Nguyễn Khách",
                  email: "guest@example.com",
                  phone: "0912345678",
                  province: "TP. Hồ Chí Minh",
                  district: "Quận 1",
                  ward: "Phường Bến Nghé",
                  streetAddress: "10 Lê Lợi",
                  note: null,
                  status: "PENDING",
                  totalFinal: 2400000,
                  createdAt: "2026-06-12T05:00:00.000Z",
                  orderItems: [
                    {
                      id: 201,
                      productId: 101,
                      productName: "Tôm hùm Alaska",
                      productUnit: "con",
                      quantity: 2,
                      priceFinal: 1200000,
                      totalFinal: 2400000,
                    },
                  ],
                },
              ],
              pagination: {
                total: 1,
                page: 1,
                pageSize: 10,
                totalPages: 1,
              },
            }),
        } as Response);
      }

      if (url.includes("/api/orders/99") && method === "PUT") {
        const body = JSON.parse(String(options?.body)) as {
          status: string;
          note?: string;
          totalFinal: number;
          items: Array<{ id: number; quantity: number; priceFinal: number }>;
        };

        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 99,
              code: "ORD-0099",
              fullName: "Nguyễn Khách",
              email: "guest@example.com",
              phone: "0912345678",
              province: "TP. Hồ Chí Minh",
              district: "Quận 1",
              ward: "Phường Bến Nghé",
              streetAddress: "10 Lê Lợi",
              note: body.note,
              status: body.status,
              totalFinal: body.totalFinal,
              createdAt: "2026-06-12T05:00:00.000Z",
              orderItems: body.items.map((item) => ({
                id: item.id,
                productId: 101,
                productName: "Tôm hùm Alaska",
                productUnit: "con",
                quantity: item.quantity,
                priceFinal: item.priceFinal,
                totalFinal: item.quantity * item.priceFinal,
              })),
            }),
        } as Response);
      }

      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<MenuPage />);
    await screen.findByText("Tôm hùm Alaska");
    fireEvent.click(screen.getByRole("button", { name: /Thêm vào giỏ/i }));

    expect(useCartStore.getState().items).toHaveLength(1);

    render(<CartPage />);
    await screen.findByText("Giỏ hàng & Đặt hàng");

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn A"), {
      target: { value: "Nguyễn Khách" },
    });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
      target: { value: "guest@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("0912345678"), {
      target: { value: "0912345678" },
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "HCM" } });
    fireEvent.change(selects[1], { target: { value: "District 1" } });
    fireEvent.change(selects[2], { target: { value: "Ben Nghe" } });
    fireEvent.change(screen.getByPlaceholderText("Số 12, Ngõ 345, Đường Lê Lợi"), {
      target: { value: "10 Lê Lợi" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /XÁC NHẬN ĐẶT HÀNG/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Đặt Hàng Thành Công!")).not.toBeNull();
    });
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useOrderHistoryStore.getState().orders).toHaveLength(1);

    useAuthStore.getState().setAuth("admin-token", {
      id: 1,
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });

    render(<AdminOrdersPage />);
    await screen.findByText("ORD-0099");

    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa giá" }));
    const statusSelects = screen.getAllByLabelText("Trạng thái") as HTMLSelectElement[];
    fireEvent.change(statusSelects[1], { target: { value: "CONFIRMED" } });

    const quantityInputs = screen.getAllByLabelText("Số lượng") as HTMLInputElement[];
    const priceInputs = screen.getAllByLabelText("Đơn giá cuối") as HTMLInputElement[];
    fireEvent.change(quantityInputs[0], { target: { value: "2" } });
    fireEvent.change(priceInputs[0], { target: { value: "1400000" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi đơn hàng" }));

    await waitFor(() => {
      expect(screen.getByText("Nhật ký thay đổi")).not.toBeNull();
    });
    expect(useOrderAuditStore.getState().entries).toHaveLength(1);
    expect(useOrderAuditStore.getState().entries[0].changedFields).toContain("totalFinal");
  });
});
