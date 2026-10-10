"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { PartnerPolicyDoc, PartnerTierTerms, PartnerClause } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import {
  FileText,
  ShieldCheck,
  Building2,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Printer,
  Pencil,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  MapPin,
  Clock,
  Target,
  Wrench,
  Percent,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface TermsViewProps {
  isHoView?: boolean;
}

export function TermsView({ isHoView = false }: TermsViewProps) {
  const { currentUser, isHeadOffice } = useAuth();
  const [policy, setPolicy] = useState<PartnerPolicyDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "regional_partner" | "channel_partner" | "referral_partner" | "matrix"
  >("regional_partner");
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTier, setEditTier] = useState<PartnerTierTerms | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadPolicy = async () => {
    if (!currentUser?.orgId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/terms?orgId=${encodeURIComponent(currentUser.orgId)}`);
      const data = await res.json();
      if (data && data.tiers) {
        setPolicy(data);
      }
    } catch (e) {
      console.error("Failed to load partner policy:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, [currentUser?.orgId]);

  const currentTierData: PartnerTierTerms | null =
    activeTab !== "matrix" && policy?.tiers ? policy.tiers[activeTab] : null;

  const toggleClause = (idx: number) => {
    setExpandedClauses((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    if (!currentTierData) return;
    const all: Record<number, boolean> = {};
    currentTierData.clauses.forEach((_, i) => (all[i] = true));
    setExpandedClauses(all);
  };

  const collapseAll = () => {
    setExpandedClauses({});
  };

  const handleOpenEdit = () => {
    if (!currentTierData) return;
    setEditTier(JSON.parse(JSON.stringify(currentTierData)));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTier || !currentUser?.orgId) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/terms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentUser.orgId,
          tier: editTier.tier,
          updates: editTier,
          updatedBy: currentUser.name || "Head Office Admin",
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPolicy(updated);
        setIsEditModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update tier terms");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update tier terms");
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePointChange = (clauseIdx: number, pointIdx: number, val: string) => {
    if (!editTier) return;
    const newClauses = [...editTier.clauses];
    newClauses[clauseIdx].points[pointIdx] = val;
    setEditTier({ ...editTier, clauses: newClauses });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
        Loading partner agreements and terms...
      </div>
    );
  }

  // =========================================================================
  // PRINTABLE FORMAL AGREEMENT VIEW
  // =========================================================================
  if (isPrintMode && currentTierData) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto space-y-6 text-slate-900 font-sans border border-slate-300 rounded-xl shadow-lg print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#FF6600] print:border-[#FF6600]">
          <div>
            <h1 className="text-2xl font-black text-[#293033] tracking-tight">
              ARGUS TECHNOLOGIES
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
              Franchise Partnership Agreement &bull; {currentTierData.tierName}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={() => setIsPrintMode(false)}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Exit Print View
            </button>
          </div>
        </div>

        {/* Agreement Preamble */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700 space-y-2">
          <p>
            <strong>DATE OF EXECUTION:</strong> {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
          <p>
            <strong>PARTIES:</strong> This Franchise Operating Agreement is entered into by and between{" "}
            <strong>Argus Technologies Pvt. Ltd.</strong> (hereinafter referred to as &ldquo;Principal&rdquo;) and the accredited franchise partner under the status of{" "}
            <strong>{currentTierData.tierName} ({currentTierData.badge})</strong>.
          </p>
          <p>
            <strong>COMMERCIAL LEVEL:</strong> {currentTierData.marginSummary} &bull;{" "}
            <strong>ANNUAL COMMITMENT:</strong> {currentTierData.targetSummary}
          </p>
        </div>

        {/* Clauses List */}
        <div className="space-y-4 text-xs">
          {currentTierData.clauses.map((clause, idx) => (
            <div key={idx} className="border-b border-slate-200 pb-3 space-y-1.5">
              <h3 className="font-bold text-sm text-[#293033]">{clause.title}</h3>
              <p className="text-slate-600 text-[11px] italic">{clause.description}</p>
              <ul className="space-y-1 pl-4 list-disc text-slate-700">
                {clause.points.map((pt, pIdx) => (
                  <li key={pIdx}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Formal Signature Blocks */}
        <div className="pt-10 grid grid-cols-2 gap-12 text-xs">
          <div className="border-t border-slate-400 pt-3 space-y-1">
            <p className="font-bold text-slate-900">For Argus Technologies Pvt. Ltd.</p>
            <p className="text-slate-500 text-[11px]">Authorized Signatory &amp; Corporate Seal</p>
            <p className="text-slate-400 text-[10px] pt-4">Date: ________________________</p>
          </div>
          <div className="border-t border-slate-400 pt-3 space-y-1">
            <p className="font-bold text-slate-900">For Franchise Partner ({currentTierData.tierName})</p>
            <p className="text-slate-500 text-[11px]">Authorized Partner Representative &amp; Seal</p>
            <p className="text-slate-400 text-[10px] pt-4">Date: ________________________</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN INTERACTIVE PORTAL VIEW
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF6600]" />
            <span>Franchise Terms &amp; Conditions Governance</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative operating terms, pricing discipline, territory exclusivity, and service SLAs across all 3 partner tiers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab !== "matrix" && (
            <button
              onClick={() => setIsPrintMode(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print formal agreement"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Formal Agreement</span>
            </button>
          )}

          {(isHeadOffice || currentUser?.role === "head_office_admin" || currentUser?.role === "super_admin") &&
            activeTab !== "matrix" && (
              <button
                onClick={handleOpenEdit}
                className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Tier Terms</span>
              </button>
            )}
        </div>
      </div>

      {/* Segmented Tier Switcher Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab("regional_partner")}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "regional_partner"
              ? "bg-[#293033] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#FF6600]" />
          <span>REGIONAL PARTNER</span>
        </button>

        <button
          onClick={() => setActiveTab("channel_partner")}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "channel_partner"
              ? "bg-[#293033] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>CHANNEL PARTNER</span>
        </button>

        <button
          onClick={() => setActiveTab("referral_partner")}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "referral_partner"
              ? "bg-[#293033] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>REFERRAL PARTNER</span>
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "matrix"
              ? "bg-[#293033] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>TIER COMPARISON MATRIX</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. TIER COMPARISON MATRIX VIEW */}
      {/* =================================================================== */}
      {activeTab === "matrix" && policy?.tiers && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
              Side-by-Side Partner Tier Comparison Matrix
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comprehensive governance matrix detailing commercial rights, margins, targets, and support across all partner models.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-compact text-xs">
              <thead>
                <tr>
                  <th className="w-1/4">Commercial Parameter</th>
                  <th className="w-1/4 text-slate-900 bg-orange-50/50">
                    <div className="font-bold">REGIONAL PARTNER</div>
                    <div className="text-[10px] text-slate-500 font-normal">Master Territory Distributor</div>
                  </th>
                  <th className="w-1/4 text-slate-900 bg-blue-50/50">
                    <div className="font-bold">CHANNEL PARTNER</div>
                    <div className="text-[10px] text-slate-500 font-normal">Authorized City Dealer</div>
                  </th>
                  <th className="w-1/4 text-slate-900 bg-emerald-50/50">
                    <div className="font-bold">REFERRAL PARTNER</div>
                    <div className="text-[10px] text-slate-500 font-normal">Registered Affiliate</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="font-bold text-slate-800">Transfer Price Slab</td>
                  <td className="bg-orange-50/20 font-semibold text-[#FF6600]">
                    Tier-1 Regional Transfer Price (Lowest)
                  </td>
                  <td className="bg-blue-50/20 font-semibold text-blue-700">
                    Tier-2 Channel Transfer Price (Standard)
                  </td>
                  <td className="bg-emerald-50/20 font-semibold text-emerald-700">
                    Website / Retail (Finder&apos;s Fee Split)
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Commercial Margin / Payout</td>
                  <td className="bg-orange-50/20 font-bold text-slate-900">
                    Highest Margin + Volume Rebates
                  </td>
                  <td className="bg-blue-50/20 font-bold text-slate-900">
                    10% Standard Commission
                  </td>
                  <td className="bg-emerald-50/20 font-bold text-slate-900">
                    5% - 8% Referral Fee on Realized Funds
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Territory Exclusivity</td>
                  <td className="bg-orange-50/20">Exclusive Multi-District / State Rights</td>
                  <td className="bg-blue-50/20">Assigned Pincodes (Non-Poaching Lead Lock)</td>
                  <td className="bg-emerald-50/20">Open Pan-India (Deal-Specific Lock)</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Annual Sales Commitment</td>
                  <td className="bg-orange-50/20 font-bold text-slate-900">₹2.00 Crore</td>
                  <td className="bg-blue-50/20 font-bold text-slate-900">₹75.00 Lakhs</td>
                  <td className="bg-emerald-50/20 text-slate-500">Nil (Zero Quota)</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Service &amp; Installation SLA</td>
                  <td className="bg-orange-50/20">
                    24h On-Site SLA (Local Certified Engineers)
                  </td>
                  <td className="bg-blue-50/20">
                    48h SLA Coordinated with Head Office
                  </td>
                  <td className="bg-emerald-50/20">
                    100% Handled Directly by Head Office
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Lead Lock Protection Period</td>
                  <td className="bg-orange-50/20 font-semibold text-emerald-700">
                    60 Days Protected + Inbound HO Routing
                  </td>
                  <td className="bg-blue-50/20 font-semibold text-emerald-700">
                    60 Days Protected
                  </td>
                  <td className="bg-emerald-50/20 font-semibold text-emerald-700">
                    45 Days Protected
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Warranty &amp; AMC Revenue Share</td>
                  <td className="bg-orange-50/20 font-bold text-slate-900">
                    15% Recurring AMC Share
                  </td>
                  <td className="bg-blue-50/20 font-bold text-slate-900">
                    10% AMC Renewal Referral Bonus
                  </td>
                  <td className="bg-emerald-50/20 text-slate-400">Not Applicable</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Stock &amp; Demo Machine Requirement</td>
                  <td className="bg-orange-50/20">Mandatory Live Tech Center / Demo VMC</td>
                  <td className="bg-blue-50/20">Optional (Supported via HO Tech Center)</td>
                  <td className="bg-emerald-50/20">Zero Stock / Zero Capital</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. SPECIFIC TIER TERMS & CLAUSES VIEW */}
      {/* =================================================================== */}
      {activeTab !== "matrix" && currentTierData && (
        <div className="space-y-6">
          {/* Summary Badges Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Partner Model &amp; Status
              </span>
              <div className="text-base font-extrabold text-[#293033] mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
                <span>{currentTierData.tierName}</span>
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {currentTierData.badge}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Commercial Pricing Slab
              </span>
              <div className="text-sm font-extrabold text-emerald-700 mt-1">
                {currentTierData.commissionRate}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block line-clamp-1">
                {currentTierData.marginSummary}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Territory Rights &amp; Scope
              </span>
              <div className="text-sm font-extrabold text-slate-900 mt-1">
                {currentTierData.territoryScope}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                Protected under CRM Lead Lock
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Annual Quota &amp; SLA
              </span>
              <div className="text-sm font-extrabold text-slate-900 mt-1">
                {currentTierData.targetSummary}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block line-clamp-1">
                {currentTierData.slaSummary}
              </span>
            </div>
          </div>

          {/* Clause Accordions Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
                  Official Agreement Clauses: {currentTierData.tierName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click on each clause to expand detailed operating terms and obligations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-xs text-[#FF6600] font-bold hover:underline"
                >
                  Expand All
                </button>
                <span className="text-slate-300">&bull;</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-xs text-slate-500 font-semibold hover:underline"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {currentTierData.clauses.map((clause, idx) => {
                const isOpen = !!expandedClauses[idx];
                return (
                  <div key={idx} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleClause(idx)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{clause.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {clause.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 bg-slate-50/50">
                        <div className="pl-9 space-y-2">
                          <p className="text-xs text-slate-600 font-medium italic mb-2">
                            {clause.description}
                          </p>
                          <ul className="space-y-2">
                            {clause.points.map((point, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. EDIT TIER TERMS MODAL (FOR HEAD OFFICE ADMIN) */}
      {/* =================================================================== */}
      {editTier && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Agreement Terms: ${editTier.tierName}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tier Badge / Subtitle</label>
                <input
                  type="text"
                  required
                  value={editTier.badge}
                  onChange={(e) => setEditTier({ ...editTier, badge: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commission / Pricing Rate</label>
                <input
                  type="text"
                  required
                  value={editTier.commissionRate}
                  onChange={(e) => setEditTier({ ...editTier, commissionRate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Margin Summary</label>
                <input
                  type="text"
                  required
                  value={editTier.marginSummary}
                  onChange={(e) => setEditTier({ ...editTier, marginSummary: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Target Summary</label>
                <input
                  type="text"
                  required
                  value={editTier.targetSummary}
                  onChange={(e) => setEditTier({ ...editTier, targetSummary: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Territory Scope</label>
                <input
                  type="text"
                  required
                  value={editTier.territoryScope}
                  onChange={(e) => setEditTier({ ...editTier, territoryScope: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service SLA Summary</label>
                <input
                  type="text"
                  required
                  value={editTier.slaSummary}
                  onChange={(e) => setEditTier({ ...editTier, slaSummary: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            {/* Clauses Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Editable Agreement Clauses &amp; Policy Points
              </h4>

              {editTier.clauses.map((clause, cIdx) => (
                <div key={cIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{clause.title}</span>
                  </div>

                  <input
                    type="text"
                    value={clause.description}
                    onChange={(e) => {
                      const newClauses = [...editTier.clauses];
                      newClauses[cIdx].description = e.target.value;
                      setEditTier({ ...editTier, clauses: newClauses });
                    }}
                    placeholder="Clause description..."
                    className="w-full p-2 rounded border border-slate-300 text-[11px] bg-white focus:outline-none focus:border-[#FF6600]"
                  />

                  <div className="space-y-1.5 pl-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Policy Points:</span>
                    {clause.points.map((pt, pIdx) => (
                      <textarea
                        key={pIdx}
                        rows={2}
                        value={pt}
                        onChange={(e) => handlePointChange(cIdx, pIdx, e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#FF6600]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] disabled:opacity-50 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                {savingEdit ? "Saving..." : "Save Agreement Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
