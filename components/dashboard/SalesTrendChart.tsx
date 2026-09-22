import React from "react";

interface SalesMonth {
  month: string;
  hardware: number; // in Lakhs
  software: number;
  spares: number;
}

interface SalesTrendChartProps {
  data?: SalesMonth[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const defaultData: SalesMonth[] = [
    { month: "Aug", hardware: 14.5, software: 1.8, spares: 1.2 },
    { month: "Sep", hardware: 16.2, software: 2.1, spares: 1.4 },
    { month: "Oct", hardware: 18.0, software: 2.5, spares: 1.8 },
    { month: "Nov", hardware: 21.4, software: 3.0, spares: 2.2 },
    { month: "Dec", hardware: 24.8, software: 3.5, spares: 2.8 },
  ];

  const chartData = data || defaultData;
  const maxVal = 32; // max height scale in Lakhs

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
        <div>
          <h3 className="font-semibold text-sm text-[#293033] tracking-tight">Monthly Sales Trend</h3>
          <p className="text-xs text-slate-400">Revenue split across products (₹ Lakhs)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#FF6600]"></span>
            <span className="text-slate-600">Hardware</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#293033]"></span>
            <span className="text-slate-600">Software</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]"></span>
            <span className="text-slate-600">Spares</span>
          </div>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-200">
        {chartData.map((d) => {
          const hwHeight = (d.hardware / maxVal) * 100;
          const swHeight = (d.software / maxVal) * 100;
          const spHeight = (d.spares / maxVal) * 100;

          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                {/* Hardware Bar */}
                <div
                  className="w-1/3 bg-[#FF6600] hover:bg-[#E65C00] rounded-t-xs transition-all duration-300 relative"
                  style={{ height: `${hwHeight}%` }}
                  title={`Hardware: ₹${d.hardware}L`}
                ></div>
                {/* Software Bar */}
                <div
                  className="w-1/3 bg-[#293033] hover:bg-[#3A4448] rounded-t-xs transition-all duration-300 relative"
                  style={{ height: `${swHeight}%` }}
                  title={`Software: ₹${d.software}L`}
                ></div>
                {/* Spares Bar */}
                <div
                  className="w-1/3 bg-[#10B981] hover:bg-emerald-600 rounded-t-xs transition-all duration-300 relative"
                  style={{ height: `${spHeight}%` }}
                  title={`Spares: ₹${d.spares}L`}
                ></div>
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-2">{d.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>YTD Sales: <strong className="text-slate-800">₹1.14 Cr</strong></span>
        <span className="text-emerald-600 font-semibold">+28% vs last year</span>
      </div>
    </div>
  );
}
