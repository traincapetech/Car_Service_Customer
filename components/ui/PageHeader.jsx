import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PageHeader({
  title,
  description,
  badge,
  breadcrumbs = [],
  actions,
  className = "",
}) {
  return (
    <div className={`space-y-3 pb-6 border-b border-slate-200/80 ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label || idx}>
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-900 transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-slate-800" : "font-medium"}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
