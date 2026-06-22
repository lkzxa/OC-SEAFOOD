import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "../app/admin/users/page";
import { useAuthStore } from "../store/useAuthStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin/users",
}));

describe("Admin users management page", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setAuth("admin-token-xyz", {
      id: 1,
      email: "admin@example.com",
      name: "Admin Super",
      role: "ADMIN",
    });
    pushMock.mockClear();
    vi.restoreAllMocks();
    
    // Mock window.confirm
    vi.stubGlobal("confirm", () => true);
  });

  it("renders users list and handles creation, editing, and deletion", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/users") && (!options || options.method === undefined)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 1,
                  email: "admin@example.com",
                  name: "Admin Super",
                  role: "ADMIN",
                  createdAt: "2026-06-12T14:00:00Z",
                },
                {
                  id: 2,
                  email: "customer@example.com",
                  name: "Customer Doe",
                  role: "CUSTOMER",
                  createdAt: "2026-06-12T14:15:00Z",
                },
              ],
              pagination: {
                totalItems: 2,
                page: 1,
                pageSize: 10,
                totalPages: 1,
              },
            }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 3, email: "new@example.com" }),
      } as Response);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminUsersPage />);

    // Check headers and page title
    await waitFor(() => {
      expect(screen.getAllByText("Admin Super").length).toBeGreaterThan(0);
      expect(screen.getByText("customer@example.com")).not.toBeNull();
    });

    // Verify self-delete button is disabled
    const deleteButtons = screen.getAllByRole("button", { name: "Xóa" }) as HTMLButtonElement[];
    // User 1 is currently logged in, so their delete button should be disabled
    expect(deleteButtons[0].disabled).toBe(true);
    // User 2 is another user, so their delete button should be enabled
    expect(deleteButtons[1].disabled).toBe(false);

    // Form inputs for creation
    const textboxes = screen.getAllByRole("textbox") as HTMLInputElement[];
    const emailInput = screen.getByPlaceholderText("name@example.com") as HTMLInputElement;
    const nameInput = screen.getByPlaceholderText("Nguyễn Văn A") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("Tối thiểu 6 ký tự") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "staff@example.com" } });
    fireEvent.change(nameInput, { target: { value: "Staff Jane" } });
    fireEvent.change(passwordInput, { target: { value: "securepass" } });

    // Submit creation
    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([calledUrl, calledOptions]) =>
            calledUrl === "/api/users" &&
            (calledOptions as RequestInit | undefined)?.method === "POST"
        )
      ).toBe(true);
    });

    // Test Delete trigger on Customer Doe (User 2)
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([calledUrl, calledOptions]) =>
            calledUrl === "/api/users/2" &&
            (calledOptions as RequestInit | undefined)?.method === "DELETE"
        )
      ).toBe(true);
    });
  });
});
