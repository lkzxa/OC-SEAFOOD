import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import LoginPage from "../app/login/page";
import { useAuthStore } from "../store/useAuthStore";

// Mock next/navigation
const mockPush = vi.fn();
const mockGet = vi.fn().mockReturnValue(null);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe("Authentication Page (Login & Register)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    global.fetch = vi.fn();
  });

  it("should render Login tab by default and display form fields", () => {
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: /^Đăng Nhập$/ })).not.toBeNull();
    expect(screen.getByRole("button", { name: /^Đăng Ký$/ })).not.toBeNull();

    // Login fields
    expect(screen.getByPlaceholderText("your@email.com")).not.toBeNull();
    expect(screen.getByPlaceholderText("••••••••")).not.toBeNull();
    expect(screen.getByLabelText(/Ghi nhớ tôi/i)).not.toBeNull();
    expect(screen.getByRole("button", { name: /ĐĂNG NHẬP NGAY/i })).not.toBeNull();
  });

  it("should switch to Register tab when clicked and show registration fields", async () => {
    render(<LoginPage />);

    const registerTabButton = screen.getByRole("button", { name: /^Đăng Ký$/ });
    fireEvent.click(registerTabButton);

    // Register fields
    expect(screen.getByPlaceholderText("Nguyễn Văn A")).not.toBeNull();
    expect(screen.getByPlaceholderText("your@email.com")).not.toBeNull();
    expect(screen.getByPlaceholderText("0912 345 678")).not.toBeNull();
    
    // Register button
    expect(screen.getByRole("button", { name: /TẠO TÀI KHOẢN MỚI/i })).not.toBeNull();
  });

  it("should show error on login failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: "Invalid email or password" } }),
    });
    global.fetch = mockFetch;

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /ĐĂNG NHẬP NGAY/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).not.toBeNull();
    });
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("should login successfully and save credentials in store", async () => {
    const mockUser = { id: 1, email: "user@example.com", name: "Nguyễn Văn A", role: "CUSTOMER" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: "fake-jwt-token", user: mockUser }),
    });
    global.fetch = mockFetch;

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /ĐĂNG NHẬP NGAY/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "correctpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe("fake-jwt-token");
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should show validation error on password mismatch during registration", async () => {
    render(<LoginPage />);

    // Switch to register
    fireEvent.click(screen.getByRole("button", { name: /^Đăng Ký$/ }));

    const nameInput = screen.getByPlaceholderText("Nguyễn Văn A");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••"); // First is password, second is confirm
    const submitButton = screen.getByRole("button", { name: /TẠO TÀI KHOẢN MỚI/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "password321" } }); // mismatch
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Mật khẩu xác nhận không khớp.")).not.toBeNull();
    });
  });

  it("should register successfully, autologin, and save credentials in store", async () => {
    const mockUser = { id: 10, email: "newuser@example.com", name: "Nguyễn Mới", role: "CUSTOMER" };
    
    // Mock fetch for both register and login
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/auth/register")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        });
      }
      if (url.includes("/api/auth/login")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: "new-user-jwt", user: mockUser }),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
    global.fetch = mockFetch as unknown as typeof global.fetch;

    render(<LoginPage />);

    // Switch to register
    fireEvent.click(screen.getByRole("button", { name: /^Đăng Ký$/ }));

    const nameInput = screen.getByPlaceholderText("Nguyễn Văn A");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /TẠO TÀI KHOẢN MỚI/i });

    fireEvent.change(nameInput, { target: { value: "Nguyễn Mới" } });
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.change(passwordInputs[0], { target: { value: "mypassword" } });
    fireEvent.change(passwordInputs[1], { target: { value: "mypassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe("new-user-jwt");
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
