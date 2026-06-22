import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage from "../app/about/page";

describe("About Page", () => {
  it("should render about page brand title and story", () => {
    render(<AboutPage />);

    // Brand and Header checks
    expect(screen.getByText("Về")).not.toBeNull();
    expect(screen.getByText("OCSEAFOOD")).not.toBeNull();
    expect(screen.getByText("Câu Chuyện Thương Hiệu")).not.toBeNull();

    // Vision, Mission and Core Values checks
    expect(screen.getByText("Tầm Nhìn")).not.toBeNull();
    expect(screen.getByText("Sứ Mệnh")).not.toBeNull();
    expect(screen.getByText("Giá Trị Cốt Lõi")).not.toBeNull();
  });

  it("should render correct contact address, hotline, and email details", () => {
    render(<AboutPage />);

    // Check contact header
    expect(screen.getByText("Liên Hệ Với Chúng Tôi")).not.toBeNull();

    // Exact matching details required by harness rules
    expect(screen.getByText("123 Đường Hải Sản, Quận 1, TP. HCM")).not.toBeNull();
    expect(screen.getByText("1900 1234")).not.toBeNull();
    expect(screen.getByText("contact@ocseafood.vn")).not.toBeNull();
  });

  it("should render all four policy sections with correct headers", () => {
    render(<AboutPage />);

    expect(screen.getByText("Chính Sách & Hướng Dẫn")).not.toBeNull();
    expect(screen.getByText("Chính sách đổi trả")).not.toBeNull();
    expect(screen.getByText("Chính sách bảo mật")).not.toBeNull();
    expect(screen.getByText("Hướng dẫn mua hàng")).not.toBeNull();
    expect(screen.getByText("Vận chuyển & Giao nhận")).not.toBeNull();
  });
});

