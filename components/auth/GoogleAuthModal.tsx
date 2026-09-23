"use client";

import React, { useState } from "react";
import { Mail, Shield, Building2, UserCheck, X, Sparkles, AlertCircle } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
  mode: "login" | "register";
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  mode,
}: GoogleAuthModalProps) {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAccounts = [
    {
      role: "Platform Super Admin",
      badge: "Super Admin",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      name: "Platform Super Admin",
      email: "superadmin@arguscloud.io",
      icon: Shield,
    },
    {
      role: "Head Office Admin",
      badge: "Argus HO Admin",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      name: "Vikram Rathore",
      email: "vikram.ho@arguscnc.com",
      icon: Building2,
    },
    {
      role: "Franchise Admin",
      badge: "Coimbatore Franchise",
      badgeColor: "bg-orange-100 text-[#FF6600] border-orange-200",
      name: "Suresh Kumar",
      email: "suresh.cbe@arguscnc.com",
      icon: UserCheck,
    },
    {
      role: "Service Engineer",
      badge: "Field Ops",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      name: "Dinesh Karthik",
      email: "dinesh.service@arguscnc.com",
      icon: UserCheck,
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setError("Please enter a valid Google email address.");
      return;
    }
    const name = customName.trim() || customEmail.split("@")[0];
    onSelectAccount(customEmail.trim().toLowerCase(), name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Google Authentication</h3>
              <p className="text-[11px] text-slate-500">
                {mode === "register"
                  ? "Select or enter your Google account to register"
                  : "Choose your authorized Google account to sign in"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Select Predefined Personas for testing */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>Quick Select Verified Accounts</span>
              <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold">1-Click</span>
            </div>
            <div className="space-y-1.5">
              {quickAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    onClick={() => onSelectAccount(acc.email, acc.name)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#FF6600] hover:bg-orange-50/30 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#FF6600]/10 flex items-center justify-center text-slate-600 group-hover:text-[#FF6600] transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{acc.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${acc.badgeColor}`}
                    >
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium uppercase">
              Or Enter Any Google Email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Custom Google Account Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@yourcompany.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (optional)
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue with this Google Account</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
