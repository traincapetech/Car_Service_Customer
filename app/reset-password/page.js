"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../../lib/auth";
import { useToast } from "../../context/ToastContext";
import { validatePassword } from "../../lib/validation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Alert from "../../components/ui/Alert";
import { Card, CardContent } from "../../components/ui/Card";
import { Car, KeyRound, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const toast = useToast();

  const [resetToken, setResetToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {};
    if (!resetToken || !resetToken.trim()) {
      newErrors.resetToken = "Password reset token is required";
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      newErrors.newPassword = passErr;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        resetToken: resetToken.trim(),
        newPassword,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully! You can now sign in.");
    } catch (err) {
      setServerError(
        err.message || "Invalid or expired reset token. Please request a new link."
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
            Create new password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Set a new secure password to restore access to your account.
          </p>
        </div>

        {/* Card */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {isSuccess ? (
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Password Reset Complete
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Your password has been updated securely. All previous active sessions have been invalidated.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/login" className="w-full block">
                    <Button variant="primary" size="md" fullWidth rightIcon={ArrowRight}>
                      Sign In with New Password
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {serverError && (
                  <Alert
                    variant="error"
                    onClose={() => setServerError("")}
                  >
                    {serverError}
                  </Alert>
                )}

                <Input
                  label="Reset Token"
                  id="resetToken"
                  type="text"
                  placeholder="Paste your reset token here"
                  value={resetToken}
                  onChange={(e) => {
                    setResetToken(e.target.value);
                    if (errors.resetToken) setErrors((prev) => ({ ...prev, resetToken: null }));
                  }}
                  error={errors.resetToken}
                  required
                  disabled={isSubmitting}
                  leftIcon={KeyRound}
                  helperText="Enter the token received via email or recovery screen."
                />

                <PasswordInput
                  label="New Password"
                  id="newPassword"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
                  }}
                  error={errors.newPassword}
                  required
                  disabled={isSubmitting}
                  showStrengthMeter={true}
                  autoComplete="new-password"
                />

                <PasswordInput
                  label="Confirm New Password"
                  id="confirmPassword"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  error={errors.confirmPassword}
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
