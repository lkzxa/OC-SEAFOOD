import ProductDetailContent from "./ProductDetailContent";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/products/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
  } catch {
    throw new Error("Product service unavailable");
  }

  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error("Product service unavailable");
  }

  const product = await response.json();
  if (!product?.isVisible) {
    notFound();
  }

  return <ProductDetailContent slug={slug} />;
}
