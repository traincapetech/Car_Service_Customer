"use client";

import React, { useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import Alert from "../ui/Alert";
import { vehiclesApi } from "../../lib/vehicles";
import { ApiError } from "../../lib/api";

export default function DeleteVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!vehicle) return null;

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");

    try {
      await vehiclesApi.deleteVehicle(vehicle.id);
      if (onSuccess) {
        onSuccess(vehicle.id);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to remove vehicle.");
      } else {
        setError("Unable to delete vehicle. Please check your connection and try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError("");
      onClose();
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete Vehicle from Garage?"
      description="Are you sure you want to remove this vehicle from your account? This action cannot be undone."
      confirmLabel="Delete Vehicle"
      confirmVariant="danger"
      cancelLabel="Keep Vehicle"
      isLoading={isDeleting}
    >
      <div className="space-y-3">
        {/* Vehicle Details Card in Dialog */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 text-sm">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </div>
          <div className="font-mono text-xs text-slate-600 uppercase">
            Reg: <span className="font-bold text-slate-900">{vehicle.registrationNumber}</span>
          </div>
        </div>

        {error && (
          <Alert variant="danger" title="Error Deleting Vehicle">
            {error}
          </Alert>
        )}
      </div>
    </ConfirmDialog>
  );
}
