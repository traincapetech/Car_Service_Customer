"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import {
  Car,
  Wrench,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Star,
  Activity,
  Award,
  Users
} from "lucide-react";
import { servicePackages } from "../components/shared/MockData";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const categories = [
    { name: "Periodic Maintenance", count: "18 Services", price: "₹2,499", icon: Wrench },
    { name: "AC & Climate Control", count: "8 Services", price: "₹1,899", icon: Zap },
    { name: "Brakes & Suspension", count: "12 Services", price: "₹1,299", icon: Activity },
    { name: "Batteries & Power", count: "6 Services", price: "₹3,199", icon: ShieldCheck },
    { name: "Tyres & Wheel Alignment", count: "10 Services", price: "₹499", icon: Car },
    { name: "Ceramic & Detailing", count: "14 Services", price: "₹999", icon: Sparkles },
  ];

  const valueProps = [
    {
      title: "Upfront Transparent Quotes",
      desc: "Zero hidden workshop surprises. Every line-item labor charge and OEM spare part cost is pre-approved digitally on your phone.",
      icon: CheckCircle2,
    },
    {
      title: "100% Genuine OEM / OES Spares",
      desc: "All replacement parts come in factory-sealed manufacturer packaging with verified serial numbers and up to 1-year warranties.",
      icon: ShieldCheck,
    },
    {
      title: "Certified Master Mechanics",
      desc: "Factory-trained technicians utilizing advanced OBD-II electronic diagnostic scanners and automated torque calibrators.",
      icon: Award,
    },
    {
      title: "Free Doorstep Valet Pickup",
      desc: "GPS-tracked insured valet drivers safely collect your car from home or office and deliver it back sanitized and showroom-ready.",
      icon: Clock,
    },
  ];

  const steps = [
    { step: "01", title: "Select Service & Schedule", desc: "Choose your vehicle and select standardized packages with upfront fixed rates." },
    { step: "02", title: "Complimentary Pickup", desc: "Our verified valet picks up your car with a digital 360° intake inspection." },
    { step: "03", title: "Live Telemetry & Approval", desc: "Track progress live on your dashboard and approve extra recommendations with 1 tap." },
    { step: "04", title: "Doorstep Delivery & Warranty", desc: "Delivered on-time with automated GST invoice and 6-month service warranty." },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/80 via-white to-slate-50 pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Generation Automotive Operating Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Your Car Service. <br />
                <span className="text-blue-600">
                  Finally Transparent.
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                Experience hassle-free automotive maintenance with upfront fixed pricing, guaranteed genuine OEM spare parts, live workshop tracking, and complimentary doorstep valet pickup.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link href="/services">
                  <Button variant="blue" size="lg" rightIcon={ArrowRight} className="shadow-md">
                    Explore Services & Pricing
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg">
                      Go to Customer Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button variant="outline" size="lg">
                      Create Customer Account
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-xl font-extrabold text-slate-900">12,500+</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Vehicles Serviced</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">100%</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Genuine OEM Spares</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">6 Months</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Service Warranty</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-xl font-extrabold text-slate-900">4.9</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Verified Reviews</p>
                </div>
              </div>
            </div>

            {/* Right: Modern Automotive Feature Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-3">
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Mercedes Car Service"
                  className="rounded-2xl object-cover w-full h-[360px] sm:h-[420px]"
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Live Diagnostic Telemetry
                    </span>
                    <Badge variant="success" size="sm" dot>Active Bay 04</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    BMW & Mercedes certified electronic calibration hub in progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES GRID (GoMechanic Style Discovery) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="blue" size="sm" dot className="mb-2">Comprehensive Hub</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Automotive Service Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your required maintenance or repair service for instant upfront quotes.
            </p>
          </div>
          <Link href="/services">
            <Button variant="outline" size="sm" rightIcon={ArrowRight}>
              Explore All 45+ Services
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link key={i} href="/services">
                <Card hover className="p-5 text-center space-y-3 cursor-pointer group h-full flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cat.count}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Starts at</span>
                    <p className="text-xs font-bold text-slate-900">{cat.price}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* POPULAR PACKAGES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="success" size="sm">Fixed & Transparent</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured Maintenance Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered specifically to maximize vehicle longevity and maintain optimal resale value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicePackages.slice(0, 3).map((pkg) => (
            <Card key={pkg.id} hover className="flex flex-col justify-between overflow-hidden">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700">
                    {pkg.badge || "Featured"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {pkg.duration}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {pkg.inclusions?.slice(0, 3).map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">All-Inclusive</span>
                  <p className="text-xl font-extrabold text-slate-900">
                    ₹{pkg.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <Link href="/services">
                  <Button variant="primary" size="sm">
                    Book Service
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* VALUE PROPOSITION: WHY Addior Mechanics PRO */}
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="blue" size="sm" className="bg-blue-950 text-blue-300 border-blue-800">
              The Addior Mechanics Guarantee
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for Complete Peace of Mind
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              We replaced traditional workshop ambiguity with digital transparency and factory precision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="neutral" size="sm">Frictionless Experience</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Addior Mechanics Pro Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From online booking to doorstep delivery in four streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <Card key={i} className="p-6 space-y-3 relative">
              <span className="text-3xl font-black text-slate-200">{item.step}</span>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Service Your Vehicle with Confidence?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Book online in under 2 minutes. Receive complimentary doorstep valet pickup, live diagnostic updates, and OEM warranty coverage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/services">
              <Button variant="blue" size="lg" rightIcon={ArrowRight}>
                Book a Service
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/register">
                <Button variant="outline" size="lg" className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
