"use client";

import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import LandingPage from "../components/landing/LandingPage";
import CustomerDashboard from "../components/dashboard/CustomerDashboard";
import GaragePage from "../components/vehicles/GaragePage";
import BookingWizard from "../components/booking/BookingWizard";
import ServiceTracker from "../components/tracking/ServiceTracker";
import ServiceHistoryPage from "../components/history/ServiceHistoryPage";
import WorkshopDashboard from "../components/admin/WorkshopDashboard";

import { initialVehicles } from "../components/shared/MockData";

export default function Home() {
  const [activeView, setActiveView] = useState("landing");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(initialVehicles[0]);

  const handleAddVehicle = (newVehicle) => {
    setVehicles([newVehicle, ...vehicles]);
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Workspace */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <Topbar
          activeView={activeView}
          setActiveView={setActiveView}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* View Render Area */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeView === "landing" && (
            <LandingPage setActiveView={setActiveView} />
          )}

          {activeView === "dashboard" && (
            <CustomerDashboard
              vehicles={vehicles}
              setActiveView={setActiveView}
              setSelectedVehicleForBooking={setSelectedVehicleForBooking}
            />
          )}

          {activeView === "vehicles" && (
            <GaragePage
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              setActiveView={setActiveView}
              setSelectedVehicleForBooking={setSelectedVehicleForBooking}
            />
          )}

          {activeView === "booking" && (
            <BookingWizard
              vehicles={vehicles}
              preselectedVehicle={selectedVehicleForBooking}
              setActiveView={setActiveView}
            />
          )}

          {activeView === "tracking" && (
            <ServiceTracker setActiveView={setActiveView} />
          )}

          {activeView === "history" && (
            <ServiceHistoryPage />
          )}

          {activeView === "admin" && (
            <WorkshopDashboard />
          )}
        </main>

        {/* Footer */}
        <footer className="px-4 sm:px-8 py-6 border-t border-white/5 text-center text-xs text-slate-400 font-medium">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">AutoCare Pro</span>
              <span>© 2026 Enterprise Automotive Operating System.</span>
            </div>
            <div className="flex items-center gap-6 text-[11px]">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Security Audit</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Telemetry API</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
