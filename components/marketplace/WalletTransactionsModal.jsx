"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
  Hash,
} from "lucide-react";
import { marketplaceApi } from "@/lib/marketplace";

export default function WalletTransactionsModal({
  isOpen,
  onClose,
  wallet,
  onRefreshWallet,
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("ALL"); // ALL, CREDIT, DEBIT
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        size: 15,
      };
      if (filterType !== "ALL") {
        params.type = filterType;
      }

      const res = await marketplaceApi.getWalletTransactions(params);

      // Handle both Page object response or List response
      if (res && typeof res === "object" && "content" in res) {
        setTransactions(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || (res.content ? res.content.length : 0));
      } else if (Array.isArray(res)) {
        let filtered = res;
        if (filterType !== "ALL") {
          filtered = res.filter((t) => t.type === filterType);
        }
        setTransactions(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
      } else {
        setTransactions([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError(err?.message || "Failed to load transaction ledger. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    let ignore = false;

    if (!isOpen) return;

    const run = async () => {
      try {
        const params = {
          page,
          size: 15,
        };
        if (filterType !== "ALL") {
          params.type = filterType;
        }
        const res = await marketplaceApi.getWalletTransactions(params);
        if (ignore) return;

        if (res && typeof res === "object" && "content" in res) {
          setTransactions(res.content || []);
          setTotalPages(res.totalPages || 1);
          setTotalElements(res.totalElements || (res.content ? res.content.length : 0));
        } else if (Array.isArray(res)) {
          let filtered = res;
          if (filterType !== "ALL") {
            filtered = res.filter((t) => t.type === filterType);
          }
          setTransactions(filtered);
          setTotalPages(1);
          setTotalElements(filtered.length);
        } else {
          setTransactions([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Failed to load transaction ledger. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [isOpen, page, filterType]);

  // Reset page when filter changes
  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(0);
  };

  if (!isOpen) return null;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getReferenceBadge = (refType) => {
    switch (refType) {
      case "OPPORTUNITY_ACCEPTANCE_FEE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Opportunity Fee
          </span>
        );
      case "OPPORTUNITY_REFUND":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Refund Credit
          </span>
        );
      case "WALLET_TOPUP":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Top-Up
          </span>
        );
      case "ADMIN_CREDIT":
      case "ADMIN_DEBIT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Admin Adjustment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {refType || "General"}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ledger-modal-title"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ledger-modal-title" className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Wallet Ledger & History</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Immutable
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full chronological statement of all wallet debits, credits, and refunds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Filter Bar */}
        <div className="px-5 sm:px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Balance
              </span>
              <span className="text-2xl font-black font-mono text-slate-900">
                ₹{wallet?.balance !== undefined ? Number(wallet.balance).toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Account Status
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mt-0.5">
                {wallet?.status || "ACTIVE"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleFilterChange("ALL")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === "ALL"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("CREDIT")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === "CREDIT"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Credits
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("DEBIT")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === "DEBIT"
                    ? "bg-white text-rose-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Debits
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                loadData();
                if (onRefreshWallet) onRefreshWallet();
              }}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
              title="Refresh transactions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && transactions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Loading transaction ledger...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Transactions will appear here when you top up your wallet or accept customer service leads.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
              {transactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";
                const amountFormatted = Number(tx.amount || 0).toFixed(2);
                const beforeFormatted = tx.balanceBefore !== undefined && tx.balanceBefore !== null
                  ? Number(tx.balanceBefore).toFixed(2)
                  : "—";
                const afterFormatted = tx.balanceAfter !== undefined && tx.balanceAfter !== null
                  ? Number(tx.balanceAfter).toFixed(2)
                  : "—";

                return (
                  <div
                    key={tx.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                          isCredit
                            ? "bg-emerald-50 border border-emerald-200/80 text-emerald-600"
                            : "bg-rose-50 border border-rose-200/80 text-rose-600"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-900">
                            {tx.description || (isCredit ? "Wallet Credit" : "Wallet Debit")}
                          </span>
                          {getReferenceBadge(tx.referenceType)}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono flex-wrap">
                          <span>{formatDateTime(tx.createdAt)}</span>
                          {tx.referenceId && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600">Ref: {tx.referenceId}</span>
                            </>
                          )}
                          {tx.idempotencyKey && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 truncate max-w-[150px]" title={tx.idempotencyKey}>
                                Key: {tx.idempotencyKey}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Balance Flow */}
                    <div className="text-right sm:shrink-0 pl-11 sm:pl-0">
                      <p
                        className={`text-base font-black font-mono ${
                          isCredit ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isCredit ? `+₹${amountFormatted}` : `-₹${amountFormatted}`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ₹{beforeFormatted} → ₹{afterFormatted}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer / Pagination */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total entries: <span className="font-bold text-slate-800">{totalElements}</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-xs font-mono text-slate-600 px-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 font-semibold"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
