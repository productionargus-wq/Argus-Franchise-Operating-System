import React from "react";

interface FunnelStage {
  stage: string;
  count: number;
  fill: string;
}

interface SalesFunnelProps {
  stages?: FunnelStage[];
}

export function SalesFunnel({ stages }: SalesFunnelProps) {
  const defaultStages: FunnelStage[] = [
    { stage: "Leads", count: 38, fill: "#FF6600" },
    { stage: "Qualified", count: 24, fill: "#FF8533" },
    { stage: "Demos", count: 12, fill: "#FFA366" },
    { stage: "Quotation", count: 8, fill: "#293033" },
    { stage: "PO Received", count: 4, fill: "#10B981" },
  ];

  const data = stages || defaultStages;
  const maxCount = Math.max(...data.map((s) => s.count), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 className="font-semibold text-sm text-[#293033] tracking-tight">Sales Pipeline Funnel</h3>
        <span className="text-xs text-slate-400 font-medium">Conversion Flow</span>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const widthPercent = Math.max(25, (item.count / maxCount) * 100);
          return (
            <div key={item.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">{item.stage}</span>
                <span className="text-slate-900 font-bold">{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex items-center">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.fill,
                  }}
                >
                  <span className="text-[10px] text-white font-bold">{Math.round((item.count / (data[0].count || 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Total Pipeline Velocity: <strong className="text-slate-700">18.4 Days</strong></span>
        <span className="text-[#FF6600] font-semibold">10.5% Win Rate</span>
      </div>
    </div>
  );
}
