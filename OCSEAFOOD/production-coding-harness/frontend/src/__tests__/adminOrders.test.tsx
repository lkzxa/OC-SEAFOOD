import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminOrdersPage from "../app/admin/orders/page";
import { useAuthStore } from "../store/useAuthStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin/orders",
}));

describe("Admin orders page", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setAuth("admin-token", {
      id: 1,
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    pushMock.mockClear();
    vi.restoreAllMocks();
  });

  it("renders orders and supports pagination and filters", async () => {
    const fetchMock = vi.fn((url: string) => {
      const parsed = new URL(url, "http://localhost");
      const status = parsed.searchParams.get("status");
      const page = parsed.searchParams.get("page");

      const totalPages = status ? 1 : 2;
      const orders =
        page === "2"
          ? [
              {
                id: 2,
                code: "ORD-002",
                fullName: "Khách B",
                email: "b@example.com",
                phone: "0912222222",
                province: "TP. Hồ Chí Minh",
                district: "Quận 1",
                ward: "Phường Bến Nghé",
                streetAddress: "12 Lê Lợi",
                note: "Gọi trước",
                status: "CONFIRMED",
                totalFinal: 2200000,
                createdAt: "2026-06-11T08:00:00.000Z",
                orderItems: [],
              },
            ]
          : [
              {
                id: 1,
                code: "ORD-001",
                fullName: "Khách A",
                email: "a@example.com",
                phone: "0911111111",
                province: "TP. Hồ Chí Minh",
                district: "Quận 3",
                ward: "Phường Võ Thị Sáu",
                streetAddress: "10 Nguyễn Đình Chiểu",
                status: "PENDING",
                totalFinal: 1200000,
                createdAt: "2026-06-11T07:00:00.000Z",
                orderItems: [
                  {
                    id: 11,
                    productId: 5,
                    productName: "Tôm Hùm",
                    productUnit: "con",
                    quantity: 1,
                    priceFinal: 1200000,
                    totalFinal: 1200000,
                  },
                ],
              },
            ];

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: orders,
            pagination: {
              total: status ? 1 : 2,
              page: Number(page || "1"),
              pageSize: 10,
              totalPages,
            },
          }),
      } as Response);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("ORD-001")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Sau" }));

    await waitFor(() => {
      expect(screen.getByText("ORD-002")).not.toBeNull();
    });

    fireEvent.change(screen.getByLabelText("Trạng thái"), { target: { value: "PENDING" } });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng bộ lọc" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([calledUrl]) => String(calledUrl).includes("status=PENDING"))
      ).toBe(true);
    });
  });

  it("updates order price and shows local audit log timeline", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (options?.method === "PUT") {
        const body = JSON.parse(String(options.body)) as {
          status: string;
          note?: string;
          totalFinal: number;
          items: Array<{ id: number; quantity: number; priceFinal: number }>;
        };

        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              code: "ORD-001",
              fullName: "Khách A",
              email: "a@example.com",
              phone: "0911111111",
              province: "TP. Hồ Chí Minh",
              district: "Quận 3",
              ward: "Phường Võ Thị Sáu",
              streetAddress: "10 Nguyễn Đình Chiểu",
              note: body.note,
              status: body.status,
              totalFinal: body.totalFinal,
              createdAt: "2026-06-11T07:00:00.000Z",
              orderItems: body.items.map((item) => ({
                id: item.id,
                productId: 5,
                productName: "Tôm Hùm",
                productUnit: "con",
                quantity: item.quantity,
                priceFinal: item.priceFinal,
                totalFinal: item.quantity * item.priceFinal,
              })),
            }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: 1,
                code: "ORD-001",
                fullName: "Khách A",
                email: "a@example.com",
                phone: "0911111111",
                province: "TP. Hồ Chí Minh",
                district: "Quận 3",
                ward: "Phường Võ Thị Sáu",
                streetAddress: "10 Nguyễn Đình Chiểu",
                note: null,
                status: "PENDING",
                totalFinal: 1200000,
                createdAt: "2026-06-11T07:00:00.000Z",
                orderItems: [
                  {
                    id: 11,
                    productId: 5,
                    productName: "Tôm Hùm",
                    productUnit: "con",
                    quantity: 1,
                    priceFinal: 1200000,
                    totalFinal: 1200000,
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
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("ORD-001")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa giá" }));

    const statusSelects = screen.getAllByLabelText("Trạng thái") as HTMLSelectElement[];
    fireEvent.change(statusSelects[1], { target: { value: "CONFIRMED" } });
    fireEvent.change(screen.getByLabelText("Ghi chú"), { target: { value: "Chốt giá mới" } });

    const quantityInputs = screen.getAllByLabelText("Số lượng") as HTMLInputElement[];
    const priceInputs = screen.getAllByLabelText("Đơn giá cuối") as HTMLInputElement[];
    fireEvent.change(quantityInputs[0], { target: { value: "2" } });
    fireEvent.change(priceInputs[0], { target: { value: "1500000" } });

    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi đơn hàng" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([calledUrl, calledOptions]) =>
            calledUrl === "/api/orders/1" &&
            (calledOptions as RequestInit | undefined)?.method === "PUT"
        )
      ).toBe(true);
    });

    expect(screen.getByText("Nhật ký thay đổi")).not.toBeNull();
    expect(screen.getByText("status, note, items, totalFinal")).not.toBeNull();
  });
});
