"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isSuperAdmin, isHeadOffice, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isSuperAdmin) {
      router.replace("/super-admin");
    } else if (isHeadOffice) {
      router.replace("/ho/dashboard");
    } else {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isSuperAdmin, isHeadOffice, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#FF6600] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#293033]">Routing to your authorized dashboard...</p>
      </div>
    </div>
  );
}
