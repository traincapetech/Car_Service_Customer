"use client";

import React, { useState } from "react";
import {
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { marketplaceApi } from "../../lib/marketplace";
import { useToast } from "../../context/ToastContext";

export default function AcceptPaymentModal({
  isOpen,
  onClose,
  opportunity,
  wallet,
  onPaymentSuccess,
  onOpenTopup,
}) {
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [raceLossInfo, setRaceLossInfo] = useState(null);

  if (!opportunity) return null;

  const fee = opportunity.feeSnapshot !== undefined ? Number(opportunity.feeSnapshot) : 99.00;
  const walletBalance = wallet?.balance !== undefined ? Number(wallet.balance) : 0;
  const hasSufficientWallet = walletBalance >= fee;

  const handleConfirmPayment = async () => {
    setError(null);
    setRaceLossInfo(null);

    if (paymentMethod === "RAZORPAY") {
      setError("Razorpay checkout is scheduled for Step 18E. Please select Workshop Wallet for instant claim.");
      return;
    }

    if (walletBalance < fee) {
      setError(`Insufficient wallet balance. You need ₹${fee.toFixed(2)}, but your balance is ₹${walletBalance.toFixed(2)}. Please top up your wallet.`);
      return;
    }

    setIsProcessing(true);
    const idempotencyKey = `WAL-CLAIM-${opportunity.id}-${Date.now()}`;

    try {
      const result = await marketplaceApi.payWithWallet(opportunity.id, idempotencyKey);

      if (result.paymentStatus === "REFUNDED" || result.paymentStatus === "REFUND_PENDING") {
        // Race condition: Another workshop claimed first!
        setRaceLossInfo({
          message: "Another workshop confirmed acceptance moments before your submission.",
          subtext: `Opportunity #${opportunity.requestReference || opportunity.id} has been claimed. Your ₹${fee.toFixed(2)} lead fee was automatically refunded back to your wallet.`,
        });
        toast?.info("Opportunity claimed by another workshop. Acceptance fee refunded.");
        onPaymentSuccess && onPaymentSuccess(opportunity.id, "LOST");
      } else {
        // Successfully won!
        toast?.success("Opportunity claimed successfully! Customer details unlocked.");
        onClose();
        onPaymentSuccess && onPaymentSuccess(opportunity.id, "CUSTOMER_DETAILS_UNLOCKED");
      }
    } catch (err) {
      console.error("Wallet claim error:", err);
      setError(err.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accept Service Opportunity"
      description="Review opportunity fee and select your payment method to unlock customer contact details."
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Race Condition Loss Alert */}
        {raceLossInfo && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{raceLossInfo.message}</span>
            </div>
            <p className="text-rose-700 leading-relaxed">{raceLossInfo.subtext}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
            >
              Acknowledge & Close
            </button>
          </div>
        )}

        {!raceLossInfo && (
          <>
            {/* Opportunity Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-500">
                  {opportunity.requestReference || `OPP-${opportunity.id}`}
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {opportunity.city || "Local City"}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {opportunity.vehicleSummary || "Vehicle Information"}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">Authoritative Acceptance Fee:</span>
                <span className="text-base font-black font-mono text-slate-900">
                  ₹{fee.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="danger" title="Payment Issue">
                {error}
              </Alert>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Select Payment Method
              </label>

              {/* Wallet Option */}
              <label
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "WALLET"
                    ? "border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WALLET"
                  checked={paymentMethod === "WALLET"}
                  onChange={() => setPaymentMethod("WALLET")}
                  className="mt-1 text-slate-900 focus:ring-slate-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Workshop Wallet</span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        hasSufficientWallet ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      Balance: ₹{walletBalance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Instant atomic claim. If another workshop claims first, fee is auto-refunded immediately.
                  </p>
                  {!hasSufficientWallet && (
                    <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200/90 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-medium text-rose-800">
                        <span className="font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Insufficient wallet balance
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenTopup && onOpenTopup()}
                          className="px-2 py-0.75 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add Money
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-rose-700 font-mono pt-1 border-t border-rose-200/60">
                        <span>Required: ₹{fee.toFixed(2)}</span>
                        <span>•</span>
                        <span>Available: ₹{walletBalance.toFixed(2)}</span>
                        <span>•</span>
                        <span className="font-bold">Shortfall: ₹{(fee - walletBalance).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Razorpay Option (Placeholder per prompt specifications) */}
              <label
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "RAZORPAY"
                    ? "border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900"
                    : "border-slate-200 hover:border-slate-300 opacity-80"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="mt-1 text-slate-900 focus:ring-slate-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Online Checkout (UPI / Cards)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Coming in Step 18E
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Razorpay gateway foundation prepared. Please use Workshop Wallet for instant unlock during Step 18B.
                  </p>
                </div>
              </label>
            </div>

            {/* Terms & Privacy Assurance */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                By confirming, ₹{fee.toFixed(2)} will be debited from your workshop wallet. Customer contact details will immediately unlock upon winning the atomic claim.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing || (paymentMethod === "WALLET" && !hasSufficientWallet)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Claim...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{fee.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
