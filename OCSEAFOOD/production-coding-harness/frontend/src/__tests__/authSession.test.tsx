import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthSessionProvider from "../components/AuthSessionProvider";
import { useAuthStore } from "../store/useAuthStore";

describe("AuthSessionProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    vi.restoreAllMocks();
  });

  it("restores a valid server session without exposing a bearer token", async () => {
    const user = {
      id: 1,
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN" as const,
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user }),
    });

    render(<AuthSessionProvider><div>app</div></AuthSessionProvider>);
    expect(screen.getByText("app")).not.toBeNull();

    await waitFor(() => {
      expect(useAuthStore.getState().sessionReady).toBe(true);
      expect(useAuthStore.getState().user).toEqual(user);
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", { cache: "no-store" });
  });

  it("clears stale identity when the server session is expired", async () => {
    useAuthStore.getState().setAuth(null, {
      id: 7,
      email: "stale@example.com",
      name: "Stale User",
      role: "CUSTOMER",
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    render(<AuthSessionProvider><div>app</div></AuthSessionProvider>);

    await waitFor(() => {
      expect(useAuthStore.getState().sessionReady).toBe(true);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  it("removes the legacy JavaScript-readable token cookie", async () => {
    document.cookie = "token=legacy-cookie-token; Path=/";
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    render(<AuthSessionProvider><div>app</div></AuthSessionProvider>);

    await waitFor(() => expect(useAuthStore.getState().sessionReady).toBe(true));
    expect(document.cookie).not.toContain("legacy-cookie-token");
  });

  it("does not persist a JavaScript-readable token", () => {
    useAuthStore.getState().setAuth("legacy-test-token", {
      id: 7,
      email: "customer@example.com",
      name: "Customer",
      role: "CUSTOMER",
    });

    const persisted = localStorage.getItem("ocseafood-auth") || "";
    expect(persisted).not.toContain("legacy-test-token");
    expect(document.cookie).not.toContain("legacy-test-token");
  });
});
