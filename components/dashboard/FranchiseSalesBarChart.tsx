"use client";
import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export interface FranchiseSalesData {
  name: string;
  salesLakhs: number;
}

interface FranchiseSalesBarChartProps {
  data?: FranchiseSalesData[];
}

const DEFAULT_SALES_DATA: FranchiseSalesData[] = [
  { name: "Coimbatore", salesLakhs: 14.2 },
  { name: "Chennai", salesLakhs: 17.8 },
  { name: "Hosur", salesLakhs: 9.6 },
  { name: "Bengaluru", salesLakhs: 11.4 },
  { name: "Pune", salesLakhs: 7.2 },
  { name: "Others", salesLakhs: 10.5 },
];

export function FranchiseSalesBarChart({
  data,
}: FranchiseSalesBarChartProps) {
  const { currentUser } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isTemplate = currentUser?.orgId === "ORG-TEMP";
  const chartData = (data && data.length > 0) ? data : (isTemplate ? DEFAULT_SALES_DATA : []);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-[#293033] tracking-tight">
            Franchise-wise Sales
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Monthly Revenue Delivered
          </span>
        </div>
        <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
          No franchise sales recorded yet
        </div>
      </div>
    );
  }

  // SVG Chart Geometry
  const chartWidth = 560;
  const chartHeight = 260;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxScale = 20;
  const yTicks = [20, 15, 10, 5, 0];

  const barWidth = 36;
  const barSpacing = innerWidth / chartData.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-[#293033] tracking-tight">
          Franchise-wise Sales
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          Monthly Revenue Delivered
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto select-none"
        >
          {/* Y-Axis Label: ₹ Lakh */}
          <text
            x={16}
            y={chartHeight / 2 - 10}
            transform={`rotate(-90, 16, ${chartHeight / 2 - 10})`}
            textAnchor="middle"
            className="text-[11px] font-semibold fill-slate-500"
          >
            ₹ Lakh
          </text>

          {/* Grid lines and Y-axis tick values */}
          {yTicks.map((tick) => {
            const y = paddingTop + innerHeight - (tick / maxScale) * innerHeight;
            return (
              <g key={tick}>
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-medium fill-slate-400"
                >
                  {tick}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={tick === 0 ? "#CBD5E1" : "#F1F5F9"}
                  strokeWidth={tick === 0 ? "1.5" : "1"}
                  strokeDasharray={tick === 0 ? undefined : "3 3"}
                />
              </g>
            );
          })}

          {/* Bars & X-Axis Labels */}
          {chartData.map((item, index) => {
            const barHeight = Math.max(
              4,
              (Number(item.salesLakhs) / maxScale) * innerHeight
            );
            const x =
              paddingLeft +
              index * barSpacing +
              (barSpacing - barWidth) / 2;
            const y = paddingTop + innerHeight - barHeight;
            const isHovered = hoveredIndex === index;

            return (
              <g
                key={item.name}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  ry={4}
                  className={`transition-all duration-200 ${
                    isHovered
                      ? "fill-[#1D4ED8] filter drop-shadow-md"
                      : "fill-[#2563EB]"
                  }`}
                />

                {/* Optional Value Label on Hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 32}
                      y={y - 28}
                      width={64}
                      height={22}
                      rx={4}
                      className="fill-[#1E293B]"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 14}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white"
                    >
                      ₹{item.salesLakhs} L
                    </text>
                  </g>
                )}

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - paddingBottom + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? "fill-blue-600 font-bold" : "fill-slate-600"
                  }`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
