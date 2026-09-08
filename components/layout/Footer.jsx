import React from "react";
import Link from "next/link";
import { Car, ShieldCheck, PhoneCall, Clock, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">AutoCare Pro</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Enterprise automotive service management platform. Delivering transparent digital diagnostics, guaranteed genuine OEM parts, certified master technicians, and complete digital service histories.
            </p>
            <div className="flex items-center gap-4 text-slate-400 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Parts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>ISO 27001 Certified</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/services" className="hover:text-white transition-colors">Periodic Maintenance</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">AC & Climate Control</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Brakes & Suspension</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Battery & Electricals</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Tyres & Wheel Care</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Ceramic & Detailing</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Portal</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Customer Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Manage Profile</Link></li>
              <li><Link href="/history" className="hover:text-white transition-colors">Service Invoices</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Account Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Concierge */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">24/7 Concierge</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 1800-209-8800 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Mon – Sun: 7:00 AM – 9:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>45 Hubs Across Metro India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 AutoCare Pro Operating System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Warranty Guidelines</a>
            <a href="#" className="hover:text-slate-300">Security Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
