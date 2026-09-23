"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Franchise } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import {
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Save,
  CheckCircle2,
} from "lucide-react";

interface EditFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onFranchiseUpdated?: (franchise: Franchise) => void;
}

export function EditFranchiseModal({
  isOpen,
  onClose,
  franchise,
  onFranchiseUpdated,
}: EditFranchiseModalProps) {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [form, setForm] = useState({
    name: "",
    location: "",
    state: "Tamil Nadu",
    status: "Active" as "Active" | "Inactive" | "Suspended",
    contactPerson: "",
    phone: "",
    email: "",
    annualTargetLakhs: 120,
    agreementStartDate: "",
    agreementEndDate: "",
    territoryDistricts: "",
    pincodes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (franchise) {
      setForm({
        name: franchise.name || "",
        location: franchise.location || "",
        state: franchise.state || "Tamil Nadu",
        status: franchise.status || "Active",
        contactPerson: franchise.contactPerson || "",
        phone: franchise.phone || "",
        email: franchise.email || "",
        annualTargetLakhs: franchise.annualTarget ? franchise.annualTarget / 100000 : 120,
        agreementStartDate: franchise.agreementStartDate || "2026-04-01",
        agreementEndDate: franchise.agreementEndDate || "2029-03-31",
        territoryDistricts: Array.isArray(franchise.territoryDistricts)
          ? franchise.territoryDistricts.join(", ")
          : franchise.territoryDistricts || "",
        pincodes: Array.isArray(franchise.pincodes)
          ? franchise.pincodes.join(", ")
          : franchise.pincodes || "",
      });
      setError(null);
      setSuccess(false);
    }
  }, [franchise, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchise) return;
    setError(null);

    if (!form.name.trim() || !form.location.trim()) {
      setError("Franchise Name and Location are required.");
      return;
    }

    try {
      setLoading(true);

      const districts = form.territoryDistricts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const pins = form.pincodes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        state: form.state,
        status: form.status,
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        annualTarget: Number(form.annualTargetLakhs) * 100000,
        agreementStartDate: form.agreementStartDate,
        agreementEndDate: form.agreementEndDate,
        territoryDistricts: districts,
        pincodes: pins,
        orgId: currentUser?.orgId,
      };

      const res = await fetch(
        `/api/franchises/${franchise._id || franchise.code}?orgId=${encodeURIComponent(
          currentUser?.orgId || ""
        )}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to update franchise");
      }

      const updatedFranchise: Franchise = await res.json();

      setSuccess(true);
      addNotification({
        title: "Franchise Updated",
        desc: `${updatedFranchise.name} (${updatedFranchise.code}) details updated successfully.`,
        type: "service",
        link: "/ho/franchises",
      });

      if (onFranchiseUpdated) {
        onFranchiseUpdated(updatedFranchise);
      }

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update franchise partner.");
    } finally {
      setLoading(false);
    }
  };

  if (!franchise) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Franchise — ${franchise.name}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">Franchise details saved successfully!</span>
          </div>
        )}

        {/* Basic Entity Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Franchise Code
            </label>
            <input
              type="text"
              value={franchise.code}
              disabled
              className="w-full text-xs px-3 py-2 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed font-mono font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Entity / Centre Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              placeholder="e.g. Argus Coimbatore Franchise Centre"
            />
          </div>
        </div>

        {/* Location & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City / Base Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                placeholder="e.g. Coimbatore"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State
            </label>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            >
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Telangana">Telangana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Partner Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "Active" | "Inactive" | "Suspended",
                })
              }
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Contact / MD
            </label>
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              placeholder="e.g. Sundaramurthy K"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              placeholder="+91 98422 11099"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              placeholder="admin.cbe@arguscnc.com"
            />
          </div>
        </div>

        {/* Targets & Agreement Term */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Annual Sales Target (₹ Lakhs)
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-2 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.annualTargetLakhs}
                onChange={(e) =>
                  setForm({ ...form, annualTargetLakhs: Number(e.target.value) })
                }
                className="w-full text-xs pl-7 pr-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Agreement Start Date
            </label>
            <input
              type="date"
              value={form.agreementStartDate}
              onChange={(e) => setForm({ ...form, agreementStartDate: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Agreement End Date
            </label>
            <input
              type="date"
              value={form.agreementEndDate}
              onChange={(e) => setForm({ ...form, agreementEndDate: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>
        </div>

        {/* Territory Districts & PIN Codes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Territory Districts <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <textarea
              rows={2}
              value={form.territoryDistricts}
              onChange={(e) => setForm({ ...form, territoryDistricts: e.target.value })}
              className="w-full text-xs p-2.5 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              placeholder="e.g. Coimbatore, Tiruppur, Erode, Nilgiris"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned PIN Codes / Prefixes <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <textarea
              rows={2}
              value={form.pincodes}
              onChange={(e) => setForm({ ...form, pincodes: e.target.value })}
              className="w-full text-xs p-2.5 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-mono"
              placeholder="e.g. 641001, 641002, 641006, 641018"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
