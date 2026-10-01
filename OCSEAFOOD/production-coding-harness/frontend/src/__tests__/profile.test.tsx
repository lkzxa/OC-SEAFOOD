import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "../app/profile/page";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderHistoryStore } from "../store/useOrderHistoryStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("Customer profile page", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useOrderHistoryStore.getState().clearOrders();
    pushMock.mockClear();
  });

  it("redirects guests to login", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=/profile");
    });
  });

  it("shows an empty order history state for logged-in users", () => {
    useAuthStore.getState().setAuth("token", {
      id: 7,
      email: "customer@example.com",
      name: "Khách Hàng",
      role: "CUSTOMER",
    });

    render(<ProfilePage />);

    expect(screen.getByText("Tài khoản của tôi")).not.toBeNull();
    expect(screen.getByText("Chưa có đơn hàng nào")).not.toBeNull();
  });

  it("renders persisted order history for the active user", () => {
    useAuthStore.getState().setAuth("token", {
      id: 7,
      email: "customer@example.com",
      name: "Khách Hàng",
      role: "CUSTOMER",
    });

    useOrderHistoryStore.getState().addOrder({
      id: 42,
      code: "ORD-ABC123",
      userId: 7,
      email: "customer@example.com",
      fullName: "Khách Hàng",
      phone: "0912345678",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      streetAddress: "10 Ben Nghe",
      status: "PENDING",
      totalFinal: 1200000,
      totalItems: 1,
      items: [
        {
          productId: 2,
          name: "Tôm Hùm",
          unit: "con",
          quantity: 1,
          priceReference: 1200000,
          image: "/tom.jpg",
        },
      ],
      createdAt: "2026-06-11T12:00:00.000Z",
    });
    const pendingOrder = useOrderHistoryStore.getState().orders[0];
    useOrderHistoryStore.getState().addOrder({
      ...pendingOrder,
      id: 43,
      code: "ORD-CONFIRMED",
      status: "CONFIRMED",
      createdAt: "2026-06-11T13:00:00.000Z",
    });
    useOrderHistoryStore.getState().addOrder({
      ...pendingOrder,
      id: 44,
      code: "ORD-CANCELLED",
      status: "CANCELLED",
      createdAt: "2026-06-11T14:00:00.000Z",
    });

    render(<ProfilePage />);

    expect(screen.getByText("ORD-ABC123")).not.toBeNull();
    expect(screen.getAllByText("Tôm Hùm")).toHaveLength(3);
    expect(screen.getByText("Chờ tư vấn")).not.toBeNull();
    expect(screen.getByText("Đã xác nhận")).not.toBeNull();
    expect(screen.getByText("Đã hủy")).not.toBeNull();
    expect(screen.getAllByText(/10 Ben Nghe/)).toHaveLength(3);
  });
});
