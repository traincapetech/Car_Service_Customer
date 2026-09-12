"use client";

import React from "react";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Wallet,
  Plus,
  History,
} from "lucide-react";

export default function MarketplaceKpiGrid({
  metrics,
  wallet,
  onOpenTopup,
  onOpenTransactions,
  activeFilter,
  onSelectFilter,
}) {
  const {
    available = 0,
    inProgress = 0,
    won = 0,
    lost = 0,
    refunds = 0,
  } = metrics || {};

  const cards = [
    {
      id: "available",
      label: "New Opportunities",
      value: available,
      subtext: "Matching your service area",
      icon: Sparkles,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200/80",
      filterKey: "AVAILABLE",
    },
    {
      id: "inProgress",
      label: "Payment Pending",
      value: inProgress,
      subtext: "Accepted, awaiting claim fee",
      icon: Clock,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200/80",
      filterKey: "IN_PROGRESS",
    },
    {
      id: "won",
      label: "Won & Unlocked",
      value: won,
      subtext: "Customer contact details active",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
      filterKey: "CUSTOMER_DETAILS_UNLOCKED",
    },
    {
      id: "lost",
      label: "Lost Opportunities",
      value: lost,
      subtext: "Claimed by another workshop",
      icon: XCircle,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200/80",
      filterKey: "LOST",
    },
    {
      id: "refunds",
      label: "Refunds Credited",
      value: refunds,
      subtext: "Auto-refunded to wallet",
      icon: RotateCcw,
      iconColor: "text-purple-600 bg-purple-50 border-purple-200/80",
      filterKey: "REFUNDS",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filterKey;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter && onSelectFilter(card.filterKey)}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              isSelected
                ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20"
                : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`p-2 rounded-xl border ${
                  isSelected ? "bg-white/10 border-white/20 text-white" : card.iconColor
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <span
                className={`text-2xl font-black font-mono tracking-tight ${
                  isSelected ? "text-white" : "text-slate-900"
                }`}
              >
                {card.value}
              </span>
            </div>
            <p
              className={`text-xs font-bold leading-tight line-clamp-1 ${
                isSelected ? "text-white" : "text-slate-900"
              }`}
            >
              {card.label}
            </p>
            <p
              className={`text-[10px] mt-0.5 line-clamp-1 ${
                isSelected ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {card.subtext}
            </p>
          </button>
        );
      })}

      {/* Workshop Wallet Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-1.5">
              {onOpenTransactions && (
                <button
                  type="button"
                  onClick={onOpenTransactions}
                  className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.75 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                  title="View Transaction Ledger"
                >
                  <History className="w-3 h-3" />
                  <span>Ledger</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenTopup}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.75 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Top Up</span>
              </button>
            </div>
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Wallet Balance
          </p>
          <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
            ₹{wallet?.balance !== undefined ? Number(wallet.balance).toFixed(2) : "0.00"}
          </p>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-1">
          {wallet?.workshopName || "Partner Account"}
        </p>
      </div>
    </div>
  );
}
