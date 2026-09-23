"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  Clock,
  Building2,
  FileCheck,
  Mail,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { currentUser, organization, loginWithGoogle, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!currentUser?.email) return;
    setChecking(true);
    setStatusMessage(null);

    const res = await loginWithGoogle(currentUser.email);
    setChecking(false);

    if (res.success && res.redirectUrl) {
      if (res.redirectUrl === "/pending-approval") {
        setStatusMessage("Your organization is still pending approval by the Super Admin.");
      } else {
        router.push(res.redirectUrl);
      }
    } else {
      setStatusMessage(res.error || "Could not verify status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
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
          Registration Pending Approval
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Awaiting Verification from Platform Super Admin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {/* Animated Status Indicator */}
          <div className="flex flex-col items-center text-center p-6 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 animate-pulse">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200/70 text-amber-900 uppercase tracking-wider mb-1">
                Status: Pending Approval
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Application Under Super Admin Review
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Your organization registration has been safely received. The Super Admin reviews all company credentials to ensure platform security and territory integrity.
            </p>
          </div>

          {/* Submitted Company Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 divide-y divide-slate-200/60 text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Company Name</span>
              </span>
              <span className="font-bold text-slate-800">
                {organization?.name || currentUser?.orgName || "Your Registered Company"}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-slate-400" />
                <span>GSTIN</span>
              </span>
              <span className="font-mono font-bold text-slate-800">
                {organization?.gstin || "33AAAAA0000A1Z5"}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Authorized Admin Email</span>
              </span>
              <span className="font-medium text-slate-800">
                {currentUser?.email || "admin@company.com"}
              </span>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 text-center font-medium">
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full py-3 px-4 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking Approval Status..." : "Check Approval Status Now"}</span>
            </button>

            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>You will receive immediate dashboard access once approved.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
