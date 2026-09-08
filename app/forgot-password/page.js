"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "../../lib/auth";
import { validateEmail } from "../../lib/validation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { Car, Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
      if (res && res.data) {
        setDevToken(res.data);
      }
    } catch (err) {
      setError(err.message || "Unable to process request. Please try again.");
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
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Enter your registered email address and we will assist you in regaining access to your garage.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-sm border border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {isSubmitted ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Request Received
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    If an account is registered with <strong className="text-slate-800">{email}</strong>, a password reset request has been initiated.
                  </p>
                </div>

                {devToken && (
                  <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-left space-y-2 text-xs">
                    <p className="font-bold text-blue-900">Local Development Notice:</p>
                    <p className="text-slate-600 break-all text-[11px] font-mono bg-white p-2 rounded border border-blue-100">
                      {devToken}
                    </p>
                    <Link
                      href={`/reset-password?token=${devToken}`}
                      className="inline-block text-xs font-bold text-blue-700 hover:text-blue-800 underline"
                    >
                      Proceed to Reset Password with this Token →
                    </Link>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <Link href="/login">
                    <Button variant="outline" size="md" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Registered Email Address"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  leftIcon={Mail}
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Send Reset Link
                </Button>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
