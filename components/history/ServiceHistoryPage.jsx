"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  X,
  Printer,
  Download,
  Calendar,
  DollarSign,
  Car,
  Wrench,
  ShieldCheck
} from "lucide-react";
import { serviceHistoryList } from "../shared/MockData";

export default function ServiceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredHistory = serviceHistoryList.filter((item) => {
    const matchesSearch =
      item.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registration.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 py-2 pb-16">
      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0f1624] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Service History
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {serviceHistoryList.length} Invoices On Record
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Access itemized receipts, replaced OEM parts history, and official digital warranty tokens.
          </p>
        </div>

        {/* Search Input & Status Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, vehicle or reg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full sm:w-auto">
            {["All", "Completed", "In Progress", "Scheduled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="rounded-3xl bg-[#0f1624] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Service ID</th>
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Service Type</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-medium">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No matching service records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((row) => {
                  const isCompleted = row.status === "Completed";
                  const isInProgress = row.status === "In Progress";
                  return (
                    <tr key={row.serviceId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                        {row.serviceId}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{row.vehicleName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{row.registration}</div>
                      </td>

                      <td className="py-4 px-6 text-slate-300 font-semibold">{row.serviceType}</td>

                      <td className="py-4 px-6 text-slate-400">{row.date}</td>

                      <td className="py-4 px-6 font-mono font-bold text-white">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isCompleted
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isInProgress
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted ? "bg-emerald-400" : isInProgress ? "bg-sky-400" : "bg-amber-400"
                            }`}
                          />
                          {row.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedInvoice(row)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 font-bold text-xs border border-white/10 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POLISHED SERVICE DETAILS & INVOICE SLIDE-OVER MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f1624] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    INVOICE {selectedInvoice.serviceId}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedInvoice.date}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  {selectedInvoice.serviceType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicle & Mileage Info */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Details</span>
                <p className="font-bold text-white mt-0.5">{selectedInvoice.vehicleName}</p>
                <p className="font-mono text-emerald-400 text-[11px]">{selectedInvoice.registration}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Odometer & Advisor</span>
                <p className="font-bold text-white mt-0.5">{selectedInvoice.mileage}</p>
                <p className="text-slate-400 text-[11px]">Advisor: {selectedInvoice.advisor}</p>
              </div>
            </div>

            {/* Itemized Replaced OEM Parts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                OEM Parts & Labor Breakdown
              </h4>
              <div className="space-y-2">
                {selectedInvoice.partsReplaced.length === 0 ? (
                  <p className="text-xs text-slate-500">No parts replacement required for this inspection.</p>
                ) : (
                  selectedInvoice.partsReplaced.map((part, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-200">{part}</span>
                      </div>
                      <span className="text-slate-400 font-mono">OEM Certified</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Line Items Pricing */}
            <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Parts & Material Total</span>
                <span className="font-mono text-white">₹{selectedInvoice.partsCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Certified Master Labor</span>
                <span className="font-mono text-white">₹{selectedInvoice.laborCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST & Statutory Taxes (18%)</span>
                <span className="font-mono text-emerald-400">Included</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10 text-base font-extrabold text-white">
                <span>Grand Total Paid</span>
                <span className="font-mono text-emerald-400">
                  ₹{selectedInvoice.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => alert(`Downloading PDF Official Receipt for ${selectedInvoice.serviceId}...`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md glow-lime-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Tax Invoice (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
