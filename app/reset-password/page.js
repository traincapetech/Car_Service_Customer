"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../../lib/auth";
import { useToast } from "../../context/ToastContext";
import { validatePassword, getPasswordStrength } from "../../lib/validation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { Lock, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from "lucide-react";

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

  useEffect(() => {
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {};
    if (!resetToken || !resetToken.trim()) {
      newErrors.resetToken = "Reset token is required";
    }

    const passErr = validatePassword(newPassword);
    if (passErr) newErrors.newPassword = passErr;

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
      toast.success("Password reset successfully! Please sign in with your new password.");
    } catch (err) {
      setServerError(
        err.message || "Failed to reset password. The reset link may be invalid or expired."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-sm mb-2">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Please choose a strong, unique password to protect your vehicles and account data.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-sm border border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Password Successfully Updated
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your password has been changed and all previous sessions have been secured.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link href="/login">
                    <Button variant="primary" size="lg" className="w-full" rightIcon={ArrowRight}>
                      Sign In with New Password
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {serverError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <Input
                  label="Reset Token"
                  id="resetToken"
                  type="text"
                  placeholder="Paste reset token"
                  value={resetToken}
                  onChange={(e) => {
                    setResetToken(e.target.value);
                    if (errors.resetToken) setErrors((prev) => ({ ...prev, resetToken: null }));
                  }}
                  error={errors.resetToken}
                  required
                  disabled={isSubmitting}
                />

                <div className="space-y-1.5">
                  <Input
                    label="New Password"
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
                    }}
                    error={errors.newPassword}
                    leftIcon={Lock}
                    required
                    disabled={isSubmitting}
                  />
                  {newPassword && (
                    <div className="pt-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1 text-slate-400">
                        <span>Strength:</span>
                        <span className={`font-semibold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  error={errors.confirmPassword}
                  leftIcon={Lock}
                  required
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                >
                  Save New Password
                </Button>
              </form>
            )}
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
        <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
          Loading reset security session...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

