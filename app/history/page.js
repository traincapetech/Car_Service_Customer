"use client";

import React, { useState } from "react";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import {
  FileText,
  CheckCircle2,
  Calendar,
  Download,
  Car,
  Wrench,
  Search,
  ExternalLink
} from "lucide-react";
import { serviceHistoryList } from "../../components/shared/MockData";

export default function HistoryPage() {
  const toast = useToast();
  const [history] = useState(serviceHistoryList || []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((item) => {
    return (
      item.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleModel?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDownloadInvoice = (invoiceNo) => {
    toast.success(`Digital GST Tax Invoice ${invoiceNo} generated successfully.`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <DashboardSidebar />

            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Service Records & Tax Invoices
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Immutable digital logbook tracking replaced OEM components, labor costs, and warranty certificates.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by invoice # or car..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Records List */}
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <Card key={item.id} hover className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {item.serviceTitle}
                            </h3>
                            <Badge variant="success" size="sm">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.vehicleModel} • Reg: <span className="font-mono font-medium">{item.registration}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-medium">Invoice Total</span>
                          <p className="text-lg font-extrabold text-slate-900">
                            ₹{item.totalAmount?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(item.invoiceNumber)}
                          leftIcon={Download}
                        >
                          Invoice PDF
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Service Date:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{item.date}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Service Center:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{item.workshopName || "AutoCare Hub #04"}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Lead Technician:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{item.technician || "Vikram S. (Master)"}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
