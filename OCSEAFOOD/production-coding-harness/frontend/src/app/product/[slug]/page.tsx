import ProductDetailContent from "./ProductDetailContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}
