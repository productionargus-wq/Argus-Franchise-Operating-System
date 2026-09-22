"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isHeadOffice } = useAuth();

  useEffect(() => {
    if (isHeadOffice) {
      router.replace("/ho/dashboard");
    } else {
      router.replace("/dashboard");
    }
  }, [isHeadOffice, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#FF6600] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#293033]">Loading ARGUSCNC Partner Portal...</p>
      </div>
    </div>
  );
}
