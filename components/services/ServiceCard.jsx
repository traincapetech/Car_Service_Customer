"use client";

import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  Wrench,
  Sparkles,
} from "lucide-react";
import { formatDuration, formatPrice, getCategoryMeta } from "../../lib/services";

export default function ServiceCard({
  service,
  onViewDetails,
  onBookService,
}) {
  if (!service) return null;

  const categoryMeta = getCategoryMeta(service.category);
  const formattedPrice = formatPrice(service.basePrice);
  const formattedDuration = formatDuration(service.estimatedDurationMinutes);

  return (
    <Card
      hover
      className="flex flex-col justify-between overflow-hidden border border-slate-200/90 bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
      role="article"
      aria-labelledby={`service-title-${service.id}`}
    >
      <div>
        {/* Card Header: Category badge & Duration */}
        <CardHeader className="pb-3 border-b border-slate-100/90">
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <Badge
              variant={categoryMeta.badgeVariant || "neutral"}
              size="sm"
              dot
            >
              {categoryMeta.shortLabel || categoryMeta.label}
            </Badge>

            <div
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md shrink-0"
              title={`Estimated duration: ${formattedDuration}`}
            >
              <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
              <span>{formattedDuration}</span>
            </div>
          </div>

          <h3
            id={`service-title-${service.id}`}
            className="text-base sm:text-lg font-bold text-slate-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors"
          >
            {service.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1.5 min-h-[2rem]">
            {service.description || categoryMeta.tagline}
          </p>
        </CardHeader>

        {/* Card Content: Certified inclusions & Value props */}
        <CardContent className="py-3.5 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Package Coverage & Quality
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="truncate">100% Genuine OEM / OES Spare Parts</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                <span className="truncate">6-Month / 10,000 km Service Warranty</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </div>

      {/* Card Footer: Pricing & Action CTAs */}
      <CardFooter className="pt-3 pb-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
            Base Estimate
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {formattedPrice}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(service)}
              className="text-xs font-semibold px-3 py-1.5"
              aria-label={`View details for ${service.name}`}
            >
              <Eye className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Details
            </Button>
          )}

          {onBookService && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onBookService(service)}
              className="text-xs font-semibold px-3.5 py-1.5 shadow-xs"
              aria-label={`Book ${service.name}`}
            >
              <span>Book Service</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
