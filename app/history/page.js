"use client";

import React, { useState } from "react";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import {
  FileText,
  Download,
  Search,
  History,
  Clock,
  Wrench,
} from "lucide-react";
import { serviceHistoryList } from "../../components/shared/MockData";

export default function HistoryPage() {
  const toast = useToast();
  const [history] = useState(serviceHistoryList || []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.serviceId && item.serviceId.toLowerCase().includes(q)) ||
      (item.serviceType && item.serviceType.toLowerCase().includes(q)) ||
      (item.vehicleName && item.vehicleName.toLowerCase().includes(q)) ||
      (item.registration && item.registration.toLowerCase().includes(q))
    );
  });

  const handleDownloadInvoice = (serviceId) => {
    toast.success(`Digital GST Tax Invoice ${serviceId} generated successfully.`);
  };

  return (
    <CustomerShell>
      <PageHeader
        title="Service Records & Invoices"
        description="Transparent digital service logbook tracking replaced OEM components, labor breakdowns, and warranty certificates."
        badge={
          <Badge variant="blue" size="sm">
            {history.length} Records
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Service History" },
        ]}
        actions={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, car, reg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
            />
          </div>
        }
      />

      {/* Records List */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Service Records Found"
          description={
            searchQuery
              ? `No service history matches "${searchQuery}". Try searching by registration number or service type.`
              : "You do not have any past service history yet."
          }
          action={
            searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.serviceId} hover className="p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {item.serviceType}
                      </h3>
                      <Badge
                        variant={item.status === "Completed" ? "success" : "blue"}
                        size="sm"
                        dot
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.vehicleName} • Reg:{" "}
                      <span className="font-mono font-medium text-slate-700">
                        {item.registration}
                      </span>{" "}
                      • ODO: <span className="font-medium">{item.mileage}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Invoice Total
                    </span>
                    <p className="text-lg font-extrabold text-slate-900">
                      ₹{item.amount?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(item.serviceId)}
                    leftIcon={Download}
                  >
                    Invoice PDF
                  </Button>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Service Date:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{item.date}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Service Advisor:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">{item.advisor}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Parts & Spares:</span>
                  <p className="text-slate-800 font-semibold mt-0.5">
                    {item.partsReplaced && item.partsReplaced.length > 0
                      ? item.partsReplaced.join(", ")
                      : "Inspection Only"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </CustomerShell>
  );
}
