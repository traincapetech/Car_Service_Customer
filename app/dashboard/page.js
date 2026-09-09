"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
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
  ChevronRight,
  Fuel,
  Gauge
} from "lucide-react";
import { vehiclesApi, FUEL_TYPES, TRANSMISSIONS } from "../../lib/vehicles";
import { servicePackages } from "../../components/shared/MockData";

export default function DashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadVehicles() {
      try {
        const data = await vehiclesApi.getVehicles();
        if (!ignore) {
          setVehicles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Failed to load customer vehicles on dashboard:", err);
      } finally {
        if (!ignore) {
          setIsLoadingVehicles(false);
        }
      }
    }
    loadVehicles();
    return () => {
      ignore = true;
    };
  }, []);

  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const fuelConfig = primaryVehicle ? FUEL_TYPES.find((f) => f.value === primaryVehicle.fuelType) : null;
  const transmissionConfig = primaryVehicle ? TRANSMISSIONS.find((t) => t.value === primaryVehicle.transmission) : null;

  return (
    <CustomerShell>
      <PageHeader
        title={`Welcome, ${user?.name || "Customer"}`}
        description="Your vehicle telemetry, diagnostic health scores, and service schedules are up to date."
        badge={
          <Badge variant="blue" size="sm" dot>
            Active Garage
          </Badge>
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/garage">
              <Button variant="outline" size="sm" leftIcon={Car}>
                My Garage
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Book Service
              </Button>
            </Link>
          </div>
        }
      />

      {/* ACTIVE VEHICLE HEALTH & SPECS CARD */}
      {isLoadingVehicles ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </Card>
      ) : primaryVehicle ? (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Vehicle Summary Card */}
            <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 flex flex-col justify-between text-white min-h-[200px]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="brand" size="sm" className="bg-white/20 text-white backdrop-blur-md">
                    Primary Vehicle
                  </Badge>
                  <Link href="/garage" className="text-xs text-blue-300 hover:text-white flex items-center gap-1 transition-colors font-medium">
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white">
                  {primaryVehicle.make} {primaryVehicle.model}
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Model Year {primaryVehicle.year}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">
                    {primaryVehicle.registrationNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Badge variant={fuelConfig?.badgeVariant || "neutral"} size="sm">
                    {fuelConfig?.label || primaryVehicle.fuelType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right: Telemetry & Next Service */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Transmission & Powertrain
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-slate-900">
                      {transmissionConfig?.label || primaryVehicle.transmission}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      • Active Profile
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Garage Total
                  </span>
                  <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                    {vehicles.length} {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
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
                  <span>Next Recommended Service: <strong>Inspection Due</strong></span>
                </div>
                <Link href="/services">
                  <Button variant="outline" size="sm" rightIcon={ArrowRight}>
                    Schedule Service
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Empty vehicle state on dashboard */
        <Card className="p-6 sm:p-8 text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Vehicle Registered</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add your car to your garage to access health scorecards, track scheduled maintenance, and book certified service packages.
            </p>
            <div className="pt-2">
              <Link href="/garage">
                <Button variant="primary" size="sm" leftIcon={Plus}>
                  Add Vehicle to Garage
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

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
          Your <strong>{primaryVehicle ? `${primaryVehicle.make} ${primaryVehicle.model}` : "Vehicle"}</strong> is currently undergoing Stage 3 Brake & Wheel Alignment calibration. Technician Vikram S. has confirmed caliper pressure is nominal.
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
    </CustomerShell>
  );
}
