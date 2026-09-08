"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  Wrench,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Calendar,
  Sparkles,
  Search,
  ArrowRight,
  Car
} from "lucide-react";
import { servicePackages } from "../../components/shared/MockData";

export default function ServicesPage() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingModalPkg, setBookingModalPkg] = useState(null);

  const categories = [
    { id: "all", label: "All Services" },
    { id: "periodic", label: "Periodic Maintenance" },
    { id: "ac", label: "AC & Climate" },
    { id: "brakes", label: "Brakes & Suspension" },
    { id: "battery", label: "Battery & Electricals" },
    { id: "tyres", label: "Tyres & Wheel Care" },
  ];

  const filteredPackages = servicePackages.filter((pkg) => {
    const matchesCategory =
      selectedCategory === "all" ||
      pkg.id.toLowerCase().includes(selectedCategory) ||
      pkg.name.toLowerCase().includes(selectedCategory);

    const matchesSearch =
      !searchQuery ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleBookClick = (pkg) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to your customer account to complete appointment scheduling.");
    }
    setBookingModalPkg(pkg);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="blue" size="md" dot>
            Guaranteed OEM Service Catalog
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent Pricing. Certified Technicians.
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Every service package includes complete digital diagnostic reports, 100% genuine OEM spare parts, and a 6-month / 10,000 km warranty.
          </p>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services, brake, oil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} hover className="flex flex-col justify-between overflow-hidden">
              <div>
                <div className="p-6 pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {pkg.badge || "Standard Package"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Service Inclusions */}
                <div className="p-6 space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Package Inclusions
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {pkg.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Fixed Estimate</span>
                  <p className="text-xl font-extrabold text-slate-900">
                    ₹{pkg.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBookClick(pkg)}
                  rightIcon={ArrowRight}
                >
                  Book Service
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* QUICK SERVICE SELECTION MODAL */}
      <Modal
        isOpen={!!bookingModalPkg}
        onClose={() => setBookingModalPkg(null)}
        title={bookingModalPkg?.name || "Book Service"}
        description="Review package details and select your vehicle to schedule your appointment."
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Estimated Package Cost:</span>
              <span>₹{bookingModalPkg?.price?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Duration:</span>
              <span>{bookingModalPkg?.duration}</span>
            </div>
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Ready to confirm your booking? Our dedicated service advisor will coordinate slot reservation and complimentary doorstep valet pickup.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    toast.success(`Booking appointment initiated for ${bookingModalPkg?.name}!`);
                    setBookingModalPkg(null);
                  }}
                >
                  Confirm Appointment Request
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Please sign in or register to link this service to your garage and track live diagnostics.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login">
                    <Button variant="primary" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="md" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
