"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function AdminRouteGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, sessionReady } = useAuthStore();
  const mounted = useHasMounted();

  useEffect(() => {
    if (!mounted || !sessionReady) {
      return;
    }

    if (!user) {
      router.push("/login?redirect=/admin");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [mounted, router, sessionReady, user]);

  if (!mounted || !sessionReady || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Đang chuyển hướng...
      </div>
    );
  }

  return children;
}
