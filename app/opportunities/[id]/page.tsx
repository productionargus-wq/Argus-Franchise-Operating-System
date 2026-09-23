"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Opportunity } from "@/lib/types";
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
} from "lucide-react";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo form state
  const [demoResult, setDemoResult] = useState<string>("Positive");
  const [demoNotes, setDemoNotes] = useState<string>("");
  const [savingDemo, setSavingDemo] = useState(false);

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
        const data = await res.json();
        setOpportunity(data);
        if (data.demo) {
          setDemoResult(data.demo.result || "Positive");
          setDemoNotes(data.demo.notes || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunity();
  }, [params.id, currentUser]);

  const handleUpdateStage = async (newStage: Opportunity["stage"]) => {
    if (!opportunity) return;
    try {
      const res = await fetch(`/api/opportunities/${opportunity.opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        loadOpportunity();
      }
    } catch (err) {
      console.error(err);
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
            ...(opportunity.demo || {
              demoId: `DEMO-${Date.now()}`,
              assignedEngineerId: currentUser?.id || "usr-eng",
              assignedEngineerName: currentUser?.name || "Service Engineer",
              product: opportunity.product,
            }),
            status: "Completed",
            conductedDate: new Date().toISOString().split("T")[0],
            result: demoResult,
            notes: demoNotes,
          },
        }),
      });
      if (res.ok) {
        loadOpportunity();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDemo(false);
    }
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
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Won</span>
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

      {/* Stage Progress Bar (Matching Mockup Screen 4) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Deal Lifecycle Stage</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stg, idx) => {
            const isPassed = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <button
                key={stg}
                onClick={() => handleUpdateStage(stg)}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all flex flex-col items-center gap-1 ${
                  isCurrent
                    ? "bg-[#FF6600] text-white border-[#FF6600] shadow-xs"
                    : isPassed
                    ? "bg-slate-100 text-slate-800 border-slate-300"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? "bg-white text-[#FF6600]" : isPassed ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isPassed && !isCurrent ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span>{stg}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid: Customer Info & Demo Details */}
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

        {/* Center: Technical Demo Execution */}
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
              <label className="block font-semibold text-slate-700 mb-1">Product Demonstrated</label>
              <input
                type="text"
                disabled
                value={opportunity.product}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Demo Date</label>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opportunity.demo?.conductedDate || "Scheduled"}</span>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Application Engineer</label>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                  {opportunity.demo?.assignedEngineerName || "Ramesh Kumar"}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Demo Result / Customer Verdict</label>
              <select
                value={demoResult}
                onChange={(e) => setDemoResult(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
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
                placeholder="Log material, cutting parameters, Ra surface finish values, tool wear..."
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              ></textarea>
            </div>

            <div>
              <span className="block font-semibold text-slate-700 mb-1.5">Attachments</span>
              <div className="space-y-1.5">
                {(opportunity.demo?.attachments || ["part_trial_report.pdf", "cycle_time_sheet.xlsx"]).map((att) => (
                  <div
                    key={att}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>{att}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingDemo}
              className="w-full py-2.5 bg-[#293033] hover:bg-[#FF6600] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{savingDemo ? "Saving..." : "Save Demo Result & Progress"}</span>
            </button>
          </form>
        </div>

        {/* Right: Deal Timeline & Activity History */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Activity Timeline</span>
          </h3>

          <div className="space-y-3.5 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {opportunity.timeline.map((item, idx) => (
              <div key={idx} className="relative pl-7 text-xs">
                <div
                  className={`absolute left-1 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    item.completed ? "border-emerald-600 bg-emerald-50" : "border-slate-300"
                  }`}
                ></div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.stage}</span>
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                </div>
                {item.note && <p className="text-slate-600 text-[11px] mt-0.5">{item.note}</p>}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-900 mt-4">
            <span className="font-bold block mb-1">Recommended Next Step:</span>
            Generate and dispatch commercial quotation QT-9203 with standard 8% discount to meet monthly PO targets.
          </div>
        </div>
      </div>
    </div>
  );
}
