import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoadingState from "../components/LoadingState";
import StatusPanel from "../components/StatusPanel";
import MenuPage from "../app/menu/page";
import ResetPasswordPage from "../app/reset-password/page";

let mockToken: string | null = null;
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (name: string) => (name === "token" ? mockToken : null),
  }),
}));

describe("Branded loading and error states", () => {
  beforeEach(() => {
    mockToken = null;
    mockPush.mockClear();
  });

  it("announces accessible loading feedback", () => {
    render(<LoadingState label="Đang tải kiểm thử..." />);

    expect(screen.getByRole("status").textContent).toContain("Đang tải kiểm thử");
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
  });

  it("runs the recovery action from a branded service-error panel", () => {
    const retry = vi.fn();
    render(
      <StatusPanel
        description="Kết nối thử nghiệm đang gián đoạn."
        eyebrow="Dịch vụ gián đoạn"
        icon="cloud_off"
        onPrimaryAction={retry}
        primaryLabel="Thử tải lại"
        title="Chưa thể tải dữ liệu"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Thử tải lại/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("distinguishes a menu service failure from an empty catalog", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("backend unavailable")) as unknown as typeof global.fetch;
    render(<MenuPage />);

    expect(await screen.findByRole("heading", { name: "Chưa thể tải thực đơn" })).not.toBeNull();
    expect(screen.queryByText(/Không tìm thấy sản phẩm nào trong danh mục này/i)).toBeNull();
    expect(screen.getByRole("button", { name: /Thử tải lại/i })).not.toBeNull();
  });

  it("rejects an invalid reset token before showing password fields", async () => {
    mockToken = "invalid-token";
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 }) as unknown as typeof global.fetch;
    render(<ResetPasswordPage />);

    expect(await screen.findByRole("heading", { name: /Đường dẫn không hợp lệ hoặc đã hết hạn/i })).not.toBeNull();
    expect(screen.queryByLabelText("Mật khẩu mới")).toBeNull();
  });
});
