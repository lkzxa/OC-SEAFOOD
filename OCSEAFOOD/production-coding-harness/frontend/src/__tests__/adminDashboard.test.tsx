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
    useAuthStore.getState().setAuth("admin-token", {
      id: 1,
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    pushMock.mockClear();
    vi.restoreAllMocks();
  });

  it("loads dashboard stats from the live APIs", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const parsed = new URL(url, "http://localhost");

      if (parsed.pathname === "/api/categories") {
        return {
          ok: true,
          json: async () => ({ data: [], pagination: { total: 5 } }),
        } as Response;
      }

      if (parsed.pathname === "/api/products") {
        return {
          ok: true,
          json: async () => ({ data: [], pagination: { total: 28 } }),
        } as Response;
      }

      if (parsed.pathname === "/api/orders") {
        expect(parsed.searchParams.get("status")).toBe("PENDING");
        return {
          ok: true,
          json: async () => ({ data: [], pagination: { total: 3 } }),
        } as Response;
      }

      if (parsed.pathname === "/api/posts") {
        return {
          ok: true,
          json: async () => [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        } as Response;
      }

      return { ok: false, status: 404 } as Response;
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("5")).not.toBeNull();
      expect(screen.getByText("28")).not.toBeNull();
      expect(screen.getAllByText("3").length).toBeGreaterThan(0);
      expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    });

    expect(screen.queryByText("12+")).toBeNull();
    expect(screen.queryByText("100+")).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/orders?page=1&pageSize=1&status=PENDING",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token",
        }),
      })
    );
  });
});
