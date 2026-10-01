import ComboDetailContent from "./ComboDetailContent";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ComboDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/combos`, { cache: "no-store" });
  } catch {
    throw new Error("Combo service unavailable");
  }

  if (!response.ok) {
    throw new Error("Combo service unavailable");
  }

  const json = await response.json();
  const combos = Array.isArray(json) ? json : (json.data ?? []);
  if (!combos.some((combo: { slug?: string }) => combo.slug === slug)) {
    notFound();
  }

  return <ComboDetailContent slug={slug} />;
}
