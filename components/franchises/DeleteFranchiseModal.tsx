"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Franchise } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import {
  AlertTriangle,
  Trash2,
  Building2,
  Users,
  MapPin,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface DeleteFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onFranchiseDeleted?: (franchiseId: string) => void;
}

interface FranchiseDeleteImpact {
  franchise: {
    code: string;
    name: string;
    location: string;
    state: string;
    contactPerson: string;
    email: string;
    pincodes: string[];
  };
  adminUsersCount: number;
  adminUsers: Array<{ name: string; email: string; role: string }>;
  incompleteLeadsCount: number;
  openOpportunitiesCount: number;
  territoriesCount: number;
  otherFranchises: Array<{ code: string; name: string; location: string; state: string }>;
  recommendedTarget: { code: string; name: string; location: string; state: string; reason?: string } | null;
}

export function DeleteFranchiseModal({
  isOpen,
  onClose,
  franchise,
  onFranchiseDeleted,
}: DeleteFranchiseModalProps) {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impact, setImpact] = useState<FranchiseDeleteImpact | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>("HO");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && franchise && currentUser?.orgId) {
      setImpactLoading(true);
      setError(null);
      const targetId = franchise._id || franchise.code;
      fetch(
        `/api/franchises/${encodeURIComponent(targetId)}?impact=true&orgId=${encodeURIComponent(
          currentUser.orgId
        )}`
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data: FranchiseDeleteImpact | null) => {
          setImpact(data);
          if (data?.recommendedTarget?.code) {
            setSelectedTarget(data.recommendedTarget.code);
          } else if (data?.otherFranchises && data.otherFranchises.length > 0) {
            setSelectedTarget(data.otherFranchises[0].code);
          } else {
            setSelectedTarget("HO");
          }
        })
        .catch((e) => {
          console.error("Failed to fetch franchise impact analysis:", e);
        })
        .finally(() => {
          setImpactLoading(false);
        });
    } else {
      setImpact(null);
      setSelectedTarget("HO");
      setError(null);
    }
  }, [isOpen, franchise, currentUser?.orgId]);

  if (!franchise) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const targetId = franchise._id || franchise.code;
      const params = new URLSearchParams();
      params.set("orgId", currentUser?.orgId || "");
      if (selectedTarget) {
        params.set("targetFranchiseId", selectedTarget);
      }

      const res = await fetch(
        `/api/franchises/${encodeURIComponent(targetId)}?${params.toString()}`,
        {
          method: "DELETE",
        }
      );

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to delete franchise");
      }

      addNotification({
        title: "Franchise Removed & Leads Rerouted",
        desc: `${franchise.name} (${franchise.code}) has been deleted. ${
          resData.reroutedLeadsCount || 0
        } active leads rerouted to ${resData.targetFranchiseName || "new partner"}.`,
        type: "service",
        link: "/ho/franchises",
      });

      if (onFranchiseDeleted) {
        onFranchiseDeleted(franchise._id);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete franchise partner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) onClose();
      }}
      title="Franchise Termination & Lead Rerouting"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs text-red-900 space-y-1">
            <p className="font-bold">Permanent Franchise Deletion</p>
            <p className="text-red-700 leading-relaxed">
              Deleting <strong className="text-red-950 font-bold">{franchise.name} ({franchise.code})</strong> will permanently remove this franchise, revoke its administrator accounts, release exclusive PIN territories, and reroute incomplete customer leads to prevent lost business.
            </p>
          </div>
        </div>

        {/* Franchise Profile Summary */}
        <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200 space-y-1.5 text-slate-600">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#FF6600]" />
              {franchise.name} ({franchise.code})
            </span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-semibold">
              {franchise.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div>
              <span className="text-slate-400">Location: </span>
              <span className="font-medium text-slate-800">{franchise.location}, {franchise.state}</span>
            </div>
            <div>
              <span className="text-slate-400">Primary Contact: </span>
              <span className="font-medium text-slate-800">{franchise.contactPerson} ({franchise.email || "No email"})</span>
            </div>
          </div>
        </div>

        {/* Impact Analysis Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span>Downstream Cascade Impact Analysis:</span>
            {impactLoading && (
              <span className="text-[11px] text-[#FF6600] font-normal flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Scanning related records...
              </span>
            )}
          </h4>

          {impactLoading ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF6600]" />
              Calculating admin users, leads, and territory overlaps...
            </div>
          ) : impact ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-red-50/60 border border-red-200 rounded-lg">
                <div className="text-red-700 font-semibold text-[11px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Franchise Admin
                </div>
                <div className="text-base font-bold text-red-900 mt-1">
                  {impact.adminUsersCount} <span className="text-xs font-normal text-red-600">user{impact.adminUsersCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="text-[10px] text-red-600 mt-0.5">
                  Permanent removal
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Incomplete Leads
                </div>
                <div className="text-base font-bold text-emerald-900 mt-1">
                  {impact.incompleteLeadsCount} <span className="text-xs font-normal text-emerald-600">active</span>
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  To be rerouted
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                <div className="text-blue-700 font-semibold text-[11px] flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5" /> Open Deals
                </div>
                <div className="text-base font-bold text-blue-900 mt-1">
                  {impact.openOpportunitiesCount} <span className="text-xs font-normal text-blue-600">pipeline</span>
                </div>
                <div className="text-[10px] text-blue-600 mt-0.5">
                  Reassigned
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                <div className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> PIN Ranges
                </div>
                <div className="text-base font-bold text-amber-900 mt-1">
                  {impact.territoriesCount} <span className="text-xs font-normal text-amber-600">records</span>
                </div>
                <div className="text-[10px] text-amber-600 mt-0.5">
                  Freed for routing
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Users to be deleted info */}
        {impact && impact.adminUsers.length > 0 && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-slate-700 text-[11px]">
              Franchise Staff Accounts Scheduled for Revocation:
            </span>
            <div className="space-y-1 pt-1">
              {impact.adminUsers.map((u, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] text-slate-600">
                  <span className="font-medium text-slate-800">{u.name} ({u.role})</span>
                  <span className="text-slate-500 font-mono text-[10px]">{u.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead Rerouting Destination Selection */}
        <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Reroute Incomplete Leads To:
          </label>

          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            disabled={loading || impactLoading}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-[#FF6600]"
          >
            {impact?.recommendedTarget && (
              <option value={impact.recommendedTarget.code}>
                ★ {impact.recommendedTarget.name} ({impact.recommendedTarget.code}) - {impact.recommendedTarget.location} (Recommended - {impact.recommendedTarget.reason})
              </option>
            )}

            {impact?.otherFranchises
              .filter((f) => f.code !== impact.recommendedTarget?.code)
              .map((f) => (
                <option key={f.code} value={f.code}>
                  {f.name} ({f.code}) - {f.location}, {f.state}
                </option>
              ))}

            <option value="HO">Head Office Direct (Direct Sales Pool)</option>
          </select>

          <p className="text-[11px] text-slate-600 leading-tight">
            {impact && impact.incompleteLeadsCount > 0
              ? `All ${impact.incompleteLeadsCount} active prospective buyer inquiries will be seamlessly transferred to this partner with complete requirement notes and contact information.`
              : "No active buyer leads currently assigned to this franchise. Future territory PIN routing will follow organization defaults."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || impactLoading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Terminating & Rerouting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {impact && impact.incompleteLeadsCount > 0
                    ? `Confirm Deletion & Reroute (${impact.incompleteLeadsCount}) Leads`
                    : "Confirm Franchise Deletion"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
