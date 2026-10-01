import CategoryContent from "./CategoryContent";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/categories`, { cache: "no-store" });
  } catch {
    throw new Error("Category service unavailable");
  }

  if (!response.ok) {
    throw new Error("Category service unavailable");
  }

  const json = await response.json();
  const categories = Array.isArray(json) ? json : (json.data ?? []);
  if (!categories.some((category: { slug?: string }) => category.slug === slug)) {
    notFound();
  }

  return <CategoryContent slug={slug} />;
}
