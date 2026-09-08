"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  cancelLabel = "Cancel",
  isLoading = false,
  children,
}) {
  const isDanger = confirmVariant === "danger" || confirmVariant === "subtleDanger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showCloseButton={!isLoading}>
      <div className="space-y-4 text-left">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
              isDanger
                ? "bg-rose-100 text-rose-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Info className="w-5 h-5" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>

        {children && <div className="pt-2 text-xs text-slate-600">{children}</div>}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
