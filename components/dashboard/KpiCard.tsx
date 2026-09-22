import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isPositiveTrend?: boolean;
  subtitle?: string;
  highlight?: boolean;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  isPositiveTrend = true,
  subtitle,
  highlight = false,
}: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between ${
        highlight ? "border-orange-300 bg-orange-50/20" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${highlight ? "bg-[#FF6600] text-white" : "bg-slate-100 text-slate-700"}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <div className="text-2xl font-black tracking-tight text-[#293033]">{value}</div>
        {trend && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositiveTrend ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
            }`}
          >
            {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
