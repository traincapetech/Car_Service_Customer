"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateEmail } from "../../lib/validation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Alert from "../../components/ui/Alert";
import { Card, CardContent } from "../../components/ui/Card";
import { Car, Mail, ShieldCheck, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const sessionExpired = searchParams.get("sessionExpired");

  const { login, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isLoading, isAuthenticated, router, redirectPath]);

  const activeError = serverError || (sessionExpired ? "Your session has expired. Please sign in again with your credentials." : "");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Client-side validation
    const newErrors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email.trim(), formData.password);
      toast.success("Welcome back! Redirecting to your dashboard...");
      router.push(redirectPath);
    } catch (err) {
      setServerError(
        err.message || "Invalid email or password. Please verify your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-1 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs group-hover:bg-blue-600 transition-colors">
              <Car className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Addior Mechanics <span className="text-blue-600">PRO</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your garage telemetry, service records, and live status.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {activeError && (
              <Alert
                variant="error"
                onClose={() => setServerError("")}
              >
                {activeError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                disabled={isSubmitting}
                autoComplete="email"
                leftIcon={Mail}
              />

              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  id="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />

                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus-visible:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">Bank-Grade Security</p>
              <p className="text-[10px] text-slate-400">Encrypted JWT Sessions</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 text-left">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">Genuine OEM Parts</p>
              <p className="text-[10px] text-slate-400">Warranty Backed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
