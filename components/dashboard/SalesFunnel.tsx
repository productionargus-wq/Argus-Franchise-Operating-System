"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export interface FunnelStage {
  stage: string;
  count: number;
  fill?: string;
}

interface SalesFunnelProps {
  stages?: FunnelStage[];
}

const DEFAULT_STAGES: FunnelStage[] = [
  { stage: "New Lead", count: 38, fill: "#2563EB" },
  { stage: "Qualified", count: 24, fill: "#06B6D4" },
  { stage: "Demo", count: 12, fill: "#F97316" },
  { stage: "Quotation", count: 9, fill: "#EAB308" },
  { stage: "PO", count: 5, fill: "#10B981" },
  { stage: "Won", count: 4, fill: "#1D4ED8" },
];

const EMPTY_STAGES: FunnelStage[] = [
  { stage: "New Lead", count: 0, fill: "#2563EB" },
  { stage: "Qualified", count: 0, fill: "#06B6D4" },
  { stage: "Demo", count: 0, fill: "#F97316" },
  { stage: "Quotation", count: 0, fill: "#EAB308" },
  { stage: "PO", count: 0, fill: "#10B981" },
  { stage: "Won", count: 0, fill: "#1D4ED8" },
];

export function SalesFunnel({ stages }: SalesFunnelProps) {
  const { currentUser } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fallbackStages = currentUser?.orgId === "ORG-TEMP" ? DEFAULT_STAGES : EMPTY_STAGES;
  const data = stages && stages.length > 0 ? stages : fallbackStages;

  // Funnel Geometry
  const width = 210;
  const height = 240;
  const cx = width / 2;
  const tierCount = data.length;
  const gap = 4;
  const totalTierHeight = (height - gap * (tierCount - 1)) / tierCount;

  // Width tapering parameters
  const maxWidth = 190;
  const minWidth = 46;
  const widthStep = (maxWidth - minWidth) / tierCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-[#293033] tracking-tight">
          Sales Pipeline
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          Conversion Funnel
        </span>
      </div>

      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Left: SVG Tapered Funnel */}
        <div className="col-span-6 flex justify-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[190px] h-auto select-none"
          >
            {data.map((item, index) => {
              const yTop = index * (totalTierHeight + gap);
              const yBottom = yTop + totalTierHeight;

              const topW = maxWidth - index * widthStep;
              const bottomW = maxWidth - (index + 1) * widthStep;

              const pTopLeft = `${cx - topW / 2},${yTop}`;
              const pTopRight = `${cx + topW / 2},${yTop}`;
              const pBottomRight = `${cx + bottomW / 2},${yBottom}`;
              const pBottomLeft = `${cx - bottomW / 2},${yBottom}`;

              const points = `${pTopLeft} ${pTopRight} ${pBottomRight} ${pBottomLeft}`;
              const isHovered = hoveredIndex === index;
              const fillColor = item.fill || DEFAULT_STAGES[index]?.fill || "#2563EB";

              return (
                <g
                  key={item.stage}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <polygon
                    points={points}
                    fill={fillColor}
                    className={`transition-all duration-200 ${
                      isHovered
                        ? "brightness-110 filter drop-shadow-md"
                        : "hover:opacity-95"
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Stage Labels and Counts */}
        <div className="col-span-6 space-y-2.5">
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const fillColor = item.fill || DEFAULT_STAGES[index]?.fill || "#2563EB";

            return (
              <div
                key={item.stage}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? "bg-slate-50 font-bold" : ""
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: fillColor }}
                  />
                  <span
                    className={`text-xs truncate transition-colors ${
                      isHovered
                        ? "text-slate-900 font-bold"
                        : "text-slate-600 font-medium"
                    }`}
                  >
                    {item.stage}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 shrink-0">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
