"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import {
  Wrench,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Wallet,
  Sparkles,
  Plus,
  RotateCcw,
  ShieldCheck,
  Building2,
  MapPin,
} from "lucide-react";
import { marketplaceApi } from "../../lib/marketplace";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Marketplace Components
import MarketplaceKpiGrid from "../../components/marketplace/MarketplaceKpiGrid";
import OpportunityCard from "../../components/marketplace/OpportunityCard";
import OpportunityDetailModal from "../../components/marketplace/OpportunityDetailModal";
import AcceptPaymentModal from "../../components/marketplace/AcceptPaymentModal";
import TransferOpportunityModal from "../../components/marketplace/TransferOpportunityModal";
import WalletTopupModal from "../../components/marketplace/WalletTopupModal";
import RefundsHistoryModal from "../../components/marketplace/RefundsHistoryModal";
import WalletTransactionsModal from "../../components/marketplace/WalletTransactionsModal";

export default function MarketplacePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [opportunities, setOpportunities] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, AVAILABLE, IN_PROGRESS, CUSTOMER_DETAILS_UNLOCKED, LOST, TRANSFERRED, REFUNDS

  // Modals state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isRefundsModalOpen, setIsRefundsModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  // Fetch or refresh marketplace data
  const loadMarketplaceData = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [oppsData, walletData, refundsData] = await Promise.all([
        marketplaceApi.getOpportunities(),
        marketplaceApi.getWallet().catch((e) => {
          console.warn("Wallet fetch failed:", e.message);
          return null;
        }),
        marketplaceApi.getRefunds().catch((e) => {
          console.warn("Refunds fetch failed:", e.message);
          return [];
        }),
      ]);

      setOpportunities(Array.isArray(oppsData) ? oppsData : []);
      if (walletData) setWallet(walletData);
      if (Array.isArray(refundsData)) setRefunds(refundsData);
    } catch (err) {
      console.error("Failed to load marketplace opportunities:", err);
      setError(err.message || "Failed to load service opportunities from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      setError(null);
      try {
        const [oppsData, walletData, refundsData] = await Promise.all([
          marketplaceApi.getOpportunities(),
          marketplaceApi.getWallet().catch((e) => {
            console.warn("Wallet fetch failed:", e.message);
            return null;
          }),
          marketplaceApi.getRefunds().catch((e) => {
            console.warn("Refunds fetch failed:", e.message);
            return [];
          }),
        ]);
        if (!isMounted) return;
        setOpportunities(Array.isArray(oppsData) ? oppsData : []);
        if (walletData) setWallet(walletData);
        if (Array.isArray(refundsData)) setRefunds(refundsData);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load service opportunities from server.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute metrics from actual live backend data
  const metrics = useMemo(() => {
    let available = 0;
    let inProgress = 0;
    let won = 0;
    let lost = 0;

    opportunities.forEach((opp) => {
      if (opp.status === "AVAILABLE" || opp.status === "VIEWED") available++;
      else if (opp.status === "ACCEPTED" || opp.status === "PAYMENT_PENDING") inProgress++;
      else if (opp.status === "CUSTOMER_DETAILS_UNLOCKED") won++;
      else if (opp.status === "LOST") lost++;
    });

    return {
      available,
      inProgress,
      won,
      lost,
      refunds: refunds.length,
    };
  }, [opportunities, refunds]);

  // Filter and search opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Status filter
      if (activeFilter === "AVAILABLE") {
        if (opp.status !== "AVAILABLE" && opp.status !== "VIEWED") return false;
      } else if (activeFilter === "IN_PROGRESS") {
        if (opp.status !== "ACCEPTED" && opp.status !== "PAYMENT_PENDING") return false;
      } else if (activeFilter === "CUSTOMER_DETAILS_UNLOCKED") {
        if (opp.status !== "CUSTOMER_DETAILS_UNLOCKED") return false;
      } else if (activeFilter === "LOST") {
        if (opp.status !== "LOST") return false;
      } else if (activeFilter === "TRANSFERRED") {
        if (opp.status !== "TRANSFERRED") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const refMatch = opp.requestReference?.toLowerCase().includes(query);
        const vehMatch = opp.vehicleSummary?.toLowerCase().includes(query);
        const cityMatch = opp.city?.toLowerCase().includes(query);
        const notesMatch = opp.customerNotes?.toLowerCase().includes(query);
        const serviceMatch = opp.requestedServices?.some((s) =>
          (s.serviceName || s.name || "").toLowerCase().includes(query)
        );

        if (!refMatch && !vehMatch && !cityMatch && !notesMatch && !serviceMatch) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, activeFilter, searchQuery]);

  // Handlers for Opportunity Actions
  const handleViewDetails = (opp) => {
    setSelectedOpportunity(opp);
    setIsDetailModalOpen(true);
  };

  const handleOpenAccept = (opp) => {
    setSelectedOpportunity(opp);
    setIsAcceptModalOpen(true);
  };

  const handleOpenTransfer = (opp) => {
    setSelectedOpportunity(opp);
    setIsTransferModalOpen(true);
  };

  const handlePaymentSuccess = async (oppId, newStatus) => {
    // Refresh data quietly
    loadMarketplaceData(true);
  };

  const handleTransferSuccess = async (oppId) => {
    loadMarketplaceData(true);
  };

  const handleTopupSuccess = (updatedWallet) => {
    loadMarketplaceData(true);
  };

  return (
    <ProtectedRoute allowedRoles={["PARTNER", "ADMIN"]}>
      <div className="min-h-screen bg-slate-50/60 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Service Opportunities
                </h1>
                <Badge variant="blue" size="sm" dot>
                  Partner Marketplace
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Find nearby service requests that match your workshop&apos;s location and registered service capabilities.
              </p>
            </div>

            {/* Quick Actions & Live Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRefundsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                <span>Refunds Ledger ({refunds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => loadMarketplaceData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                title="Refresh opportunities"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Workshop Details Bar */}
          {wallet && (
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/80 border border-blue-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-slate-900">{wallet.workshopName}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Service Coverage Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Wallet Balance:</span>
                  <strong className="font-mono text-emerald-700">₹{Number(wallet.balance).toFixed(2)}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTopupModalOpen(true)}
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Top Up
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <Alert variant="danger" title="Unable to Load Opportunities">
              {error}
              <button
                type="button"
                onClick={() => loadMarketplaceData()}
                className="mt-2 block font-bold underline text-xs"
              >
                Retry Connection
              </button>
            </Alert>
          )}

          {/* KPI Metrics Row */}
          <MarketplaceKpiGrid
            metrics={metrics}
            wallet={wallet}
            onOpenTopup={() => setIsTopupModalOpen(true)}
            onOpenTransactions={() => setIsLedgerModalOpen(true)}
            activeFilter={activeFilter}
            onSelectFilter={(filterKey) => {
              if (filterKey === "REFUNDS") {
                setIsRefundsModalOpen(true);
              } else {
                setActiveFilter(filterKey);
              }
            }}
          />

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "ALL", label: "All Opportunities", count: opportunities.length },
                { id: "AVAILABLE", label: "New Leads", count: metrics.available },
                { id: "IN_PROGRESS", label: "Payment Pending", count: metrics.inProgress },
                { id: "CUSTOMER_DETAILS_UNLOCKED", label: "Won & Unlocked", count: metrics.won },
                { id: "LOST", label: "Lost", count: metrics.lost },
                { id: "TRANSFERRED", label: "Transferred" },
              ].map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.25 rounded-md ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, vehicle, service..."
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Opportunities Grid / List */}
          {isLoading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-5 bg-slate-200 rounded w-28" />
                    <div className="h-5 bg-slate-200 rounded w-16" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-8 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery ? "No Matching Opportunities" : "No Opportunities in this Category"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No leads found matching "${searchQuery}". Try a different keyword or reset filters.`
                  : "New customer service requests in your coverage area will appear here in real-time as matching algorithms dispatch them."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            /* Opportunities Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onViewDetails={handleViewDetails}
                  onAccept={handleOpenAccept}
                  onTransfer={handleOpenTransfer}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OpportunityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        opportunity={selectedOpportunity}
        onAccept={handleOpenAccept}
        onTransfer={handleOpenTransfer}
      />

      <AcceptPaymentModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        opportunity={selectedOpportunity}
        wallet={wallet}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenTopup={() => setIsTopupModalOpen(true)}
      />

      <TransferOpportunityModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        opportunity={selectedOpportunity}
        onTransferSuccess={handleTransferSuccess}
      />

      <WalletTopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        currentBalance={wallet?.balance}
        onTopupSuccess={handleTopupSuccess}
      />

      <RefundsHistoryModal
        isOpen={isRefundsModalOpen}
        onClose={() => setIsRefundsModalOpen(false)}
        refunds={refunds}
      />

      <WalletTransactionsModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        wallet={wallet}
        onRefreshWallet={() => loadMarketplaceData(true)}
      />
    </ProtectedRoute>
  );
}
