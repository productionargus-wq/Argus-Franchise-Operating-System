"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export interface CategoryData {
  category: string;
  percent: number;
  color: string;
}

interface ProductCategoryDonutChartProps {
  data?: CategoryData[];
}

const DEFAULT_CATEGORY_DATA: CategoryData[] = [
  { category: "CNC Accessories", percent: 45, color: "#2563EB" },
  { category: "Software", percent: 35, color: "#06B6D4" },
  { category: "Installation & Service", percent: 12, color: "#F59E0B" },
  { category: "AMC / Renewal", percent: 8, color: "#8B5CF6" },
];

export function ProductCategoryDonutChart({
  data,
}: ProductCategoryDonutChartProps) {
  const { currentUser } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isTemplate = currentUser?.orgId === "ORG-TEMP";
  const chartData = (data && data.length > 0) ? data : (isTemplate ? DEFAULT_CATEGORY_DATA : []);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-[#293033] tracking-tight mb-4">
            Product Category Sales
          </h3>
          <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
            No category sales recorded yet
          </div>
        </div>
      </div>
    );
  }

  // SVG Donut Calculations
  const size = 200;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-base text-[#293033] tracking-tight mb-4">
          Product Category Sales
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
          {/* Donut Ring Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform -rotate-90 select-none"
            >
              {chartData.map((item, index) => {
                const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                cumulativePercent += item.percent;
                const isHovered = hoveredIndex === index;

                return (
                  <circle
                    key={item.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Cutout Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredIndex !== null && chartData[hoveredIndex] ? (
                <>
                  <span className="text-xl font-black text-slate-800 leading-tight">
                    {chartData[hoveredIndex].percent}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 text-center px-2 line-clamp-1">
                    {chartData[hoveredIndex].category}
                  </span>
                </>
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-50/50 border border-slate-100" />
              )}
            </div>
          </div>

          {/* Right-Side Legend Matching Reference Mockup */}
          <div className="flex-1 w-full space-y-3.5">
            {chartData.map((item, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={item.category}
                  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? "bg-slate-50" : ""
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={`text-xs truncate transition-colors ${
                        isHovered
                          ? "font-bold text-slate-900"
                          : "font-medium text-slate-600"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 shrink-0">
                    {item.percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
