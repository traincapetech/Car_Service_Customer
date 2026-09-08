"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4500) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              item.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : item.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : item.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {item.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {item.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {item.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="flex-1 text-xs font-medium leading-relaxed">{item.message}</p>
            <button
              onClick={() => removeToast(item.id)}
              className="p-1 rounded-md text-current opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
