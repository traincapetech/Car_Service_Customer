"use client";

import React from "react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  Clock,
  CheckCircle2,
  Check,
  Eye,
  ArrowRight,
  Car,
  Wind,
  BatteryCharging,
  Disc,
  Sliders,
  ShieldAlert,
  Sparkles,
  Activity,
  Wrench,
  LifeBuoy,
  ShieldCheck,
  Tag,
} from "lucide-react";
import {
  formatDuration,
  formatPrice,
  getCategoryMeta,
  getOriginalPrice,
  getServiceInclusions,
} from "../../lib/services";

// Map category to a stylized visual icon and background
function getCategoryVisual(categoryKey) {
  switch (categoryKey) {
    case "PERIODIC_SERVICE":
      return {
        icon: Car,
        bgGradient: "from-blue-500/10 via-indigo-500/10 to-blue-600/10",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200/70",
      };
    case "AC_SERVICE":
      return {
        icon: Wind,
        bgGradient: "from-cyan-500/10 via-sky-500/10 to-blue-500/10",
        iconColor: "text-cyan-600",
        borderColor: "border-cyan-200/70",
      };
    case "BATTERY_SERVICE":
      return {
        icon: BatteryCharging,
        bgGradient: "from-purple-500/10 via-fuchsia-500/10 to-violet-500/10",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200/70",
      };
    case "TYRE_SERVICE":
      return {
        icon: Disc,
        bgGradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200/70",
      };
    case "WHEEL_ALIGNMENT":
      return {
        icon: Sliders,
        bgGradient: "from-indigo-500/10 via-blue-500/10 to-sky-500/10",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200/70",
      };
    case "BRAKE_SERVICE":
      return {
        icon: ShieldAlert,
        bgGradient: "from-rose-500/10 via-red-500/10 to-pink-500/10",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200/70",
      };
    case "DETAILING":
      return {
        icon: Sparkles,
        bgGradient: "from-emerald-500/10 via-teal-500/10 to-green-500/10",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200/70",
      };
    case "DIAGNOSTICS":
      return {
        icon: Activity,
        bgGradient: "from-violet-500/10 via-purple-500/10 to-indigo-500/10",
        iconColor: "text-violet-600",
        borderColor: "border-violet-200/70",
      };
    case "ENGINE_SERVICE":
      return {
        icon: Wrench,
        bgGradient: "from-amber-500/10 via-yellow-500/10 to-orange-500/10",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200/70",
      };
    default:
      return {
        icon: LifeBuoy,
        bgGradient: "from-slate-500/10 via-blue-500/10 to-slate-600/10",
        iconColor: "text-slate-700",
        borderColor: "border-slate-200/70",
      };
  }
}

export default function ServiceCard({
  service,
  isSelected = false,
  onSelect,
  onViewDetails,
  onBookService,
  mode = "catalog", // "catalog" | "select"
}) {
  if (!service) return null;

  const categoryMeta = getCategoryMeta(service.category);
  const visual = getCategoryVisual(service.category);
  const VisualIcon = visual.icon;

  const formattedPrice = formatPrice(service.basePrice);
  const originalPrice = getOriginalPrice(service.basePrice);
  const formattedOriginalPrice = `₹${originalPrice.toLocaleString("en-IN")}`;
  const savings = originalPrice - (Number(service.basePrice) || 0);

  const formattedDuration = formatDuration(service.estimatedDurationMinutes);
  const inclusions = getServiceInclusions(service);

  const isSelectMode = mode === "select" || Boolean(onSelect);

  const handleCardClick = () => {
    if (isSelectMode && onSelect) {
      onSelect(service);
    }
  };

  return (
    <div
      onClick={isSelectMode ? handleCardClick : undefined}
      className={`group relative rounded-2xl bg-white border transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
        isSelectMode ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-red-600 bg-red-50/15 shadow-sm ring-2 ring-red-600/20"
          : "border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-md"
      }`}
      role="article"
      aria-labelledby={`service-title-${service.id}`}
    >
      {/* Left Area: Illustration / Category Badge + Service Details */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Visual Themed Illustration Box (GoMechanic Style) */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${visual.bgGradient} border ${visual.borderColor} flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 relative overflow-hidden`}
        >
          <div className="absolute -right-2 -bottom-2 opacity-15">
            <VisualIcon className="w-12 h-12" />
          </div>
          <VisualIcon className={`w-8 h-8 sm:w-9 sm:h-9 ${visual.iconColor} stroke-[1.75]`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">
            {categoryMeta.shortLabel}
          </span>
        </div>

        {/* Content: Title, Duration Badge, Highlights, Inclusions */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              id={`service-title-${service.id}`}
              className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
                isSelected ? "text-red-700 font-extrabold" : "text-slate-900 group-hover:text-red-600"
              }`}
            >
              {service.name}
            </h3>

            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formattedDuration}</span>
            </div>

            {savings > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" /> Save ₹{savings.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Subtitle / Key Highlights Line (GoMechanic Style) */}
          <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <span>• {formattedDuration}</span>
            <span>• Quick Roadside / Workshop Care</span>
            <span>• 100% Genuine OEM Spares</span>
          </p>

          {/* Checkmark Inclusions Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-1">
            {inclusions.slice(0, 4).map((inc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{inc}</span>
              </div>
            ))}
          </div>

          {/* Secondary Details Trigger Link */}
          {onViewDetails && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(service);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                <Eye className="w-3 h-3" />
                <span>View full package inclusions & warranty</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Pricing & CTA Button (GoMechanic Style) */}
      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
        <div className="text-left md:text-right">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-400 line-through">
              {formattedOriginalPrice}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 block">
            Inclusive of taxes & labor
          </span>
        </div>

        {/* Action Button */}
        {isSelectMode ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(service);
            }}
            className={`min-w-[120px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs ${
              isSelected
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                : "border-2 border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Selected</span>
              </>
            ) : (
              <span>Purchase</span>
            )}
          </button>
        ) : (
          onBookService && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookService(service);
              }}
              className="min-w-[120px] text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
