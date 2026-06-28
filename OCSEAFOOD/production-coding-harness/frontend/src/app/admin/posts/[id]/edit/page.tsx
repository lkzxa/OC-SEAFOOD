import PostForm from "../../_components/PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostForm isEditing={true} postId={id} />;
}
