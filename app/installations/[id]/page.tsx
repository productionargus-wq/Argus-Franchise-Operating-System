"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Installation } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { SignaturePad } from "@/components/ui/SignaturePad";
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck,
  Camera,
  Users,
  ShieldCheck,
  Printer,
} from "lucide-react";

export default function InstallationDetailPage() {
  const params = useParams();
  const { currentUser } = useAuth();
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sign-off form
  const [signeeName, setSigneeName] = useState("");
  const [signeeDesignation, setSigneeDesignation] = useState("Works Manager");
  const [signatureData, setSignatureData] = useState("");

  const loadInstallation = async () => {
    try {
      setLoading(true);
      const orgParam = currentUser?.orgId ? `?orgId=${encodeURIComponent(currentUser.orgId!)}` : "";
      const res = await fetch(`/api/installations/${params.id}${orgParam}`);
      if (res.ok) {
        const data = await res.json();
        setInstallation(data);
        if (data.customerSignOffData) {
          setSigneeName(data.customerSignOffData.signeeName || "");
          setSigneeDesignation(data.customerSignOffData.signeeDesignation || "");
          setSignatureData(data.customerSignOffData.signatureImage || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstallation();
  }, [params.id, currentUser]);

  const handleChecklistToggle = async (key: keyof Installation["checklist"]) => {
    if (!installation) return;
    const updatedChecklist = {
      ...installation.checklist,
      [key]: !installation.checklist[key],
    };

    try {
      setSaving(true);
      const res = await fetch(`/api/installations/${installation.installationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: updatedChecklist, orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        loadInstallation();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installation || !signatureData) {
      alert("Please provide the customer digital signature before submitting sign-off!");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/installations/${installation.installationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentUser?.orgId,
          status: "Completed",
          completedDate: new Date().toISOString().split("T")[0],
          checklist: {
            ...installation.checklist,
            customerSignOff: true,
            trainingCompleted: true,
            machineInstalled: true,
          },
          customerSignOffData: {
            signeeName,
            signeeDesignation,
            signatureImage: signatureData,
            signedAt: new Date().toLocaleString("en-GB"),
          },
        }),
      });
      if (res.ok) {
        loadInstallation();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading installation details...</div>;
  }

  if (!installation) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm font-bold">Installation record not found.</p>
        <Link href="/installations" className="text-xs text-[#FF6600] underline font-semibold">
          Return to Installations
        </Link>
      </div>
    );
  }

  const checklistItems = [
    {
      key: "materialDelivered" as const,
      label: "Material Delivered & Physical Inspection",
      desc: "Machine crate, control cabinet, tooling accessories and spares inspected on site.",
    },
    {
      key: "preInstallCheck" as const,
      label: "Pre-installation Site, Foundation & Power Check",
      desc: "415V ±10% 3-phase stabilized supply, neutral-earth voltage < 2V, compressed air 6 bar verified.",
    },
    {
      key: "machineInstalled" as const,
      label: "Machine Leveling, Tooling & Axis Calibration",
      desc: "Precision spirit level test (<0.02mm/m), BT40 spindle runout (<0.003mm), backlash test passed.",
    },
    {
      key: "trainingCompleted" as const,
      label: "Operator & Programming Training Conducted",
      desc: "G-code fundamentals, tool offset setting, safety interlocks, preventive maintenance trained.",
    },
    {
      key: "customerSignOff" as const,
      label: "Customer Digital Acceptance Sign-off",
      desc: "Final trial workpiece machined within tolerance; signed by customer designated authority.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/installations"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#293033] tracking-tight">
                Installation & Commissioning: {installation.installationId}
              </h1>
              <StatusBadge status={installation.status} />
            </div>
            <p className="text-xs text-slate-500">
              {installation.companyName} | Serial: {installation.machineSerial}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Commissioning Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Machine Serial</span>
          <span className="text-sm font-black text-[#FF6600] mt-0.5 block">{installation.machineSerial}</span>
          <span className="text-xs text-slate-500 mt-1 block">{installation.productName}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Engineer</span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">{installation.assignedEngineerName}</span>
          <span className="text-xs text-slate-500 mt-1 block">Certified Field Specialist</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Date</span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">{installation.scheduledDate}</span>
          <span className="text-xs text-slate-500 mt-1 block">
            Completed: {installation.completedDate || "In Progress"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Sign-off Status</span>
          <span className="text-sm font-black text-emerald-800 mt-0.5 block">
            {installation.checklist.customerSignOff ? "Officially Accepted" : "Pending Sign-off"}
          </span>
          <span className="text-xs text-emerald-600 mt-1 block">Warranty Active from Sign-off</span>
        </div>
      </div>

      {/* Main Grid: 5-Step Checklist & Customer Digital Signature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 5-Step Digital Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[#FF6600]" />
              <span>5-Step Commissioning Checklist</span>
            </h3>
            <span className="text-xs text-slate-400">Click to toggle state</span>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item, idx) => {
              const isDone = installation.checklist[item.key];

              return (
                <div
                  key={item.key}
                  onClick={() => handleChecklistToggle(item.key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isDone
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isDone ? "bg-emerald-600 text-white" : "border-2 border-slate-300 bg-white"
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isDone ? "text-emerald-900" : "text-slate-800"}`}>
                        Step {idx + 1}: {item.label}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Passed
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Operator Training Information */}
          <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">Operator Training Log:</span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Operators Trained:</span>
                <span className="font-semibold text-slate-800">
                  {installation.trainingDetails?.operatorsTrained?.join(", ") || "P. Murugesan, K. Loganathan"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modules Completed:</span>
                <span className="font-semibold text-slate-800">G-code, Work Coordinate Setting, Safety E-Stop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital Sign-off Canvas Pad (Section 3.7 & Mockup Screen 7) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Customer Digital Acceptance & Sign-off</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Digitally capture authorized customer signature for warranty activation and final commercial release.
            </p>
          </div>

          {installation.customerSignOffData?.signatureImage ? (
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800">Sign-off Verification Certificate</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                  Verified Digital Signature
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={installation.customerSignOffData.signatureImage}
                  alt="Customer Signature"
                  className="max-h-24 mx-auto object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-200">
                <div>
                  <span className="text-slate-400 block">Signee Name:</span>
                  <span className="font-bold text-slate-900">
                    {installation.customerSignOffData.signeeName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Designation:</span>
                  <span className="font-bold text-slate-900">
                    {installation.customerSignOffData.signeeDesignation}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Timestamp:</span>
                  <span className="font-semibold text-slate-700">
                    {installation.customerSignOffData.signedAt}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCompleteSignOff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. M. Karthik"
                    value={signeeName}
                    onChange={(e) => setSigneeName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Managing Director"
                    value={signeeDesignation}
                    onChange={(e) => setSigneeDesignation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Digital Signature (Touch / Stylus / Mouse) *
                </label>
                <SignaturePad onSave={(dataUrl) => setSignatureData(dataUrl)} />
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-[11px] text-orange-900">
                By signing, the customer confirms that the machine has been unpacked, leveled, tested on sample parts, and operators have completed safety and programming training.
              </div>

              <button
                type="submit"
                disabled={saving || !signatureData}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? "Submitting..." : "Submit Customer Digital Sign-off"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
