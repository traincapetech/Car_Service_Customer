"use client";

import React, { useState } from "react";
import { Wallet, Plus, CheckCircle2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { marketplaceApi } from "../../lib/marketplace";
import { useToast } from "../../context/ToastContext";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function WalletTopupModal({
  isOpen,
  onClose,
  currentBalance = 0,
  onTopupSuccess,
}) {
  const toast = useToast();

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const selectedAmount = customAmount ? Number(customAmount) : amount;

  const handleTopup = async () => {
    setError(null);
    if (!selectedAmount || selectedAmount <= 0) {
      setError("Please enter a valid top-up amount greater than 0");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await marketplaceApi.topupWallet(
        selectedAmount,
        `Partner self top-up of ₹${selectedAmount}`,
        `TOP-${Date.now()}`
      );
      toast?.success(`Successfully added ₹${selectedAmount} to workshop wallet!`);
      onClose();
      onTopupSuccess && onTopupSuccess(result);
    } catch (err) {
      console.error("Top-up error:", err);
      setError(err.message || "Failed to process top-up. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Top Up Workshop Wallet"
      description="Add funds to your workshop balance to instantly claim incoming service opportunities."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {error && (
          <Alert variant="danger" title="Top-up Failed">
            {error}
          </Alert>
        )}

        {/* Current Balance Display */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Balance
              </p>
              <p className="text-xl font-black font-mono text-emerald-400">
                ₹{Number(currentBalance).toFixed(2)}
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* Preset Amount Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Select Amount (INR)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = !customAmount && amount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Or Custom Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              min="100"
              max="100000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full text-xs font-mono font-bold rounded-xl border border-slate-200 pl-7 pr-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">New Balance After Top-up:</span>
          <span className="font-bold font-mono text-slate-900 text-sm">
            ₹{(Number(currentBalance) + Number(selectedAmount || 0)).toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleTopup}
            disabled={isProcessing || selectedAmount <= 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Crediting Wallet...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add ₹{selectedAmount || 0} to Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
