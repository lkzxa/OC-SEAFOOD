"use client";

import StatusPanel from "@/components/StatusPanel";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <StatusPanel
      announce="assertive"
      description="Hệ thống chưa thể tải nội dung lúc này. Vui lòng thử lại; nếu lỗi tiếp diễn, bạn có thể quay về trang chủ."
      eyebrow="Kết nối tạm thời gián đoạn"
      icon="cloud_off"
      onPrimaryAction={retry}
      primaryLabel="Thử tải lại"
      secondaryHref="/"
      secondaryLabel="Về trang chủ"
      title="Chưa thể hiển thị nội dung"
    />
  );
}
