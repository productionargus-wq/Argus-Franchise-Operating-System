"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowRight, ArrowLeft, Building2, UserPlus, HelpCircle } from "lucide-react";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your Google account";

  return (
    <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
      {/* Alert Header */}
      <div className="flex flex-col items-center text-center p-6 bg-red-50/70 border border-red-200 rounded-2xl space-y-3">
        <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-200/70 text-red-900 uppercase tracking-wider mb-1">
            Access Denied
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Account Not Registered
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
          The Google account <strong className="text-slate-900 font-mono font-bold">{email}</strong> is not associated with any approved organization in the Argus network.
        </p>
      </div>

      {/* Guidance */}
      <div className="space-y-3 text-xs text-slate-600">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Are you a Franchise Admin or Service Engineer?</span>
          </div>
          <p className="text-slate-500 pl-5">
            Contact your organization Head Office Admin. They must add your email in their <strong>Users & Roles</strong> directory before you can sign in.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-[#FF6600]" />
            <span>Are you an Organization Head Office?</span>
          </div>
          <p className="text-slate-500 pl-5">
            Register your company details and GSTIN. Once approved by the Super Admin, your account will be activated.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-2">
        <Link
          href="/register"
          className="w-full py-3 px-4 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>Register Your Organization (HO Admin)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/login"
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Try Another Google Account</span>
        </Link>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
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
          Argus Operating System
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Multi-Tenant Franchise Network Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Suspense fallback={<div className="bg-white p-8 rounded-2xl shadow-xl text-center text-xs">Loading...</div>}>
          <AccessDeniedContent />
        </Suspense>
      </div>
    </div>
  );
}
