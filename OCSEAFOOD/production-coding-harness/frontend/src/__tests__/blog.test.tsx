import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { notFound } from "next/navigation";
import BlogPage from "../app/blog/page";
import BlogPostDetailPage from "../app/blog/[id]/page";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

const mockPosts = [
  {
    id: 1,
    title: "Cách luộc cua biển ngon",
    slug: "cach-luoc-cua-bien-ngon",
    content:
      "Cách luộc cua biển ngon giữ trọn vẹn vị ngọt nước tự nhiên, cua chắc thịt không bị rụng càng khi hấp.",
    image: "/cua.jpg",
    isVisible: true,
    authorId: 1,
    createdAt: "2026-06-10T12:00:00.000Z",
    updatedAt: "2026-06-10T12:00:00.000Z",
  },
  {
    id: 2,
    title: "Bí quyết làm Sashimi Cá hồi",
    slug: "bi-quyet-lam-sashimi-ca-hoi",
    content:
      "Bí quyết làm Sashimi Cá hồi tươi sống tại nhà an toàn vệ sinh, thái lát đẹp mắt mỏng đều, ăn kèm mù tạt chuẩn Nhật.",
    image: null,
    isVisible: true,
    authorId: 1,
    createdAt: "2026-06-11T10:00:00.000Z",
    updatedAt: "2026-06-11T10:00:00.000Z",
  },
  {
    id: 3,
    title: "Bài viết nhạy cảm",
    slug: "bai-viet-nhay-cam",
    content: "Nội dung ẩn không hiển thị với khách hàng.",
    image: "/hidden.jpg",
    isVisible: false,
    authorId: 1,
    createdAt: "2026-06-09T10:00:00.000Z",
    updatedAt: "2026-06-09T10:00:00.000Z",
  },
];

describe("Blog Pages", () => {
  beforeEach(() => {
    vi.mocked(notFound).mockClear();

    // Mock global fetch
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/posts/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPosts[0]),
        });
      }
      if (url.includes("/posts/3")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPosts[2]),
        });
      }
      if (url.includes("/posts/999")) {
        return Promise.resolve({
          ok: false,
          status: 404,
        });
      }
      if (url.includes("/posts")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPosts),
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  });

  it("should render list of visible blog posts with fallbacks", async () => {
    const pageComponent = await BlogPage();
    render(pageComponent);

    // Header check
    expect(screen.getByText("Cẩm Nang")).not.toBeNull();

    // Check visible posts titles
    expect(screen.getByText("Cách luộc cua biển ngon")).not.toBeNull();
    expect(screen.getByText("Bí quyết làm Sashimi Cá hồi")).not.toBeNull();

    // Check invisible post is filtered out
    expect(screen.queryByText("Bài viết nhạy cảm")).toBeNull();

    // Check fallback image is loaded for null image
    const images = screen.getAllByRole("img");
    expect(images.length).toBe(2);
    expect(images[1].getAttribute("src")).toContain("unsplash.com");
  });

  it("should render blog post detail content and meta info", async () => {
    const detailComponent = await BlogPostDetailPage({
      params: Promise.resolve({ id: "1" }),
    });
    render(detailComponent);

    // Title and content checks
    expect(screen.getByText("Cách luộc cua biển ngon")).not.toBeNull();
    expect(
      screen.getByText(/Cách luộc cua biển ngon giữ trọn vẹn vị ngọt nước/)
    ).not.toBeNull();

    // Metadata checks
    expect(screen.getByText("Ban Biên Tập OCSEAFOOD")).not.toBeNull();
  });

  it("should trigger notFound when post is not found or invisible", async () => {
    // 999: Not found
    const detailComponent404 = await BlogPostDetailPage({
      params: Promise.resolve({ id: "999" }),
    });
    render(detailComponent404);
    expect(notFound).toHaveBeenCalledTimes(1);

    // 3: Invisible post
    const detailComponentHidden = await BlogPostDetailPage({
      params: Promise.resolve({ id: "3" }),
    });
    render(detailComponentHidden);
    expect(notFound).toHaveBeenCalledTimes(2);
  });
});
