import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export type KpiColorScheme =
  | "blue"
  | "sky"
  | "emerald"
  | "purple"
  | "indigo"
  | "teal"
  | "rose"
  | "amber";

const COLOR_MAP: Record<
  KpiColorScheme,
  { container: string; icon: string }
> = {
  blue: {
    container: "bg-blue-50 border-blue-100 text-blue-600",
    icon: "text-blue-600",
  },
  sky: {
    container: "bg-sky-50 border-sky-100 text-sky-600",
    icon: "text-sky-600",
  },
  emerald: {
    container: "bg-emerald-50 border-emerald-100 text-emerald-600",
    icon: "text-emerald-600",
  },
  purple: {
    container: "bg-purple-50 border-purple-100 text-purple-600",
    icon: "text-purple-600",
  },
  indigo: {
    container: "bg-indigo-50 border-indigo-100 text-indigo-600",
    icon: "text-indigo-600",
  },
  teal: {
    container: "bg-teal-50 border-teal-100 text-teal-600",
    icon: "text-teal-600",
  },
  rose: {
    container: "bg-rose-50 border-rose-100 text-rose-600",
    icon: "text-rose-600",
  },
  amber: {
    container: "bg-amber-50 border-amber-100 text-amber-600",
    icon: "text-amber-600",
  },
};

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isPositiveTrend?: boolean;
  subtitle?: string;
  highlight?: boolean;
  colorScheme?: KpiColorScheme;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  isPositiveTrend = true,
  subtitle,
  highlight = false,
  colorScheme,
}: KpiCardProps) {
  // If colorScheme is provided (e.g. on Head Office Dashboard), use the reference mockup layout
  if (colorScheme) {
    const scheme = COLOR_MAP[colorScheme] || COLOR_MAP.blue;
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${scheme.container}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-2xl font-black text-[#293033] tracking-tight leading-none">
            {value}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
            {title}
          </div>
          {trend && (
            <div
              className={`text-xs font-bold mt-1 flex items-center gap-0.5 ${
                isPositiveTrend ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-3 h-3 stroke-[2.5]" />
              )}
              <span>{trend}</span>
            </div>
          )}
          {!trend && subtitle && (
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback / default layout for existing dashboards
  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between ${
        highlight ? "border-orange-300 bg-orange-50/20" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`p-2 rounded-lg ${
            highlight ? "bg-[#FF6600] text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <div className="text-2xl font-black tracking-tight text-[#293033]">
          {value}
        </div>
        {trend && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositiveTrend
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-700 bg-red-50"
            }`}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
