import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "../app/admin/page";
import ProfilePage from "../app/profile/page";
import { useAuthStore } from "../store/useAuthStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin",
}));

describe("Auth and route security checks", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    pushMock.mockClear();
  });

  it("redirects guests away from the admin dashboard", async () => {
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=/admin");
    });
  });

  it("redirects customers away from the admin dashboard", async () => {
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

  it("redirects guests away from the private profile page", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=/profile");
    });
  });

  it("shows profile content to authenticated users", () => {
    useAuthStore.getState().setAuth("token", {
      id: 7,
      email: "customer@example.com",
      name: "Khách Hàng",
      role: "CUSTOMER",
    });

    render(<ProfilePage />);

    expect(screen.getByText("Tài khoản của tôi")).not.toBeNull();
  });
});
