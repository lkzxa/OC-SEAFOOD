import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminProductsPage from "../app/admin/products/page";
import AdminCategoriesPage from "../app/admin/categories/page";
import AdminPostsPage from "../app/admin/posts/page";
import { useAuthStore } from "../store/useAuthStore";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin/products",
}));

describe("Admin management pages", () => {
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

  it("renders product manager and submits product payload", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/categories") && (!options || options.method === undefined)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [{ id: 1, name: "Hải sản", slug: "hai-san" }],
            }),
        } as Response);
      }

      if (url.includes("/api/products") && (!options || options.method === undefined)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 10,
                  name: "Tôm Hùm",
                  slug: "tom-hum",
                  description: "Tươi sống",
                  image: "/tom.jpg",
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

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 11, name: "Mới" }),
      } as Response);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tôm Hùm")).not.toBeNull();
    });

    const textboxes = screen.getAllByRole("textbox") as HTMLInputElement[];
    fireEvent.change(textboxes[0], { target: { value: "Cua Hoàng Đế" } });
    fireEvent.change(textboxes[1], { target: { value: "cua-hoang-de" } });
    fireEvent.change(textboxes[2], { target: { value: "Sản phẩm cao cấp" } });
    fireEvent.change(textboxes[3], { target: { value: "/cua.jpg" } });
    fireEvent.change(textboxes[4], { target: { value: "kg" } });

    // Add dynamic option
    const addOptBtn = screen.getByRole("button", { name: "+ Thêm tùy chọn" });
    fireEvent.click(addOptBtn);

    // Wait for dynamic inputs to render
    const optionNameInput = await screen.findByPlaceholderText("Ví dụ: 0.3kg - 1kg");
    fireEvent.change(optionNameInput, { target: { value: "0.3kg - 1kg" } });

    const optionPriceInput = screen.getByPlaceholderText("Giá (VND) - Để trống = liên hệ");
    fireEvent.change(optionPriceInput, { target: { value: "500000" } });

    const spinbuttons = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    fireEvent.change(spinbuttons[0], { target: { value: "2500000" } });
    fireEvent.click(screen.getByRole("button", { name: "Tạo sản phẩm" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
            ([calledUrl, calledOptions]) => {
              if (calledUrl === "/api/products" && (calledOptions as RequestInit | undefined)?.method === "POST") {
                const body = JSON.parse((calledOptions as RequestInit).body as string);
                return body.weightOptions && body.weightOptions.includes("0.3kg - 1kg:500000");
              }
              return false;
            }
        )
      ).toBe(true);
    });
  });

  it("renders category manager and creates category", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/categories") && (!options || options.method === undefined)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [{ id: 1, name: "Hải sản", slug: "hai-san", description: "Mô tả" }],
            }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 2 }),
      } as Response);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText("Hải sản")).not.toBeNull();
    });

    expect(screen.getByText("Danh sách danh mục")).not.toBeNull();

    const textboxes = screen.getAllByRole("textbox") as HTMLInputElement[];
    fireEvent.change(textboxes[0], { target: { value: "Combo" } });
    fireEvent.change(textboxes[1], { target: { value: "combo" } });
    fireEvent.change(textboxes[2], { target: { value: "Danh mục combo" } });
    fireEvent.click(screen.getByRole("button", { name: "Tạo danh mục" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([calledUrl, calledOptions]) =>
            calledUrl === "/api/categories" &&
            (calledOptions as RequestInit | undefined)?.method === "POST"
        )
      ).toBe(true);
    });
  });

  it("renders post manager and creates blog post", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/posts") && (!options || options.method === undefined)) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                title: "Bí quyết",
                slug: "bi-quyet",
                content: "Nội dung",
                image: null,
                isVisible: true,
              },
            ]),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 2 }),
      } as Response);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<AdminPostsPage />);

    await waitFor(() => {
      expect(screen.getByText("Bí quyết")).not.toBeNull();
    });

    expect(screen.getByText("Danh sách bài viết")).not.toBeNull();

    const textboxes = screen.getAllByRole("textbox") as HTMLInputElement[];
    fireEvent.change(textboxes[0], { target: { value: "Mẹo chọn tôm" } });
    fireEvent.change(textboxes[1], { target: { value: "meo-chon-tom" } });
    fireEvent.change(textboxes[2], { target: { value: "/tom.jpg" } });
    fireEvent.change(textboxes[3], { target: { value: "Nội dung bài viết" } });
    fireEvent.click(screen.getByRole("button", { name: "Tạo bài viết" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([calledUrl, calledOptions]) =>
            calledUrl === "/api/posts" &&
            (calledOptions as RequestInit | undefined)?.method === "POST"
        )
      ).toBe(true);
    });
  });
});
