import ComboDetailContent from "./ComboDetailContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ComboDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <ComboDetailContent slug={slug} />;
}
