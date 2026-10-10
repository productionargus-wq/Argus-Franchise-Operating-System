"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Opportunity, Quotation, SalesOrder, UserSession } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  Mail,
  FileText,
  Clock,
  Paperclip,
  Check,
  ChevronRight,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  ShoppingCart,
  ShieldCheck,
  Award,
  AlertCircle,
  X,
  Tag,
  DollarSign,
  HelpCircle,
  UserCheck,
} from "lucide-react";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  // Active viewed stage tab
  const [viewStage, setViewStage] = useState<Opportunity["stage"]>("Demo");

  // Related data
  const [engineers, setEngineers] = useState<UserSession[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);

  // Demo form state
  const [demoProduct, setDemoProduct] = useState<string>("");
  const [demoDate, setDemoDate] = useState<string>("");
  const [demoEngineerId, setDemoEngineerId] = useState<string>("");
  const [demoEngineerName, setDemoEngineerName] = useState<string>("");
  const [demoResult, setDemoResult] = useState<string>("Positive");
  const [demoNotes, setDemoNotes] = useState<string>("");
  const [demoAttachments, setDemoAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState<string>("");
  const [savingDemo, setSavingDemo] = useState(false);
  const [showDemoSuccessModal, setShowDemoSuccessModal] = useState(false);

  // Qualified form state
  const [qualValue, setQualValue] = useState<number>(1850000);
  const [qualCloseDate, setQualCloseDate] = useState<string>("");
  const [qualNotes, setQualNotes] = useState<string>("");
  const [savingQual, setSavingQual] = useState(false);

  // Negotiation form state
  const [negNotes, setNegNotes] = useState<string>("");
  const [negTargetValue, setNegTargetValue] = useState<number>(0);
  const [savingNeg, setSavingNeg] = useState(false);

  // PO form state
  const [poNumber, setPoNumber] = useState<string>("");
  const [poDate, setPoDate] = useState<string>("");
  const [poValue, setPoValue] = useState<number>(0);
  const [poAdvancePercent, setPoAdvancePercent] = useState<number>(30);
  const [poNotes, setPoNotes] = useState<string>("");
  const [savingPo, setSavingPo] = useState(false);

  const stages: Opportunity["stage"][] = [
    "New",
    "Qualified",
    "Demo",
    "Quotation",
    "Negotiation",
    "PO Expected",
    "Won",
  ];

  const loadOpportunity = async () => {
    try {
      setLoading(true);
      const orgParam = currentUser?.orgId ? `?orgId=${encodeURIComponent(currentUser.orgId!)}` : "";
      const res = await fetch(`/api/opportunities/${params.id}${orgParam}`);
      if (res.ok) {
        const data: Opportunity = await res.json();
        setOpportunity(data);
        setViewStage(data.stage || "Qualified");

        // Init demo
        setDemoProduct(data.demo?.product || data.product || "");
        setDemoDate(data.demo?.conductedDate || data.demo?.scheduledDate || new Date().toISOString().split("T")[0]);
        setDemoEngineerId(data.demo?.assignedEngineerId || currentUser?.id || "");
        setDemoEngineerName(data.demo?.assignedEngineerName || currentUser?.name || "Field Applications Specialist");
        setDemoResult(data.demo?.result || "Positive");
        setDemoNotes(data.demo?.notes || "");
        setDemoAttachments(data.demo?.attachments || []);

        // Init qualified
        setQualValue(data.expectedValue || 1850000);
        setQualCloseDate(data.expectedCloseDate || "");
        setQualNotes(data.requirementsNotes || "");

        // Init negotiation
        setNegNotes(data.negotiationNotes || "");
        setNegTargetValue(data.expectedValue ? Math.round(data.expectedValue * 0.95) : 0);

        // Init PO
        setPoNumber(data.poNumber || `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
        setPoDate(data.poDate || new Date().toISOString().split("T")[0]);
        setPoValue(data.poValue || data.expectedValue || 1850000);
        setPoAdvancePercent(data.advancePercent || 30);
        setPoNotes(data.poNotes || "Signed PO received and commercial terms confirmed.");
      }
    } catch (e) {
      console.error("Failed to load opportunity:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunity();
  }, [params.id, currentUser]);

  // Load team members / engineers
  useEffect(() => {
    async function loadTeam() {
      if (!currentUser?.orgId) return;
      try {
        const res = await fetch(`/api/users?orgId=${encodeURIComponent(currentUser.orgId)}`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setEngineers(list);
          }
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    loadTeam();
  }, [currentUser]);

  // Load linked quotations and sales orders
  useEffect(() => {
    async function loadLinkedData() {
      if (!currentUser?.orgId || !opportunity) return;
      try {
        const qRes = await fetch(`/api/quotations?orgId=${encodeURIComponent(currentUser.orgId)}`);
        if (qRes.ok) {
          const allQuotes: Quotation[] = await qRes.json();
          if (Array.isArray(allQuotes)) {
            const linked = allQuotes.filter(
              (q) => q.opportunityId === opportunity.opportunityId || (q as any).oppId === opportunity.opportunityId
            );
            setQuotations(linked);
          }
        }

        const oRes = await fetch(`/api/orders?orgId=${encodeURIComponent(currentUser.orgId)}`);
        if (oRes.ok) {
          const allOrders: SalesOrder[] = await oRes.json();
          if (Array.isArray(allOrders)) {
            const linkedOrders = allOrders.filter(
              (o) =>
                o.customerId === opportunity.customerId ||
                (o as any).opportunityId === opportunity.opportunityId ||
                quotations.some((q) => q.quoteId === o.quoteId)
            );
            setSalesOrders(linkedOrders);
          }
        }
      } catch (err) {
        console.error("Failed to load linked data:", err);
      }
    }
    loadLinkedData();
  }, [currentUser, opportunity?.opportunityId]);

  const handleUpdateStage = async (newStage: Opportunity["stage"]) => {
    if (!opportunity) return;
    try {
      const res = await fetch(`/api/opportunities/${opportunity.opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpportunity(updated);
        setViewStage(newStage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveQualified = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!opportunity) return;
    try {
      setSavingQual(true);
      const res = await fetch(`/api/opportunities/${opportunity.opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentUser?.orgId,
          expectedValue: qualValue,
          expectedCloseDate: qualCloseDate,
          requirementsNotes: qualNotes,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpportunity(updated);
        alert("Qualification details saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingQual(false);
    }
  };

  const handleSaveDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    try {
      setSavingDemo(true);
      const res = await fetch(`/api/opportunities/${opportunity.opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentUser?.orgId,
          stage: "Demo",
          demo: {
            demoId: opportunity.demo?.demoId || `DEMO-${Date.now()}`,
            product: demoProduct || opportunity.product,
            conductedDate: demoDate,
            scheduledDate: demoDate,
            assignedEngineerId: demoEngineerId,
            assignedEngineerName: demoEngineerName,
            status: "Completed",
            result: demoResult,
            notes: demoNotes,
            attachments: demoAttachments,
          },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpportunity(updated);
        setShowDemoSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDemo(false);
    }
  };

  const handleSaveNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    try {
      setSavingNeg(true);
      const res = await fetch(`/api/opportunities/${opportunity.opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentUser?.orgId,
          negotiationNotes: negNotes,
          expectedValue: negTargetValue || opportunity.expectedValue,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpportunity(updated);
        alert("Negotiation notes and terms saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNeg(false);
    }
  };

  const handleSavePo = async (e: React.FormEvent, closeDeal = false) => {
    e.preventDefault();
    if (!opportunity) return;
    try {
      setSavingPo(true);
      const payload: any = {
        orgId: currentUser?.orgId,
        poNumber,
        poDate,
        poValue,
        advancePercent: poAdvancePercent,
        poNotes,
      };
      if (closeDeal) {
        payload.stage = "Won";
      }
      const res = await fetch(`/api/opportunities/${opportunity.opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpportunity(updated);
        if (closeDeal) {
          setViewStage("Won");
        } else {
          alert("Purchase Order details updated successfully!");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPo(false);
    }
  };

  const handleAddAttachment = () => {
    if (!newAttachment.trim()) return;
    setDemoAttachments([...demoAttachments, newAttachment.trim()]);
    setNewAttachment("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setDemoAttachments(demoAttachments.filter((_, i) => i !== idx));
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading opportunity details...</div>;
  }

  if (!opportunity) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm font-bold">Opportunity not found.</p>
        <Link href="/opportunities" className="text-xs text-[#FF6600] underline font-semibold">
          Return to Opportunities
        </Link>
      </div>
    );
  }

  const currentStageIndex = stages.indexOf(opportunity.stage);

  // Stage-Aware Next Step Text
  const getRecommendedNextStep = () => {
    switch (opportunity.stage) {
      case "New":
      case "Qualified":
        return "Verify machine technical requirements (spindle taper, stroke length), and schedule a technical cutting trial with application engineering.";
      case "Demo":
        return "Complete trial test cut report, review Ra surface finish parameters, and record customer verdict to trigger commercial quotation.";
      case "Quotation":
        return quotations.length > 0
          ? `Quotation ${quotations[0].quoteId} generated. Dispatch commercial quote to customer and confirm receipt to enter negotiation.`
          : "Generate commercial quotation matching customer tooling specs within standard 10% franchise price policy.";
      case "Negotiation":
        return "Review discount concessions and finalize payment milestone terms (30% Advance, 60% PI, 10% Commissioning) to secure Purchase Order.";
      case "PO Expected":
        return "Follow up on customer signed Purchase Order document and verify 30% advance payment receipt.";
      case "Won":
        return "Deal won! Track machine manufacturing allocation, factory dispatch logistics, and site foundation preparation.";
      default:
        return "Review opportunity details and advance lifecycle stage.";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/opportunities"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#293033] tracking-tight">
                Opportunity: {opportunity.opportunityId}
              </h1>
              <StatusBadge status={opportunity.stage} />
            </div>
            <p className="text-xs text-slate-500">{opportunity.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {opportunity.stage !== "Won" && (
            <button
              onClick={() => handleUpdateStage("Won")}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Deal Won</span>
            </button>
          )}

          <Link
            href={`/quotations/new?opId=${opportunity.opportunityId}&company=${encodeURIComponent(
              opportunity.companyName
            )}&customer=${encodeURIComponent(opportunity.customerName)}`}
            className="px-3.5 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Quotation</span>
          </Link>
        </div>
      </div>

      {/* Stage Progress Bar with Interactive Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Deal Lifecycle Stage — Click Any Stage to View &amp; Edit Workspace
          </div>
          <span className="text-[11px] font-bold text-[#FF6600]">
            Currently Viewing: {viewStage}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stg, idx) => {
            const isPassed = currentStageIndex >= idx;
            const isActualCurrent = opportunity.stage === stg;
            const isSelected = viewStage === stg;

            return (
              <button
                key={stg}
                type="button"
                onClick={() => setViewStage(stg)}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-[#FF6600] text-white border-[#FF6600] shadow-md ring-2 ring-[#FF6600]/30"
                    : isPassed
                    ? "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? "bg-white text-[#FF6600]"
                      : isPassed
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isPassed && !isSelected ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <div className="flex items-center gap-1">
                  <span>{stg}</span>
                  {isActualCurrent && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#FF6600]"}`} title="Active Stage in Database" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid: Customer Info (Left) | Stage-Specific Workspace (Center) | Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Information & Requirement Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#FF6600]" />
              <span>Customer Information</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Company Name</span>
                <span className="font-bold text-slate-900">{opportunity.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Person</span>
                <span className="font-semibold text-slate-800">{opportunity.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <a href={`tel:${opportunity.phone}`} className="font-medium text-blue-600 hover:underline">
                  {opportunity.phone}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <a href={`mailto:${opportunity.email}`} className="font-medium text-blue-600 hover:underline">
                  {opportunity.email}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Franchise Territory</span>
                <span className="font-semibold text-slate-800">{opportunity.franchiseName}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href={`/customers/${opportunity.customerId}`}
                className="text-xs font-bold text-[#FF6600] hover:underline flex items-center gap-1"
              >
                <span>View Customer 360° Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100">
              Machine Requirements & Scope
            </h3>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {opportunity.requirementsNotes || "No specific requirement notes recorded."}
            </p>
          </div>
        </div>

        {/* Center: DYNAMIC STAGE-SPECIFIC WORKSPACE */}
        <div>
          {/* ============================================================ */}
          {/* 1. NEW & QUALIFIED STAGE WORKSPACE */}
          {/* ============================================================ */}
          {(viewStage === "New" || viewStage === "Qualified") && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Opportunity Qualification & Scope</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {opportunity.stage === "New" || opportunity.stage === "Qualified" ? "Active" : "Completed"}
                </span>
              </div>

              <form onSubmit={handleSaveQualified} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target CNC Product</label>
                  <input
                    type="text"
                    disabled
                    value={opportunity.product}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estimated Deal Value (₹)</label>
                    <input
                      type="number"
                      value={qualValue}
                      onChange={(e) => setQualValue(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expected Close Date</label>
                    <input
                      type="date"
                      value={qualCloseDate}
                      onChange={(e) => setQualCloseDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technical Requirements & Scope Notes</label>
                  <textarea
                    rows={4}
                    value={qualNotes}
                    onChange={(e) => setQualNotes(e.target.value)}
                    placeholder="Component material, spindle RPM requirement, batch sizes..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                  <span className="font-bold block mb-1">Qualification Checklist Verified:</span>
                  ✓ Component drawing reviewed &bull; Spindle stroke feasibility confirmed &bull; Customer authority established.
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingQual}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors text-center"
                  >
                    {savingQual ? "Saving..." : "Save Scope Details"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStage("Demo")}
                    className="flex-1 py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Advance to Technical Demo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. DEMO STAGE WORKSPACE (FULLY EDITABLE & DYNAMIC) */}
          {/* ============================================================ */}
          {viewStage === "Demo" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Technical Demo Execution</span>
                </h3>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {opportunity.demo?.status || "Pending"}
                </span>
              </div>

              <form onSubmit={handleSaveDemo} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Demonstrated *</label>
                  <input
                    type="text"
                    required
                    value={demoProduct}
                    onChange={(e) => setDemoProduct(e.target.value)}
                    placeholder="e.g. MATT-1, ARGUS-VMC850"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Demo Date *</label>
                    <input
                      type="date"
                      required
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-semibold text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Application Engineer *</label>
                    <select
                      value={demoEngineerId}
                      onChange={(e) => {
                        setDemoEngineerId(e.target.value);
                        const eng = engineers.find((u) => u.id === e.target.value);
                        if (eng) setDemoEngineerName(eng.name);
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-semibold text-slate-900 bg-white"
                    >
                      <option value="">Select Application Engineer...</option>
                      {engineers.map((eng) => (
                        <option key={eng.id} value={eng.id}>
                          {eng.name} ({eng.role.replace(/_/g, " ")})
                        </option>
                      ))}
                      {engineers.length === 0 && (
                        <option value={currentUser?.id || "usr-eng"}>
                          {currentUser?.name || "Service Engineer"}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Demo Result / Customer Verdict *</label>
                  <select
                    value={demoResult}
                    onChange={(e) => setDemoResult(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-semibold text-slate-900 bg-white"
                  >
                    <option value="Positive">Positive (Surface finish & cycle time approved)</option>
                    <option value="Needs Follow-up">Needs Follow-up (Client testing sample part CMM)</option>
                    <option value="Machine Spec Change Required">Machine Spec Change (Upgrade to BT50 / 4th axis)</option>
                    <option value="Competitor Chosen">Competitor Chosen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trial Test Cut & Feedback Notes</label>
                  <textarea
                    rows={4}
                    value={demoNotes}
                    onChange={(e) => setDemoNotes(e.target.value)}
                    placeholder="Log material, cutting parameters, Ra surface finish values, tool wear, cycle time..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div>
                  <span className="block font-semibold text-slate-700 mb-1.5">Attachments & Test Reports</span>
                  {demoAttachments.length > 0 ? (
                    <div className="space-y-1.5">
                      {demoAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span>{att}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="Remove attachment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-[11px] bg-slate-50/50">
                      No test reports or documents attached yet. Add attachments below (e.g. part trial report, CMM sheet).
                    </div>
                  )}

                  <div className="mt-2 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add attachment filename (e.g. cmm_inspection_report.pdf)"
                      value={newAttachment}
                      onChange={(e) => setNewAttachment(e.target.value)}
                      className="flex-1 p-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#FF6600]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingDemo}
                  className="w-full py-2.5 bg-[#293033] hover:bg-[#FF6600] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingDemo ? "Saving..." : "Save Demo Result & Progress"}</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. QUOTATION STAGE WORKSPACE */}
          {/* ============================================================ */}
          {viewStage === "Quotation" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Commercial Quotations & Pricing</span>
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {quotations.length} Linked Quote(s)
                </span>
              </div>

              {quotations.length > 0 ? (
                <div className="space-y-3">
                  {quotations.map((q) => (
                    <div
                      key={q.quoteId}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-[#FF6600] transition-all bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{q.quoteId}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                            v{q.version}
                          </span>
                          <StatusBadge status={q.status} />
                        </div>
                        <span className="font-black text-emerald-700 text-sm">
                          ₹{q.grandTotal?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>Created: {(q as any).createdAt || "Active"}</div>
                        <div>Discount: {q.items?.[0]?.appliedDiscountPercent || (q.totalDiscount && q.subtotal ? Math.round((q.totalDiscount / q.subtotal) * 100) : 0)}%</div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                        <Link
                          href={`/quotations/${q.quoteId}`}
                          className="px-3 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>Open Quotation Workspace</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6600] flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">No Quotation Generated Yet</h4>
                    <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
                      Generate an official commercial quote with list pricing, configured discounts (≤10%), and delivery lead times.
                    </p>
                  </div>
                  <Link
                    href={`/quotations/new?opId=${opportunity.opportunityId}&company=${encodeURIComponent(
                      opportunity.companyName
                    )}&customer=${encodeURIComponent(opportunity.customerName)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Official Commercial Quotation</span>
                  </Link>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block">Pricing Guidelines:</span>
                <p>• Standard franchise discounts up to 10% are auto-authorized immediately.</p>
                <p>• Discounts exceeding 10% require Head Office Super Admin approval.</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleUpdateStage("Negotiation")}
                  className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Advance to Commercial Negotiation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. NEGOTIATION STAGE WORKSPACE */}
          {/* ============================================================ */}
          {viewStage === "Negotiation" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Commercial Negotiation &amp; Terms</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  In Discussion
                </span>
              </div>

              <form onSubmit={handleSaveNegotiation} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quoted Deal Value</label>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800">
                      ₹{opportunity.expectedValue?.toLocaleString("en-IN") || "18,50,000"}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Client Target Budget (₹)</label>
                    <input
                      type="number"
                      value={negTargetValue}
                      onChange={(e) => setNegTargetValue(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1">
                  <span className="font-bold block">Commercial Alignment Checklist:</span>
                  <p>✓ Payment Terms: 30% Advance with PO &bull; 60% Against PI before dispatch &bull; 10% on Commissioning.</p>
                  <p>✓ Delivery Commitment: Standard 4 to 6 weeks from PO &amp; advance clearance.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negotiation Notes &amp; Concessions</label>
                  <textarea
                    rows={4}
                    value={negNotes}
                    onChange={(e) => setNegNotes(e.target.value)}
                    placeholder="Log client counter-offers, payment term adjustments, tooling package inclusions..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingNeg}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors text-center"
                  >
                    {savingNeg ? "Saving..." : "Save Negotiation Notes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStage("PO Expected")}
                    className="flex-1 py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Advance to PO Expected</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. PO EXPECTED / PO ACCEPTED STAGE WORKSPACE */}
          {/* ============================================================ */}
          {viewStage === "PO Expected" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Customer Purchase Order (PO) Acceptance</span>
                </h3>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  PO Pending Receipt
                </span>
              </div>

              <form onSubmit={(e) => handleSavePo(e, false)} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer PO Number *</label>
                    <input
                      type="text"
                      required
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="e.g. PO-2026-9482"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-black text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PO Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={poDate}
                      onChange={(e) => setPoDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-semibold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirmed PO Value (₹)</label>
                    <input
                      type="number"
                      value={poValue}
                      onChange={(e) => setPoValue(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Agreed Advance %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={poAdvancePercent}
                      onChange={(e) => setPoAdvancePercent(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600] font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PO Details &amp; Reference Notes</label>
                  <textarea
                    rows={3}
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="Customer signed PO received via email; payment clearance terms..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingPo}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors text-center"
                  >
                    {savingPo ? "Saving..." : "Save PO Information"}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSavePo(e as any, true)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm PO &amp; Close as Won 🎉</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. WON STAGE WORKSPACE */}
          {/* ============================================================ */}
          {viewStage === "Won" && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Deal Won &amp; Sales Order Fulfillment</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Deal Closed Won 🎉
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-100">Confirmed Won Value</span>
                  <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
                    Product: {opportunity.product}
                  </span>
                </div>
                <div className="text-2xl font-black">
                  ₹{(opportunity.poValue || opportunity.expectedValue || 1850000).toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-emerald-100">
                  Customer PO {opportunity.poNumber || "Verified"} registered. Sales Order active in fulfillment pipeline.
                </p>
              </div>

              {/* Linked Sales Orders */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Fulfillment Sales Order:</span>
                {salesOrders.length > 0 ? (
                  salesOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{ord.orderId}</span>
                          <StatusBadge status={ord.orderStatus} />
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          PO: {ord.poNumber || "Recorded"} &bull; Total: ₹{ord.orderValue?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Link
                        href={`/orders`}
                        className="px-3 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <span>View Order</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                    <p className="text-orange-950 font-medium text-xs">
                      Quotation ready for Sales Order conversion!
                    </p>
                    {quotations.length > 0 ? (
                      <Link
                        href={`/quotations/${quotations[0].quoteId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Convert Quotation {quotations[0].quoteId} to Sales Order</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/quotations/new?opId=${opportunity.opportunityId}&company=${encodeURIComponent(
                          opportunity.companyName
                        )}&customer=${encodeURIComponent(opportunity.customerName)}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Generate Quotation to Convert</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Commission preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Franchise Partner Commercial Summary:</span>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Partner Territory:</span>
                  <span className="font-semibold text-slate-900">{opportunity.franchiseName}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Estimated Commission (4.5%):</span>
                  <span className="font-bold text-emerald-700">
                    ₹{Math.round(((opportunity.poValue || opportunity.expectedValue || 1850000) * 0.045)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Deal Timeline & Contextual Recommended Next Step */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Activity Timeline</span>
          </h3>

          <div className="space-y-3.5 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {opportunity.timeline && opportunity.timeline.length > 0 ? (
              opportunity.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-7 text-xs">
                  <div
                    className={`absolute left-1 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                      item.completed ? "border-emerald-600 bg-emerald-50" : "border-slate-300"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.stage}</span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  {item.note && <p className="text-slate-600 text-[11px] mt-0.5">{item.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs italic pl-7">No timeline events recorded.</p>
            )}
          </div>

          {/* DYNAMIC CONTEXTUAL RECOMMENDED NEXT STEP */}
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 mt-4 space-y-1">
            <span className="font-bold flex items-center gap-1 text-[#FF6600]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Recommended Next Step ({opportunity.stage} Stage):</span>
            </span>
            <p className="leading-relaxed text-[11px]">
              {getRecommendedNextStep()}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Save Demo Success Modal */}
      {showDemoSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Technical Demo Recorded Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Verdict: <span className="font-bold text-slate-800">{demoResult}</span> &bull; Engineer:{" "}
                <span className="font-semibold text-slate-800">{demoEngineerName}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <span className="font-bold text-slate-900 block">Recommended Next Step:</span>
              <p>
                The cutting trial has concluded. Generate and dispatch an official commercial quotation to present pricing and terms to <strong>{opportunity.companyName}</strong>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/quotations/new?opId=${opportunity.opportunityId}&company=${encodeURIComponent(
                  opportunity.companyName
                )}&customer=${encodeURIComponent(opportunity.customerName)}`}
                className="w-full py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Commercial Quotation Now →</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setShowDemoSuccessModal(false);
                  setViewStage("Quotation");
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Proceed to Quotation Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
