"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Building2, FileCheck, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithGoogle } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegisterWithGoogle = async (email: string, name: string) => {
    // Form Validations
    if (!companyName.trim()) {
      setErrorMessage("Please enter your registered Company Name.");
      return;
    }

    const cleanGstin = gstin.trim().toUpperCase();
    if (!cleanGstin) {
      setErrorMessage("Please enter your company GSTIN Number.");
      return;
    }

    if (cleanGstin.length !== 15) {
      setErrorMessage("GSTIN must be exactly 15 characters (e.g. 33AAAAA0000A1Z5).");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await registerWithGoogle(
      companyName.trim(),
      cleanGstin,
      email,
      name
    );

    setLoading(false);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setErrorMessage(result.error || "Failed to register organization.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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
          Register Your Organization
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Onboard your manufacturing or machinery company to the Argus SaaS Network
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {/* Workflow step explanation */}
          <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-xl space-y-2">
            <div className="text-xs font-bold text-[#FF6600] uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Head Office Admin Registration</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your corporate entity details, then authenticate with your official Google account. 
              Your registration will be sent to the <strong>Super Admin</strong> for onboarding approval.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Precision Machinery Pvt Ltd"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* 2. GSTIN Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                GSTIN Number (15 Digits) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => {
                    setGstin(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Official Indian Goods and Services Tax Identification Number for your business.
              </p>
            </div>

            {/* 3. Google Sign In Button */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Head Office Admin Google Sign-In <span className="text-red-500">*</span>
              </label>
              <GoogleSignInButton
                mode="register"
                label="Register with Google"
                isLoading={loading}
                disabled={!companyName.trim() || gstin.trim().length !== 15}
                onAuthenticated={handleRegisterWithGoogle}
              />
              <p className="mt-1.5 text-[11px] text-center text-slate-400">
                This Google email will become the master login for your Head Office Admin dashboard.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>

            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Onboarding</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
