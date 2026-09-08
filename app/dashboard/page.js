"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import Button from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ShieldCheck,
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
  PhoneCall,
  FileText,
  ChevronRight
} from "lucide-react";
import { initialVehicles, servicePackages } from "../../components/shared/MockData";

export default function DashboardPage() {
  const { user } = useAuth();
  const [vehicles] = useState(initialVehicles);
  const primaryVehicle = vehicles[0] || {};

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <DashboardSidebar />

            {/* Main Dashboard Space */}
            <div className="flex-1 space-y-8">
              {/* TOP GREETING & ACTION HEADER */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Good morning, {user?.name || "Customer"} 👋
                    </h1>
                    <Badge variant="blue" size="sm" dot>
                      Active Garage
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Your vehicle telemetry, diagnostic health scores, and service schedules are up to date.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/services">
                    <Button variant="primary" size="md" leftIcon={Plus}>
                      Book Service
                    </Button>
                  </Link>
                </div>
              </div>

              {/* ACTIVE VEHICLE HEALTH & SPECS CARD */}
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left: Vehicle Image & Badges */}
                  <div className="lg:col-span-5 relative bg-slate-900 min-h-[220px] lg:min-h-full">
                    <img
                      src={primaryVehicle.image || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"}
                      alt={primaryVehicle.model}
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Badge variant="brand" size="sm" className="bg-white/20 text-white backdrop-blur-md mb-1.5">
                        Primary Vehicle
                      </Badge>
                      <h3 className="text-xl font-bold tracking-tight text-white">
                        {primaryVehicle.brand} {primaryVehicle.model}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono">
                        {primaryVehicle.registration} • {primaryVehicle.year}
                      </p>
                    </div>
                  </div>

                  {/* Right: Telemetry & Next Service */}
                  <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Overall Health Score
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-extrabold text-slate-900">
                            {primaryVehicle.healthScore || 92}%
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            Optimal Condition
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Odometer
                        </span>
                        <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                          {primaryVehicle.mileage || "18,420 km"}
                        </p>
                      </div>
                    </div>

                    {/* Subsystem Health Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Engine</span>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">98%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Brakes</span>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">85%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Battery</span>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">96%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tyres</span>
                        <p className="text-xs font-bold text-amber-600 mt-0.5">72%</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Next Recommended Service: <strong>28 Oct 2026</strong></span>
                      </div>
                      <Link href="/services">
                        <Button variant="outline" size="sm" rightIcon={ArrowRight}>
                          Schedule Inspection
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ACTIVE LIVE SERVICE PROGRESS BANNER */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Live Workshop Service in Progress
                    </h3>
                  </div>
                  <Badge variant="brand" size="sm" className="bg-white/10 text-white border-white/20">
                    Bay #04 • Mumbai Central
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Your <strong>BMW 3 Series M Sport</strong> is currently undergoing Stage 3 Brake & Wheel Alignment calibration. Technician Vikram S. has confirmed caliper pressure is nominal.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400">1. Check-In</span>
                    <p className="text-xs font-bold text-emerald-400">Completed</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400">2. OBD Diagnostics</span>
                    <p className="text-xs font-bold text-emerald-400">Completed</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/40 text-center">
                    <span className="text-[10px] text-blue-200">3. Repair & Service</span>
                    <p className="text-xs font-bold text-blue-300">In Progress</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400">4. Foam Wash & QA</span>
                    <p className="text-xs font-bold text-slate-400">Upcoming</p>
                  </div>
                </div>
              </div>

              {/* QUICK SERVICE PACKAGES DISCOVERY */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Popular Scheduled Maintenance
                    </h2>
                    <p className="text-xs text-slate-500">
                      Standardized transparent packages with genuine OEM parts and digital records.
                    </p>
                  </div>
                  <Link href="/services" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span>View All Services</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {servicePackages.slice(0, 3).map((pkg) => (
                    <Card key={pkg.id} hover className="flex flex-col justify-between">
                      <CardContent className="space-y-3 p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {pkg.badge || "Popular"}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {pkg.duration}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{pkg.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {pkg.description}
                        </p>
                        <div className="pt-2">
                          <span className="text-xs text-slate-400">Starting from</span>
                          <p className="text-lg font-extrabold text-slate-900">₹{pkg.price.toLocaleString("en-IN")}</p>
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Link href="/services">
                          <Button variant="primary" size="sm" className="w-full">
                            Select Package
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
