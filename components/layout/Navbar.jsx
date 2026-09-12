"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Wrench,
  User,
  LogOut,
  LayoutDashboard,
  History,
  Menu,
  X,
  ChevronDown,
  Car,
  Activity,
  ShieldCheck,
  Store,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
      setUserDropdownOpen(false);
    }
  };

  const isPartnerOrAdmin = isAuthenticated && (user?.role === "PARTNER" || user?.role === "ADMIN");

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    ...(isPartnerOrAdmin
      ? [{ label: "Marketplace", href: "/marketplace" }]
      : []),
    ...(isAuthenticated
      ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Garage", href: "/garage" },
        { label: "Live Tracking", href: "/tracking" },
        { label: "History", href: "/history" },
      ]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white shadow-2xs group-hover:bg-blue-600 transition-colors">
              <Car className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Addior Mechanics
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                PRO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isActive
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pl-2.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                      {user?.name || "Customer"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge variant="blue" size="sm" dot>
                          {user?.role || "CUSTOMER"}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      {isPartnerOrAdmin && (
                        <Link
                          href="/marketplace"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50/60 hover:bg-blue-100/70 transition-colors border-b border-blue-100"
                        >
                          <Store className="w-4 h-4 text-blue-600" />
                          <span>Workshop Marketplace</span>
                        </Link>
                      )}

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard Overview</span>
                      </Link>

                      <Link
                        href="/garage"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Car className="w-4 h-4 text-slate-400" />
                        <span>My Garage</span>
                      </Link>

                      <Link
                        href="/tracking"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span>Live Repair Tracking</span>
                      </Link>

                      <Link
                        href="/history"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <History className="w-4 h-4 text-slate-400" />
                        <span>Service History</span>
                      </Link>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Security</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-md">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${pathname === "/profile"
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  Profile & Security
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-slate-100">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-3 py-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <Badge variant="blue" size="sm" dot>
                      {user?.role || "CUSTOMER"}
                    </Badge>
                  </div>
                  <Button
                    variant="subtleDanger"
                    size="sm"
                    fullWidth
                    leftIcon={LogOut}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" size="sm" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button variant="primary" size="sm" fullWidth>
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Addior Mechanics Pro?"
        description="Your current session will be closed on this device. You will need to sign in again to access your dashboard and garage."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
