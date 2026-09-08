"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  validateEmail,
  validateIndianPhone,
  validatePassword,
} from "../../lib/validation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Alert from "../../components/ui/Alert";
import { Card, CardContent } from "../../components/ui/Card";
import { Car, User, Mail, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));

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

    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validateIndianPhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must accept the Terms of Service to continue";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      toast.success("Account registered successfully! Welcome to AutoCare Pro.");
      router.push("/dashboard");
    } catch (err) {
      // If backend validation returns field-specific errors
      if (err.fieldErrors && typeof err.fieldErrors === "object") {
        setErrors(err.fieldErrors);
      }
      setServerError(
        err.message || "Unable to complete registration. Please check your information and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-1 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs group-hover:bg-blue-600 transition-colors">
              <Car className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              AutoCare <span className="text-blue-600">PRO</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your customer account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join thousands of car owners experiencing transparent, digital-first vehicle care.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {serverError && (
              <Alert
                variant="error"
                onClose={() => setServerError("")}
              >
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                id="name"
                type="text"
                placeholder="Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                disabled={isSubmitting}
                autoComplete="name"
                leftIcon={User}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                  leftIcon={Mail}
                />

                <Input
                  label="Phone Number"
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  helperText="10-digit Indian mobile number"
                  required
                  disabled={isSubmitting}
                  autoComplete="tel"
                  leftIcon={Phone}
                />
              </div>

              <PasswordInput
                label="Password"
                id="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                disabled={isSubmitting}
                showStrengthMeter={true}
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm Password"
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
              />

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="mt-1 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-xs text-slate-600 leading-normal">
                    I agree to the{" "}
                    <span className="font-semibold text-slate-900 underline underline-offset-2">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-slate-900 underline underline-offset-2">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.agreeTerms}
                  </p>
                )}
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
                  Create Account
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits list */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Customer Membership Benefits</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Digital service logs & invoices</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Up to 6-month OEM warranty</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Free doorstep vehicle pickup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Live stage telemetry updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
