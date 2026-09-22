import React from "react";
import Link from "next/link";
import { PlusCircle, FileText, Target, LifeBuoy } from "lucide-react";

interface QuickActionsProps {
  onOpenNewLead?: () => void;
}

export function QuickActions({ onOpenNewLead }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="pb-3 border-b border-slate-100 mb-4">
        <h3 className="font-semibold text-sm text-[#293033] tracking-tight">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-2 p-3 rounded-lg bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 text-xs font-semibold text-[#FF6600] transition-colors text-left"
        >
          <PlusCircle className="w-4 h-4 text-[#FF6600] shrink-0" />
          <span>New Lead</span>
        </button>

        <Link
          href="/quotations"
          className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <span>New Quote</span>
        </Link>

        <Link
          href="/opportunities"
          className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <Target className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Schedule Demo</span>
        </Link>

        <Link
          href="/support"
          className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <LifeBuoy className="w-4 h-4 text-red-600 shrink-0" />
          <span>Service Ticket</span>
        </Link>
      </div>
    </div>
  );
}
