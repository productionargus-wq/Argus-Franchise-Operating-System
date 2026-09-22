"use client";

import React, { useState } from "react";

export interface MonthlySalesData {
  month: string;
  hardware: number; // in Lakhs
  software: number; // in Lakhs
}

interface SalesTrendChartProps {
  data?: MonthlySalesData[];
}

const DEFAULT_SALES_TREND: MonthlySalesData[] = [
  { month: "Jul", hardware: 5.2, software: 3.0 },
  { month: "Aug", hardware: 4.2, software: 4.0 },
  { month: "Sep", hardware: 3.8, software: 3.9 },
  { month: "Oct", hardware: 8.2, software: 5.1 },
  { month: "Nov", hardware: 10.0, software: 6.8 },
  { month: "Dec", hardware: 8.5, software: 6.5 },
];

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = data && data.length > 0 ? data : DEFAULT_SALES_TREND;

  // Chart Geometry
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

  const barWidth = 32;
  const barSpacing = innerWidth / chartData.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-base text-[#293033] tracking-tight">
          Monthly Sales Trend
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#2563EB]" />
            <span className="text-slate-600">Hardware</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#10B981]" />
            <span className="text-slate-600">Software</span>
          </div>
        </div>
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

          {/* Stacked Bars & X-Axis Labels */}
          {chartData.map((item, index) => {
            const x =
              paddingLeft + index * barSpacing + (barSpacing - barWidth) / 2;

            const hwHeight = (item.hardware / maxScale) * innerHeight;
            const swHeight = (item.software / maxScale) * innerHeight;
            const totalHeight = hwHeight + swHeight;

            const hwY = paddingTop + innerHeight - hwHeight;
            const swY = hwY - swHeight;
            const totalY = paddingTop + innerHeight - totalHeight;

            const isHovered = hoveredIndex === index;
            const total = (item.hardware + item.software).toFixed(1);

            return (
              <g
                key={item.month}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hardware Segment (Bottom - Blue) */}
                <rect
                  x={x}
                  y={hwY}
                  width={barWidth}
                  height={hwHeight}
                  rx={swHeight > 0 ? 0 : 4}
                  ry={swHeight > 0 ? 0 : 4}
                  fill="#2563EB"
                  className={`transition-all duration-200 ${
                    isHovered ? "brightness-110" : ""
                  }`}
                />

                {/* Software Segment (Top - Green) */}
                {swHeight > 0 && (
                  <rect
                    x={x}
                    y={swY}
                    width={barWidth}
                    height={swHeight}
                    rx={4}
                    ry={4}
                    fill="#10B981"
                    className={`transition-all duration-200 ${
                      isHovered ? "brightness-110" : ""
                    }`}
                  />
                )}

                {/* Hover Tooltip Popup */}
                {isHovered && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 45}
                      y={Math.max(4, totalY - 38)}
                      width={90}
                      height={32}
                      rx={6}
                      className="fill-[#1E293B] filter drop-shadow-md"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(4, totalY - 38) + 14}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white"
                    >
                      {item.month}: ₹{total}L
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(4, totalY - 38) + 26}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-300"
                    >
                      H: ₹{item.hardware}L | S: ₹{item.software}L
                    </text>
                  </g>
                )}

                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - paddingBottom + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? "fill-blue-600 font-bold" : "fill-slate-600"
                  }`}
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
