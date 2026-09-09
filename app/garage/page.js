"use client";

import React, { useState, useEffect } from "react";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { Car, Plus, RefreshCw } from "lucide-react";
import { vehiclesApi } from "../../lib/vehicles";
import { useToast } from "../../context/ToastContext";
import VehicleCard from "../../components/vehicles/VehicleCard";
import VehicleSkeletonGrid from "../../components/vehicles/VehicleSkeleton";
import VehicleFormModal from "../../components/vehicles/VehicleFormModal";
import DeleteVehicleModal from "../../components/vehicles/DeleteVehicleModal";

export default function GaragePage() {
  const toast = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await vehiclesApi.getVehicles();
        if (!ignore) {
          setVehicles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load vehicles from server.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vehiclesApi.getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load vehicles from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedVehicle(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleVehicleSaved = (savedVehicle, isEdit) => {
    if (isEdit) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === savedVehicle.id ? savedVehicle : v))
      );
      toast.success(`${savedVehicle.make} ${savedVehicle.model} updated successfully`);
    } else {
      setVehicles((prev) => [savedVehicle, ...prev]);
      toast.success(`${savedVehicle.make} ${savedVehicle.model} added to garage`);
    }
  };

  const handleVehicleDeleted = (deletedId) => {
    const deleted = vehicles.find((v) => v.id === deletedId);
    setVehicles((prev) => prev.filter((v) => v.id !== deletedId));
    toast.success(
      deleted
        ? `${deleted.make} ${deleted.model} deleted from garage`
        : "Vehicle removed successfully"
    );
  };

  return (
    <CustomerShell>
      {/* PAGE HEADER */}
      <PageHeader
        title="My Garage"
        description="Manage your registered vehicles, fuel specifications, and transmission profiles."
        badge={
          !isLoading && (
            <Badge variant="blue" size="sm" dot>
              {vehicles.length} {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
            </Badge>
          )
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Garage" },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleOpenAddModal}
            id="add-vehicle-header-btn"
          >
            Add Vehicle
          </Button>
        }
      />

      {/* ERROR STATE BANNER */}
      {error && (
        <Alert
          variant="danger"
          title="Could Not Refresh Vehicles"
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={handleRetry}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* LOADING SKELETON */}
      {isLoading ? (
        <VehicleSkeletonGrid count={vehicles.length > 0 ? vehicles.length : 3} />
      ) : vehicles.length === 0 ? (
        /* EMPTY STATE */
        <EmptyState
          icon={Car}
          title="Your garage is empty"
          description="Register your vehicle to schedule service appointments, track repair telemetry, and manage maintenance records."
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={Plus}
              onClick={handleOpenAddModal}
              id="empty-state-add-btn"
            >
              Add Your First Vehicle
            </Button>
          }
          className="bg-white shadow-2xs py-14"
        />
      ) : (
        /* VEHICLES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      <VehicleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        vehicle={selectedVehicle}
        onSuccess={handleVehicleSaved}
      />

      {/* DELETE VEHICLE CONFIRMATION MODAL */}
      <DeleteVehicleModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        vehicle={vehicleToDelete}
        onSuccess={handleVehicleDeleted}
      />
    </CustomerShell>
  );
}
