"use client";

import React, { useState } from "react";
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
  Users,
  Video,
  Eye,
  Maximize2,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { servicePackages } from "../components/shared/MockData";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const heroVideoRef = React.useRef(null);

  const toggleHeroPlay = () => {
    if (heroVideoRef.current) {
      if (isHeroPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
      }
      setIsHeroPlaying(!isHeroPlaying);
    }
  };

  const toggleHeroMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !isHeroMuted;
      setIsHeroMuted(!isHeroMuted);
    }
  };

  const workShowcase = [
    {
      id: "live-service-video",
      tabLabel: "▶ 4K Service Video",
      title: "Real Workshop Service in Action (Live Footage)",
      category: "Authorized Bay Footage",
      badge: "Real Video Footage",
      video: "/videos/service-action.mp4",
      image: "/images/workshop-hero.jpg",
      description:
        "Watch authentic, unedited footage of certified master technicians servicing luxury and everyday vehicles inside authorized service bays. Using computerized diagnostics and genuine OEM replacement parts.",
      stats: [
        { label: "Quality", val: "4K / 1080p HD" },
        { label: "Location", val: "Bay 04 Main Lift" },
        { label: "Technicians", val: "Master Certified" },
        { label: "Telemetry", val: "100% Live Tracked" },
      ],
      highlights: [
        "Uncut authentic recording of mechanical operations",
        "Calibrated digital torque wrenches on all chassis bolts",
        "OBD-II ECU computer telemetry scanning during intake",
        "Detailed digital inspection report generated automatically",
      ],
      serviceUrl: "/services",
    },
    {
      id: "engine-oil",
      tabLabel: "Engine Service",
      title: "Engine Oil & Genuine Filter Service",
      category: "Periodic Maintenance",
      badge: "Most Requested",
      image: "/images/engine-oil.jpg",
      description:
        "Watch precision synthetic oil replacement using Motul & Castrol 5W-30 engine oils. Paired with OEM spin-on filters and sump plug gasket renewal to protect high-performance engines from internal friction.",
      stats: [
        { label: "Grade Used", val: "5W-30 Synthetic" },
        { label: "OEM Parts", val: "100% Certified" },
        { label: "Duration", val: "45-60 Mins" },
        { label: "Warranty", val: "10,000 KM" },
      ],
      highlights: [
        "Complete old engine oil gravity drain & flush",
        "Factory-sealed OEM oil filter cartridge swap",
        "Magnetic drain plug de-sludge & new copper washer",
        "Digital dipstick & OBD-II oil service interval reset",
      ],
      serviceUrl: "/services",
    },
    {
      id: "wheel-alignment",
      tabLabel: "3D Alignment",
      title: "3D Laser Wheel Alignment & Balancing",
      category: "Tyres & Suspension",
      badge: "Computerized Precision",
      image: "/images/wheel-alignment.jpg",
      description:
        "High-definition 3D laser cameras measure camber, caster, and toe angles in real time. We eliminate uneven tire wear, steering pull, and high-speed vibrations using automated laser telemetry.",
      stats: [
        { label: "Technology", val: "Hunter 3D Hawkeye" },
        { label: "Accuracy", val: "±0.01 Degrees" },
        { label: "Duration", val: "45 Mins" },
        { label: "Included", val: "4 Wheels + Balancing" },
      ],
      highlights: [
        "Four-wheel 3D optical target laser scanning",
        "Tie-rod adjustment for zero steering wheel offset",
        "Dynamic high-speed computerized wheel balancing",
        "Color-coded pre & post alignment digital printout",
      ],
      serviceUrl: "/services",
    },
    {
      id: "ceramic-detailing",
      tabLabel: "Ceramic Detailing",
      title: "Ceramic Coating & Deep Foam Detailing",
      category: "Paint & Interior Care",
      badge: "Showroom Gloss",
      image: "/images/ceramic-detailing.jpg",
      description:
        "Experience multi-stage paint correction with dual-action orbital polishers followed by 9H nano-ceramic hydrophobic shield application, protecting your car from UV oxidation, swirl marks, and acid rain.",
      stats: [
        { label: "Protection", val: "9H Nano Ceramic" },
        { label: "Durability", val: "Up to 3 Years" },
        { label: "Process", val: "3-Stage Correction" },
        { label: "Hydrophobic", val: "110° Water Beading" },
      ],
      highlights: [
        "pH-neutral thick active snow foam touchless wash",
        "Clay bar paint decontamination & iron fallout removal",
        "Dual-action machine swirl & scratch elimination",
        "High-gloss ceramic polymer heat-cured bonding",
      ],
      serviceUrl: "/services",
    },
    {
      id: "brake-service",
      tabLabel: "Brake Overhaul",
      title: "High-Performance Brembo Brake Overhaul",
      category: "Safety & Braking",
      badge: "Safety Certified",
      image: "/images/brake-service.jpg",
      description:
        "Complete inspection and overhaul of front and rear disc braking systems. From rotor skimming and ceramic brake pad installation to digital torque wrench calibration on caliper mounting pins.",
      stats: [
        { label: "Pads", val: "OE Ceramic Friction" },
        { label: "Torque Check", val: "Calibrated Digital" },
        { label: "Fluid", val: "DOT-4 High Boiling" },
        { label: "Warranty", val: "6 Months" },
      ],
      highlights: [
        "Ventilated rotor thickness & runout micrometer check",
        "Anti-squeal ceramic paste applied to pad backings",
        "Caliper slide pin synthetic silicone greasing",
        "Pressure bleeder fluid flush to eliminate air pockets",
      ],
      serviceUrl: "/services",
    },
  ];

  const currentWork = workShowcase[activeWorkIndex] || workShowcase[0];

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

            {/* Right: Modern Automotive Feature Visual with Real Video & Stream */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-3 group">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950">
                  <video
                    ref={heroVideoRef}
                    src="/videos/service-action.mp4"
                    poster="/images/workshop-hero.jpg"
                    autoPlay
                    loop
                    muted={isHeroMuted}
                    playsInline
                    className="w-full h-[360px] sm:h-[440px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none rounded-2xl" />

                  {/* Top Live Badge & Controls */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      4K LIVE • BAY 04 SERVICE IN ACTION
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={toggleHeroPlay}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
                        title={isHeroPlaying ? "Pause Video" : "Play Video"}
                      >
                        {isHeroPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                      </button>
                      <button
                        onClick={toggleHeroMute}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
                        title={isHeroMuted ? "Unmute Audio" : "Mute Audio"}
                      >
                        {isHeroMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action / Telemetry Card */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Real Workshop Service Stream
                      </span>
                      <Badge variant="success" size="sm" dot>Live Telemetry</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Master technicians performing multi-point electronic chassis & engine calibration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORK IN ACTION: REAL SERVICE & WORKSHOP SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>Authentic Workshop Footage & Real Service Video</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              See Certified Mechanics In Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Inspect real photographic documentation and authentic video footage from our certified service bays. Every service is backed by digital telemetry and guaranteed 100% genuine OEM spares.
            </p>
          </div>
          <Link href="/services">
            <Button variant="outline" size="sm" rightIcon={ArrowRight}>
              Explore Full Catalog
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
          {workShowcase.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveWorkIndex(idx)}
              className={`flex items-center justify-center gap-1.5 py-3 px-2.5 rounded-xl text-xs font-bold transition-all ${
                activeWorkIndex === idx
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {item.video ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              ) : (
                <Wrench className={`w-3.5 h-3.5 ${activeWorkIndex === idx ? "text-blue-600" : "text-slate-400"}`} />
              )}
              <span className="truncate">{item.tabLabel}</span>
            </button>
          ))}
        </div>

        {/* Featured Showcase Card */}
        {currentWork && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Left Column: Visual Media (Video or High-Res Image) */}
              <div className="lg:col-span-7 relative bg-slate-950 flex items-center justify-center min-h-[380px] sm:min-h-[460px] group overflow-hidden">
                {currentWork.video ? (
                  <video
                    src={currentWork.video}
                    poster={currentWork.image}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={currentWork.image}
                      alt={currentWork.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                  </>
                )}

                {/* Badges on media */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
                  <Badge variant="blue" size="sm" dot>
                    {currentWork.badge}
                  </Badge>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {currentWork.category}
                  </span>
                </div>

                {/* Enlarge Button (if photo) */}
                {!currentWork.video && (
                  <button
                    onClick={() => setLightboxImage(currentWork.image)}
                    className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Enlarge HD View</span>
                  </button>
                )}

                {/* Subtitle tag on bottom left of image */}
                {!currentWork.video && (
                  <div className="absolute bottom-4 left-4 text-white text-xs font-semibold drop-shadow-md">
                    <p className="text-white/90 text-sm font-bold">{currentWork.title}</p>
                    <p className="text-white/60 text-[11px]">Authorized Service Bay • Certified Technicians</p>
                  </div>
                )}
              </div>

              {/* Right Column: Work Breakdown & Technical Specs */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-50/40">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Standardized Protocol
                    </span>
                    <Badge variant="success" size="sm">
                      Zero Guesswork
                    </Badge>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {currentWork.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentWork.description}
                  </p>

                  {/* 4 Technical Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {currentWork.stats.map((s, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">{s.label}</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">{s.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Checklist of inclusions */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <p className="text-xs font-bold text-slate-900">Key Steps Performed:</p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {currentWork.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                  <Link href="/services" className="flex-1">
                    <Button variant="blue" size="md" fullWidth rightIcon={ArrowRight}>
                      Book This Service
                    </Button>
                  </Link>
                  <button
                    onClick={() => setLightboxImage(currentWork.image)}
                    className="p-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 transition-colors"
                    title="View Full Resolution"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL FOR FULL-RES IMAGE PREVIEW */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="High Resolution Service Bay View"
              className="max-h-[82vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/70 text-xs mt-3 text-center">
              Addior Mechanics Authorized Service Bay • Click anywhere to close
            </p>
          </div>
        </div>
      )}

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
