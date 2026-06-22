import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "../app/admin/page";
import { useAuthStore } from "../store/useAuthStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin",
}));

describe("Admin dashboard page", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    pushMock.mockClear();
  });

  it("redirects guests to the login page", async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=/admin");
    });
  });

  it("redirects non-admin users to the homepage", async () => {
    useAuthStore.getState().setAuth("token", {
      id: 7,
      email: "customer@example.com",
      name: "Khách Hàng",
      role: "CUSTOMER",
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("renders the admin dashboard for admins", () => {
    useAuthStore.getState().setAuth("token", {
      id: 1,
      email: "admin@example.com",
      name: "Quản Trị",
      role: "ADMIN",
    });

    render(<AdminDashboardPage />);

    expect(screen.getByText("Hệ thống quản trị")).not.toBeNull();
    expect(screen.getByText("Hướng dẫn vận hành hệ thống")).not.toBeNull();
    expect(screen.getAllByText("Quản lý sản phẩm").length).toBeGreaterThan(0);
  });
});
