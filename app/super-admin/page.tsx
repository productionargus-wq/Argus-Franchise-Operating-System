"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Organization } from "@/lib/types";
import {
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Users,
} from "lucide-react";

export default function SuperAdminPage() {
  const { currentUser, isSuperAdmin } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
      }
    } catch (e) {
      console.error("Failed to load organizations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleApprove = async (orgId: string, orgName: string) => {
    try {
      setActionLoading(orgId);
      setFeedback(null);
      const res = await fetch(`/api/organizations/${orgId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          approvedBy: currentUser?.email || "Platform Super Admin",
        }),
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Organization "${orgName}" has been successfully APPROVED and onboarded! The Head Office Admin can now log in.`,
        });
        await fetchOrganizations();
      } else {
        const data = await res.json();
        setFeedback({ type: "error", text: data.error || "Failed to approve organization." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Approval action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orgId: string, orgName: string) => {
    const reason = window.prompt(`Enter reason for rejecting "${orgName}":`, "GSTIN or documentation verification failed");
    if (reason === null) return;

    try {
      setActionLoading(orgId);
      setFeedback(null);
      const res = await fetch(`/api/organizations/${orgId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          approvedBy: currentUser?.email || "Platform Super Admin",
          reason,
        }),
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Organization "${orgName}" was rejected.`,
        });
        await fetchOrganizations();
      } else {
        const data = await res.json();
        setFeedback({ type: "error", text: data.error || "Failed to reject organization." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message || "Rejection action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrgs = organizations.filter((o) => o.status === "PENDING_APPROVAL");
  const approvedOrgs = organizations.filter((o) => o.status === "APPROVED");
  const rejectedOrgs = organizations.filter((o) => o.status === "REJECTED");

  const displayedOrgs = (activeTab === "pending" ? pendingOrgs : organizations).filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-[#293033] text-white p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform Super Admin Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Organization Approvals & B2B SaaS Directory
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            You do not belong to any organization. As Super Admin, you control which companies are approved and onboarded to the Argus multi-tenant cloud platform.
          </p>
        </div>

        <button
          onClick={fetchOrganizations}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 bg-[#3A4448] hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Organizations
            </span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{organizations.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Registered businesses on platform</div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-amber-300 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Approvals
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingOrgs.length}</div>
          <div className="text-[11px] text-amber-700/80 font-semibold mt-1">Requires Super Admin review</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Approved & Active
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{approvedOrgs.length}</div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Operating on Argus network</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rejected
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-700 mt-2">{rejectedOrgs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Declined applications</div>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "pending"
                  ? "bg-[#FF6600] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Reviews</span>
              {pendingOrgs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white text-[#FF6600] font-black">
                  {pendingOrgs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#293033] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Organizations ({organizations.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, GSTIN, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
            />
          </div>
        </div>

        {/* Organizations Table */}
        <div className="overflow-x-auto">
          {displayedOrgs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto opacity-30" />
              <div className="text-sm font-bold text-slate-600">No organizations found</div>
              <p className="text-xs">
                {activeTab === "pending"
                  ? "There are currently no pending organization approvals. All registrations are processed!"
                  : "No organizations match your search query."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-compact">
              <thead>
                <tr>
                  <th>Organization & ID</th>
                  <th>GSTIN</th>
                  <th>Head Office Admin</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th className="text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrgs.map((org) => {
                  const isProcessing = actionLoading === org.orgId;
                  return (
                    <tr key={org.orgId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#293033] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{org.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{org.orgId}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {org.gstin}
                        </span>
                      </td>

                      <td>
                        <div className="text-xs font-semibold text-slate-800">{org.adminName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{org.adminEmail}</div>
                      </td>

                      <td className="text-xs text-slate-500">{org.createdAt || "2026-01-01"}</td>

                      <td>
                        {org.status === "PENDING_APPROVAL" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {org.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                        {org.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      <td className="text-right">
                        {org.status === "PENDING_APPROVAL" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(org.orgId, org.name)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isProcessing ? "Processing..." : "Approve"}</span>
                            </button>

                            <button
                              onClick={() => handleReject(org.orgId, org.name)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 hover:border-rose-200 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {org.approvedBy ? `By ${org.approvedBy}` : "Completed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
