import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  subtitle?: string;
}

export function Card({ children, className = "", title, action, subtitle }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-[#293033] text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
