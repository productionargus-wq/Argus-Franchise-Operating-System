"use client";

import React from "react";

interface ScreenLoaderProps {
  message?: string;
  submessage?: string;
}

export function ScreenLoader({
  message = "Loading dashboard...",
  submessage = "Fetching real-time metrics and pipeline data...",
}: ScreenLoaderProps) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 select-none">
      <div className="relative flex items-center justify-center mb-5">
        {/* Outer glowing pulsing ring */}
        <div className="w-14 h-14 rounded-full border-4 border-orange-200/60 animate-ping absolute opacity-30" />
        {/* High-contrast smooth spinner */}
        <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#FF6600] animate-spin" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{message}</h3>
      {submessage && (
        <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
          {submessage}
        </p>
      )}
    </div>
  );
}
