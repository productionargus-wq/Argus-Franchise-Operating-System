"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

export interface DateRangePreset {
  label: string;
  startDate: string;
  endDate: string;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getDynamicPresets(): { presets: DateRangePreset[]; defaultPreset: DateRangePreset; currentFY: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 1. This Month
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0);

  // 2. Last Month
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);

  // 3. This Quarter (Calendar)
  const quarterIdx = Math.floor(month / 3) + 1;
  const quarterStart = new Date(year, (quarterIdx - 1) * 3, 1);
  const quarterEnd = new Date(year, quarterIdx * 3, 0);

  // 4. Year to Date (Jan 1 to today)
  const ytdStart = new Date(year, 0, 1);
  const ytdEnd = now;

  // 5. Financial Year (India: Apr 1 to Mar 31)
  const fyStartYear = month >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  const fyStart = new Date(fyStartYear, 3, 1);
  const fyEnd = new Date(fyEndYear, 2, 31);
  const currentFY = `FY ${fyStartYear}-${String(fyEndYear).slice(-2)}`;

  // 6. Full Year
  const fullYearStart = new Date(year, 0, 1);
  const fullYearEnd = new Date(year, 11, 31);

  const presets: DateRangePreset[] = [
    {
      label: `This Month (${MONTH_NAMES[month]} ${year})`,
      startDate: toYMD(thisMonthStart),
      endDate: toYMD(thisMonthEnd),
    },
    {
      label: `Last Month (${MONTH_NAMES[lastMonthStart.getMonth()]} ${lastMonthStart.getFullYear()})`,
      startDate: toYMD(lastMonthStart),
      endDate: toYMD(lastMonthEnd),
    },
    {
      label: `This Quarter (Q${quarterIdx} ${year})`,
      startDate: toYMD(quarterStart),
      endDate: toYMD(quarterEnd),
    },
    {
      label: `Year to Date (YTD ${year})`,
      startDate: toYMD(ytdStart),
      endDate: toYMD(ytdEnd),
    },
    {
      label: `Financial Year (${currentFY})`,
      startDate: toYMD(fyStart),
      endDate: toYMD(fyEnd),
    },
    {
      label: `Full Year ${year}`,
      startDate: toYMD(fullYearStart),
      endDate: toYMD(fullYearEnd),
    },
  ];

  return { presets, defaultPreset: presets[0], currentFY };
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  return `${d} ${MONTH_NAMES[monthIdx] || m} ${y}`;
}

export function DateRangePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const dynamicConfig = getDynamicPresets();
  const presets = dynamicConfig.presets;

  const [selectedPreset, setSelectedPreset] = useState<string>(dynamicConfig.defaultPreset.label);
  const [startDate, setStartDate] = useState(dynamicConfig.defaultPreset.startDate);
  const [endDate, setEndDate] = useState(dynamicConfig.defaultPreset.endDate);

  const [customStart, setCustomStart] = useState(dynamicConfig.defaultPreset.startDate);
  const [customEnd, setCustomEnd] = useState(dynamicConfig.defaultPreset.endDate);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.label);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    setCustomStart(preset.startDate);
    setCustomEnd(preset.endDate);
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setStartDate(customStart);
      setEndDate(customEnd);
      setSelectedPreset("Custom Range");
      setIsOpen(false);
    }
  };

  const displayText = `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1F2426] hover:bg-[#3A4448] border border-[#3A4448] text-xs text-slate-300 hover:text-white transition-all cursor-pointer select-none"
        title="Change Active Date Period"
      >
        <Calendar className="w-3.5 h-3.5 text-[#FF6600]" />
        <span className="font-medium tracking-tight">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-[#293033] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6600]" />
              <span className="text-xs font-bold tracking-tight">Select Operating Period</span>
            </div>
            <span className="text-[10px] bg-[#FF6600] text-white px-2 py-0.5 rounded-full font-bold">
              {dynamicConfig.currentFY}
            </span>
          </div>

          {/* Quick Dynamic Presets */}
          <div className="p-2 space-y-1 border-b border-slate-100">
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Select Period
            </div>
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-orange-50 text-[#FF6600] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#FF6600]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Inputs */}
          <form onSubmit={handleApplyCustom} className="p-3 bg-slate-50 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Custom Range
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              Apply Period
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
