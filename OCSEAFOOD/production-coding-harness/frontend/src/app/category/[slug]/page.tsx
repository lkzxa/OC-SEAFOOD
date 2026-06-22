import CategoryContent from "./CategoryContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryContent slug={slug} />;
}
