"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Franchise, UserSession } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Target,
  MapPin,
  UserCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface OnboardFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFranchiseCreated?: (franchise: Franchise) => void;
}

export function OnboardFranchiseModal({
  isOpen,
  onClose,
  onFranchiseCreated,
}: OnboardFranchiseModalProps) {
  const router = useRouter();
  const { currentUser, registerNewUser, switchRole } = useAuth();
  const { addNotification } = useNotifications();

  const initialForm = {
    code: "",
    name: "",
    location: "",
    state: "Tamil Nadu",
    annualTargetLakhs: 120, // ₹1.2 Cr default
    agreementStartDate: "2026-04-01",
    agreementEndDate: "2029-03-31",
    territoryDistricts: "",
    pincodes: "",
    contactPerson: "",
    phone: "",
    email: "",
    status: "Active" as const,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    franchise: Franchise;
    adminUser: UserSession;
  } | null>(null);

  // Auto-fill suggestion based on city/location
  const handleLocationChange = (val: string) => {
    const loc = val.trim();
    const short = loc.slice(0, 3).toUpperCase();
    const updated = {
      ...form,
      location: val,
      name: form.name || (loc ? `Argus ${loc} Franchise Centre` : ""),
      code: form.code || (short ? `FR-${short}` : ""),
      territoryDistricts: form.territoryDistricts || loc,
      email: form.email || (loc ? `admin.${loc.toLowerCase().replace(/[^a-z0-9]/g, "")}@arguscnc.com` : ""),
    };
    setForm(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.code.trim() || !form.name.trim() || !form.location.trim()) {
      setError("Please fill in the Franchise Code, Entity Name, and Location.");
      return;
    }
    if (!form.contactPerson.trim() || !form.email.trim()) {
      setError("Primary Managing Partner name and Admin Email are required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        location: form.location.trim(),
        state: form.state,
        annualTarget: Number(form.annualTargetLakhs) * 100000,
        agreementStartDate: form.agreementStartDate,
        agreementEndDate: form.agreementEndDate,
        status: form.status,
        territoryDistricts: form.territoryDistricts
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        pincodes: form.pincodes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim() || "+91 98000 00000",
        email: form.email.trim(),
        orgId: currentUser?.orgId,
      };

      const res = await fetch("/api/franchises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to onboard franchise partner");
      }

      const data: { franchise: Franchise; adminUser: UserSession } = await res.json();
      setCreatedResult(data);

      // Dynamically add to role switcher
      if (data.adminUser) {
        registerNewUser(data.adminUser);
      }

      // Add to notifications
      addNotification({
        title: "Franchise Partner Onboarded",
        desc: `${data.franchise.name} (${data.franchise.code}) registered with ₹${(
          data.franchise.annualTarget / 10000000
        ).toFixed(2)} Cr quota in ${data.franchise.location}.`,
        type: "contract",
        link: "/ho/franchises",
      });

      if (onFranchiseCreated) {
        onFranchiseCreated(data.franchise);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while onboarding franchise.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedResult(null);
    setError(null);
    setForm(initialForm);
    onClose();
  };

  const handleSwitchToNewFranchise = () => {
    if (createdResult?.adminUser) {
      switchRole(createdResult.adminUser.id);
      handleClose();
      router.push("/dashboard");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Head Office: Onboard New Franchise Partner"
      maxWidth="3xl"
    >
      {createdResult ? (
        <div className="space-y-6 py-2">
          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-950 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-900">
                  Franchise Successfully Onboarded!
                </h3>
                <p className="text-xs text-emerald-700">
                  Exclusive territory authorized & initial Franchise Admin account provisioned.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                <span className="text-slate-400 block text-[11px]">Partner Code & Entity</span>
                <span className="font-extrabold text-slate-900 block text-sm">
                  {createdResult.franchise.code}
                </span>
                <span className="text-slate-600 truncate block">
                  {createdResult.franchise.name}
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                <span className="text-slate-400 block text-[11px]">Annual Quota & Term</span>
                <span className="font-extrabold text-[#FF6600] block text-sm">
                  ₹{(createdResult.franchise.annualTarget / 10000000).toFixed(2)} Cr Target
                </span>
                <span className="text-slate-600 block text-[11px]">
                  FY {createdResult.franchise.agreementStartDate.slice(0, 4)} – {createdResult.franchise.agreementEndDate.slice(0, 4)}
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                <span className="text-slate-400 block text-[11px]">Live Admin Account</span>
                <span className="font-extrabold text-slate-900 block text-sm">
                  {createdResult.adminUser.name}
                </span>
                <span className="text-slate-600 truncate block text-[11px]">
                  {createdResult.adminUser.email}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-[#FF6600]" />
              <span>Immediate Live Exploration Ready</span>
            </div>
            <p>
              The new franchise partner has been added to the Head Office Network and will now appear in live reports, consolidated metrics, and the top-right live role switcher.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Done / Return to Franchises
            </button>
            <button
              type="button"
              onClick={handleSwitchToNewFranchise}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Switch to this Franchise Admin Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Entity Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              <Building2 className="w-4 h-4 text-[#FF6600]" />
              <span className="text-sm">1. Franchise Partner Entity & Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Operating City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kochi, Madurai, Nagpur"
                  value={form.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Franchise Code * <span className="text-slate-400 font-normal">(Auto-generated or custom)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FR-COK"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-mono uppercase font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Legal Entity / Franchise Center Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Argus Kochi CNC Industrial Machinery Centre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating State *</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="Active">Active (Operational)</option>
                  <option value="Suspended">Suspended (Pending Review)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Quota & Horizon */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              <Target className="w-4 h-4 text-[#FF6600]" />
              <span className="text-sm">2. Commercial Target & Agreement Horizon</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Annual Sales Target (₹ Lakhs) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={10}
                    max={5000}
                    step={5}
                    value={form.annualTargetLakhs}
                    onChange={(e) => setForm({ ...form, annualTargetLakhs: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  = ₹{(form.annualTargetLakhs / 100).toFixed(2)} Crore / year
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agreement Start *</label>
                <input
                  type="date"
                  required
                  value={form.agreementStartDate}
                  onChange={(e) => setForm({ ...form, agreementStartDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agreement End *</label>
                <input
                  type="date"
                  required
                  value={form.agreementEndDate}
                  onChange={(e) => setForm({ ...form, agreementEndDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Exclusive Territory */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
              <span className="text-sm">3. Exclusive Territory Jurisdiction & Protection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Districts <span className="text-slate-400 font-normal">(Comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ernakulam, Thrissur, Alappuzha"
                  value={form.territoryDistricts}
                  onChange={(e) => setForm({ ...form, territoryDistricts: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Designated geographical region for leads & installation attribution.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Territory PIN Codes <span className="text-slate-400 font-normal">(Comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 682001, 682002, 682011, 680001"
                  value={form.pincodes}
                  onChange={(e) => setForm({ ...form, pincodes: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Registered in Territory Protection engine to prevent cross-franchise poaching.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Primary Contact & Initial Admin */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              <UserCheck className="w-4 h-4 text-[#FF6600]" />
              <span className="text-sm">4. Managing Partner & Initial Admin Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Managing Partner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biju Thomas"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98470 12345"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admin Login Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.kochi@arguscnc.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg text-[11px] text-orange-950 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
              <span>
                <strong>Automatic Role Provisioning:</strong> An initial Franchise Admin account will be created automatically. Head Office staff can switch directly into this franchise profile to test operations, assign leads, or inspect local dashboard metrics.
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Onboarding Partner...</span>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Authorize & Onboard Franchise</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
