"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

export interface DateRangePreset {
  label: string;
  startDate: string;
  endDate: string;
}

const PRESETS_2026: DateRangePreset[] = [
  {
    label: "This Month (Sep 2026)",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
  },
  {
    label: "Last Month (Aug 2026)",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
  },
  {
    label: "This Quarter (Q3 2026)",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
  },
  {
    label: "Year to Date (YTD 2026)",
    startDate: "2026-01-01",
    endDate: "2026-09-22",
  },
  {
    label: "Financial Year (FY 2026-27)",
    startDate: "2026-04-01",
    endDate: "2027-03-31",
  },
  {
    label: "Full Year 2026",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  },
];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthIdx = parseInt(m, 10) - 1;
  return `${d} ${months[monthIdx] || m} ${y}`;
}

export function DateRangePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("This Month (Sep 2026)");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-30");

  const [customStart, setCustomStart] = useState("2026-09-01");
  const [customEnd, setCustomEnd] = useState("2026-09-30");

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
              <span className="text-xs font-bold tracking-tight">Select Operating Period (2026)</span>
            </div>
            <span className="text-[10px] bg-[#FF6600] text-white px-2 py-0.5 rounded-full font-bold">
              FY 2026-27
            </span>
          </div>

          {/* Quick 2026 Presets */}
          <div className="p-2 space-y-1 border-b border-slate-100">
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Select 2026
            </div>
            {PRESETS_2026.map((preset) => {
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
