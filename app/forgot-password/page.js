"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "../../lib/auth";
import { validateEmail } from "../../lib/validation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import { Card, CardContent } from "../../components/ui/Card";
import { Car, Mail, ArrowLeft, CheckCircle2, KeyRound, Copy, Check, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [copied, setCopied] = useState(false);

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
      setError(err.message || "Unable to process password reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    if (!devToken) return;
    navigator.clipboard.writeText(devToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Reset your password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {/* Card */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {isSubmitted ? (
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Reset Instructions Sent
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    If an active account exists for <span className="font-semibold text-slate-900">{email}</span>, a secure password reset token has been generated.
                  </p>
                </div>

                {/* Development helper card */}
                {devToken && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-left space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                        Development Reset Token
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 focus:outline-none"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-blue-200/80 font-mono text-xs text-slate-800 break-all select-all">
                      {devToken}
                    </div>

                    <Link
                      href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                      className="w-full block"
                    >
                      <Button
                        variant="blue"
                        size="sm"
                        fullWidth
                        rightIcon={ArrowRight}
                      >
                        Proceed to Reset Password
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Link href={`/reset-password`}>
                    <Button variant="outline" size="sm" fullWidth>
                      Enter Reset Token Manually
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setDevToken(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 py-1"
                  >
                    Try another email address
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <Alert variant="error" onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                <Input
                  label="Registered Email Address"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                  leftIcon={Mail}
                  helperText="We will look up your account and generate a recovery token."
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
                    Request Password Reset
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
