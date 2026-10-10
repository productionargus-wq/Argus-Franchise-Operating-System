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

export function FranchiseSalesBarChart({
  data,
}: FranchiseSalesBarChartProps) {
  const { currentUser } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = Array.isArray(data) ? data : [];

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
        <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
          <span>No franchise territories registered yet</span>
        </div>
      </div>
    );
  }

  // SVG Chart Geometry
  const chartWidth = 560;
  const chartHeight = 270;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 32;
  const paddingBottom = 48;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate dynamic max scale and ticks based on actual data
  const maxVal = Math.max(...chartData.map((d) => Number(d.salesLakhs) || 0), 0);
  let maxScale = 5;
  let yTicks: number[] = [5, 4, 3, 2, 1, 0];

  if (maxVal <= 1) {
    maxScale = 1.5;
    yTicks = [1.5, 1.0, 0.5, 0];
  } else if (maxVal <= 2.5) {
    maxScale = 3;
    yTicks = [3, 2, 1, 0];
  } else if (maxVal <= 5) {
    maxScale = 5;
    yTicks = [5, 4, 3, 2, 1, 0];
  } else if (maxVal <= 10) {
    maxScale = 10;
    yTicks = [10, 8, 6, 4, 2, 0];
  } else if (maxVal <= 20) {
    maxScale = 20;
    yTicks = [20, 15, 10, 5, 0];
  } else {
    maxScale = Math.ceil(maxVal / 10) * 10;
    const step = maxScale / 4;
    yTicks = [maxScale, maxScale - step, maxScale - 2 * step, step, 0];
  }

  // Responsive bar width and spacing
  const barSpacing = innerWidth / chartData.length;
  const barWidth = Math.min(56, Math.max(28, barSpacing * 0.45));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-[#293033] tracking-tight">
            Franchise-wise Sales
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time closed revenue per territory
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
          Max: ₹{maxVal.toFixed(1)} L
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

          {/* Bars & Labels */}
          {chartData.map((item, index) => {
            const val = Number(item.salesLakhs) || 0;
            const barHeight = val > 0
              ? Math.max(14, (val / maxScale) * innerHeight)
              : 3; // 3px subtle baseline for 0

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
                    val === 0
                      ? "fill-slate-200"
                      : isHovered
                      ? "fill-[#1D4ED8] filter drop-shadow-md"
                      : "fill-[#2563EB]"
                  }`}
                />

                {/* Visible Sales Value on Top of Bar */}
                <text
                  x={x + barWidth / 2}
                  y={val > 0 ? y - 8 : y - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${
                    val > 0 ? (isHovered ? "fill-blue-700 font-extrabold" : "fill-slate-800") : "fill-slate-400"
                  }`}
                >
                  ₹{val.toFixed(1)} L
                </text>

                {/* X-axis territory name */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - paddingBottom + 22}
                  textAnchor="middle"
                  className={`text-xs font-semibold transition-colors ${
                    isHovered ? "fill-blue-700 font-bold" : "fill-slate-700"
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
