import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminSettingsPage from "../app/admin/settings/page";
import { useAuthStore } from "../store/useAuthStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin/settings",
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AdminSettingsPage", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    pushMock.mockClear();
    vi.clearAllMocks();
  });

  it("redirects guests to the login page", async () => {
    render(<AdminSettingsPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login?redirect=/admin/settings");
    });
  });

  it("loads and displays settings including contact config for admin", async () => {
    useAuthStore.getState().setAuth("admin-token", {
      id: 1,
      email: "admin@example.com",
      name: "Quản Trị",
      role: "ADMIN",
    });

    mockFetch.mockImplementation(async (url) => {
      if (url === "/api/settings") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            TELEGRAM_BOT_TOKEN: "tg-token",
            TELEGRAM_CHAT_ID: "tg-chat",
            ZALO_OA_ACCESS_TOKEN: "zalo-token",
            ZALO_USER_ID: "zalo-user",
            HOMEPAGE_ANNOUNCEMENT_ENABLED: true,
            HOMEPAGE_ANNOUNCEMENT_CONTENT: "Sale 10%",
            CONTACT_HOTLINE: "090111222",
            CONTACT_ZALO: "https://zalo.me/090111222",
            CONTACT_FACEBOOK: "https://fb.com/myfanpage",
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    render(<AdminSettingsPage />);

    // Verify loading data is populated in inputs
    await waitFor(() => {
      const hotlineInput = screen.getByPlaceholderText("Nhập số điện thoại Hotline") as HTMLInputElement;
      const zaloInput = screen.getByPlaceholderText("Nhập đường dẫn chat Zalo") as HTMLInputElement;
      const facebookInput = screen.getByPlaceholderText("Nhập đường dẫn Fanpage hoặc Messenger") as HTMLInputElement;

      expect(hotlineInput.value).toBe("090111222");
      expect(zaloInput.value).toBe("https://zalo.me/090111222");
      expect(facebookInput.value).toBe("https://fb.com/myfanpage");
    });
  });

  it("saves modified settings including contact config", async () => {
    useAuthStore.getState().setAuth("admin-token", {
      id: 1,
      email: "admin@example.com",
      name: "Quản Trị",
      role: "ADMIN",
    });

    mockFetch.mockImplementation(async (url, options) => {
      if (url === "/api/settings") {
        if (options?.method === "PUT") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              status: "success",
              message: "Settings updated successfully",
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            TELEGRAM_BOT_TOKEN: "tg-token",
            TELEGRAM_CHAT_ID: "tg-chat",
            ZALO_OA_ACCESS_TOKEN: "zalo-token",
            ZALO_USER_ID: "zalo-user",
            HOMEPAGE_ANNOUNCEMENT_ENABLED: true,
            HOMEPAGE_ANNOUNCEMENT_CONTENT: "Sale 10%",
            CONTACT_HOTLINE: "090111222",
            CONTACT_ZALO: "https://zalo.me/090111222",
            CONTACT_FACEBOOK: "https://fb.com/myfanpage",
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    render(<AdminSettingsPage />);

    // Wait for load
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Nhập số điện thoại Hotline")).not.toBeNull();
    });

    const hotlineInput = screen.getByPlaceholderText("Nhập số điện thoại Hotline") as HTMLInputElement;
    fireEvent.change(hotlineInput, { target: { value: "090999999" } });

    const saveButton = screen.getByRole("button", { name: /LƯU CẤU HÌNH HỆ THỐNG/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Check PUT call payload
      const putCall = mockFetch.mock.calls.find(call => call[1]?.method === "PUT");
      expect(putCall).toBeDefined();
      const body = JSON.parse(putCall?.[1]?.body as string);
      expect(body.CONTACT_HOTLINE).toBe("090999999");
      expect(body.CONTACT_ZALO).toBe("https://zalo.me/090111222");
      expect(body.CONTACT_FACEBOOK).toBe("https://fb.com/myfanpage");

      expect(screen.getByText("Đã lưu toàn bộ cấu hình hệ thống thành công.")).not.toBeNull();
    });
  });
});
