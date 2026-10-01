import StatusPanel from "@/components/StatusPanel";

export default function NotFound() {
  return (
    <StatusPanel
      description="Đường dẫn bạn mở không tồn tại, đã được thay đổi hoặc nội dung hiện không còn hiển thị."
      eyebrow="Lỗi 404"
      icon="travel_explore"
      primaryHref="/menu"
      primaryLabel="Xem thực đơn"
      secondaryHref="/"
      secondaryLabel="Về trang chủ"
      title="Không tìm thấy trang"
    />
  );
}
