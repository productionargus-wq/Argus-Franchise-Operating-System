import React from "react";
import { Clock, CheckCircle2, AlertCircle, FileText, Wrench } from "lucide-react";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "lead",
      title: "New Lead Added",
      desc: "Sri Venkatesh Industries (Auto Components)",
      time: "25 mins ago",
      icon: CheckCircle2,
      color: "text-[#FF6600]",
    },
    {
      id: 2,
      type: "quote",
      title: "Quotation Generated",
      desc: "QT-9203 (₹23.77 L) for VMC-700 & 4th Axis",
      time: "1 hour ago",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "order",
      title: "PO Received & Confirmed",
      desc: "Precision Aero Components (PO-884, ₹21.5 L)",
      time: "3 hours ago",
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      id: 4,
      type: "install",
      title: "Installation Checklist Updated",
      desc: "INS-1023 Machine Leveling completed by Ramesh Kumar",
      time: "5 hours ago",
      icon: Wrench,
      color: "text-purple-600",
    },
    {
      id: 5,
      type: "support",
      title: "Support Ticket SLA Active",
      desc: "TK-1056 Spindle E-04 alarm on-site inspection",
      time: "Yesterday",
      icon: AlertCircle,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="font-semibold text-sm text-[#293033] tracking-tight">Recent Activities</h3>
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Live
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="py-2.5 flex items-start gap-3 text-xs">
              <div className={`mt-0.5 ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-slate-800 truncate">{act.title}</span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
                <p className="text-slate-600 truncate mt-0.5">{act.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
