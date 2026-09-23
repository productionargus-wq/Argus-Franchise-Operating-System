"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ShieldCheck, Building2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleAuth = async (email: string, name: string) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await loginWithGoogle(email, name);
    setLoading(false);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      if (result.code === "UNREGISTERED") {
        router.push(`/access-denied?email=${encodeURIComponent(email)}`);
      } else {
        setErrorMessage(result.error || "Failed to sign in. Please verify your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo and Brand */}
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white shadow-md border border-slate-200 mb-4">
          <Image
            src="/argus-logo.png"
            alt="Argus CNC Logo"
            width={160}
            height={42}
            className="h-9 w-auto object-contain"
            priority
          />
        </div>
        <h2 className="text-2xl font-black text-[#293033] tracking-tight">
          Argus Operating System
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Centralized Multi-Tenant B2B SaaS Platform for CNC Franchise Networks
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#FF6600] border border-orange-200/60 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Single Sign-On (SSO)</span>
            </span>
            <h3 className="text-base font-bold text-slate-800">
              Sign in with your organization account
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Authorized Head Office Admins, Franchise Admins, Sales & Service Engineers
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Login Page: Only Google Sign In button as requested */}
          <div className="space-y-4">
            <GoogleSignInButton
              mode="login"
              label="Sign in with Google"
              isLoading={loading}
              onAuthenticated={handleGoogleAuth}
            />
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
            <div className="text-xs text-slate-500">
              New Organization Head Office?
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6600] hover:text-[#E65C00] hover:underline transition-all"
            >
              <span>Register Your Organization (HO Admin)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Security / Compliance Badges */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Tenant Isolated</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Super Admin Approved</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>256-Bit SSL</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Argus Technologies Pvt Ltd © 2026. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
