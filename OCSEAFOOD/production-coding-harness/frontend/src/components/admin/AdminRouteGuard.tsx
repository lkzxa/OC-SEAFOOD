"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminRouteGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!user) {
      router.push("/login?redirect=/admin");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [mounted, router, user]);

  if (!mounted || !user) {
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
