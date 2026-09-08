"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0">
            <div className="pr-4">
              {title && (
                <h3
                  id="modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id="modal-desc" className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
