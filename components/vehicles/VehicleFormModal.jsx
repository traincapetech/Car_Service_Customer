"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { Plus, Check, Search, Car, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  validateVehicleForm,
  vehiclesApi,
  validateIndianRegistrationNumber,
  formatRegistrationNumber,
} from "../../lib/vehicles";
import { vehicleCatalogApi } from "../../lib/vehicleCatalog";
import { ApiError } from "../../lib/api";

function VehicleForm({ vehicle, onClose, onSuccess }) {
  const isEdit = Boolean(vehicle && vehicle.id);

  const [formData, setFormData] = useState(() => ({
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    year: vehicle?.year ? vehicle.year.toString() : new Date().getFullYear().toString(),
    registrationNumber: vehicle?.registrationNumber ? formatRegistrationNumber(vehicle.registrationNumber) : "",
    fuelType: vehicle?.fuelType || "PETROL",
    transmission: vehicle?.transmission || "MANUAL",
  }));

  const [brands, setBrands] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load catalog brands on mount
  useEffect(() => {
    let ignore = false;
    async function loadCatalog() {
      const brandList = await vehicleCatalogApi.getBrands();
      if (!ignore) {
        setBrands(brandList);

        if (vehicle?.make) {
          const matchedBrand = brandList.find(
            (b) =>
              b.name.toLowerCase() === vehicle.make.toLowerCase() ||
              b.normalizedName === vehicle.make.toLowerCase()
          );

          if (matchedBrand) {
            setSelectedBrandId(matchedBrand.id.toString());
            const modelsList = await vehicleCatalogApi.getModelsByBrandId(matchedBrand.id);
            if (!ignore) {
              setAvailableModels(modelsList);
              const matchedModel = modelsList.find(
                (m) => m.name.toLowerCase() === vehicle.model?.toLowerCase()
              );
              if (!matchedModel && vehicle.model) {
                setIsCustomModel(true);
              }
            }
          } else {
            setIsCustomMake(true);
          }
        }
      }
    }
    loadCatalog();
    return () => {
      ignore = true;
    };
  }, [vehicle]);

  const handleBrandSelectChange = async (brandIdValue) => {
    if (brandIdValue === "__custom__") {
      setIsCustomMake(true);
      setSelectedBrandId("");
      setAvailableModels([]);
      handleChange("make", "");
      handleChange("model", "");
      return;
    }

    setIsCustomMake(false);
    setSelectedBrandId(brandIdValue);
    setIsCustomModel(false);

    const brand = brands.find((b) => b.id.toString() === brandIdValue);
    if (brand) {
      handleChange("make", brand.name);
      handleChange("model", "");
      const models = await vehicleCatalogApi.getModelsByBrandId(brand.id);
      setAvailableModels(models);
    }
  };

  const handleModelSelectChange = (modelNameValue) => {
    if (modelNameValue === "__custom__") {
      setIsCustomModel(true);
      handleChange("model", "");
      return;
    }
    setIsCustomModel(false);
    handleChange("model", modelNameValue);
  };

  const regValidation = useMemo(() => {
    if (!formData.registrationNumber) return null;
    return validateIndianRegistrationNumber(formData.registrationNumber);
  }, [formData.registrationNumber]);

  const handleRegistrationChange = (e) => {
    const raw = e.target.value;
    const formatted = formatRegistrationNumber(raw);
    setFormData((prev) => ({ ...prev, registrationNumber: formatted }));

    if (errors.registrationNumber) {
      if (!formatted) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.registrationNumber;
          return next;
        });
      } else {
        const check = validateIndianRegistrationNumber(formatted);
        if (check.isValid) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.registrationNumber;
            return next;
          });
        }
      }
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleRegistrationBlur = () => {
    if (!formData.registrationNumber) return;
    const check = validateIndianRegistrationNumber(formData.registrationNumber);
    if (!check.isValid) {
      setErrors((prev) => ({ ...prev, registrationNumber: check.error }));
    } else {
      setFormData((prev) => ({ ...prev, registrationNumber: check.formatted }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.registrationNumber;
        return next;
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side validation
    const validation = validateVehicleForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      let savedVehicle;
      if (isEdit) {
        savedVehicle = await vehiclesApi.updateVehicle(vehicle.id, formData);
      } else {
        savedVehicle = await vehiclesApi.createVehicle(formData);
      }

      if (onSuccess) {
        onSuccess(savedVehicle, isEdit);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErrors(err.fieldErrors);
        } else {
          setGeneralError(err.message || "Failed to save vehicle details.");
        }
      } else {
        setGeneralError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {generalError && (
        <Alert variant="danger" title="Unable to Save Vehicle">
          {generalError}
        </Alert>
      )}

      {/* BRAND & MODEL SELECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Make / Brand Selector */}
        {!isCustomMake && brands.length > 0 ? (
          <FormField
            label="Make / Brand"
            id="vehicle-make-select"
            required
            error={errors.make}
          >
            <select
              id="vehicle-make-select"
              value={selectedBrandId}
              onChange={(e) => handleBrandSelectChange(e.target.value)}
              disabled={isSubmitting}
              className={`w-full rounded-xl bg-white border text-sm text-slate-900 transition-all duration-150 py-2.5 px-3.5 shadow-2xs ${
                errors.make
                  ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
                  : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed`}
            >
              <option value="">-- Select Brand ({brands.length} available) --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.modelCount} models)
                </option>
              ))}
              <option value="__custom__">Other Brand (Type manually)...</option>
            </select>
          </FormField>
        ) : (
          <div className="space-y-1">
            <Input
              id="vehicle-make"
              label="Make / Brand"
              placeholder="e.g., Maruti Suzuki, Tata Motors"
              value={formData.make}
              onChange={(e) => handleChange("make", e.target.value)}
              error={errors.make}
              required
              disabled={isSubmitting}
            />
            {brands.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomMake(false);
                  setSelectedBrandId("");
                  handleChange("make", "");
                }}
                className="text-[11px] font-medium text-blue-600 hover:underline"
              >
                ← Back to brand list
              </button>
            )}
          </div>
        )}

        {/* Model Selector */}
        {!isCustomModel && availableModels.length > 0 ? (
          <FormField
            label="Model"
            id="vehicle-model-select"
            required
            error={errors.model}
          >
            <select
              id="vehicle-model-select"
              value={formData.model}
              onChange={(e) => handleModelSelectChange(e.target.value)}
              disabled={isSubmitting}
              className={`w-full rounded-xl bg-white border text-sm text-slate-900 transition-all duration-150 py-2.5 px-3.5 shadow-2xs ${
                errors.model
                  ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
                  : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed`}
            >
              <option value="">-- Select Model ({availableModels.length} models) --</option>
              {availableModels.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} {m.bodyType ? `(${m.bodyType})` : ""}
                </option>
              ))}
              <option value="__custom__">Other Model (Type manually)...</option>
            </select>
          </FormField>
        ) : (
          <div className="space-y-1">
            <Input
              id="vehicle-model"
              label="Model"
              placeholder={availableModels.length > 0 ? "Enter model name" : "e.g., Swift, City, Nexon"}
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              error={errors.model}
              required
              disabled={isSubmitting}
            />
            {availableModels.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomModel(false);
                  handleChange("model", "");
                }}
                className="text-[11px] font-medium text-blue-600 hover:underline"
              >
                ← Back to model list
              </button>
            )}
          </div>
        )}
      </div>

      {/* YEAR & REGISTRATION NUMBER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          id="vehicle-year"
          label="Year of Manufacture"
          type="number"
          min="1900"
          max="2100"
          placeholder="e.g., 2023"
          value={formData.year}
          onChange={(e) => handleChange("year", e.target.value)}
          error={errors.year}
          required
          disabled={isSubmitting}
        />

        <div>
          <FormField
            label="Registration Number"
            id="vehicle-reg-number"
            required
            error={errors.registrationNumber}
          >
            <div className="relative flex items-center">
              {/* Indian HSRP Blue IND Badge */}
              <div
                className="absolute left-1.5 z-10 flex items-center gap-1 bg-blue-700 text-white px-2 py-1.5 rounded-lg select-none shadow-2xs"
                title="Indian High Security Registration Plate"
              >
                <span className="text-[10px] font-black tracking-widest leading-none font-mono">
                  IND
                </span>
              </div>

              <input
                id="vehicle-reg-number"
                type="text"
                placeholder="MH 02 AB 1234"
                maxLength={13}
                value={formData.registrationNumber}
                onChange={handleRegistrationChange}
                onBlur={handleRegistrationBlur}
                disabled={isSubmitting}
                required
                className={`w-full rounded-xl bg-white border text-sm font-mono font-bold tracking-wider uppercase transition-all duration-150 py-2.5 pl-14 pr-10 shadow-2xs ${
                  errors.registrationNumber
                    ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
                    : regValidation?.isValid
                    ? "border-emerald-500 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900"
                } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed`}
              />

              {/* Status Indicator Icon */}
              <div className="absolute right-3 pointer-events-none flex items-center">
                {regValidation?.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-75 duration-150" />
                ) : errors.registrationNumber ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : null}
              </div>
            </div>
          </FormField>

          {/* Validation Feedback & Helper */}
          {regValidation?.isValid ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Verified RTO Plate:{" "}
                <strong className="font-bold">{regValidation.stateName}</strong> (
                {regValidation.formatted})
              </span>
            </div>
          ) : !errors.registrationNumber ? (
            <p className="mt-1 text-[11px] text-slate-500">
              Format: <span className="font-mono font-semibold text-slate-700">MH 02 AB 1234</span> or{" "}
              <span className="font-mono font-semibold text-slate-700">22 BH 1234 AA</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* FUEL TYPE & TRANSMISSION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          label="Fuel Type"
          id="vehicle-fuel-type"
          required
          error={errors.fuelType}
        >
          <select
            id="vehicle-fuel-type"
            value={formData.fuelType}
            onChange={(e) => handleChange("fuelType", e.target.value)}
            disabled={isSubmitting}
            className={`w-full rounded-xl bg-white border text-sm text-slate-900 transition-all duration-150 py-2.5 px-3.5 shadow-2xs ${
              errors.fuelType
                ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
                : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed`}
          >
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel.value} value={fuel.value}>
                {fuel.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Transmission"
          id="vehicle-transmission"
          required
          error={errors.transmission}
        >
          <select
            id="vehicle-transmission"
            value={formData.transmission}
            onChange={(e) => handleChange("transmission", e.target.value)}
            disabled={isSubmitting}
            className={`w-full rounded-xl bg-white border text-sm text-slate-900 transition-all duration-150 py-2.5 px-3.5 shadow-2xs ${
              errors.transmission
                ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
                : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed`}
          >
            {TRANSMISSIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* MODAL FOOTER */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          leftIcon={isEdit ? Check : Plus}
        >
          {isEdit ? "Update Vehicle" : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}

export default function VehicleFormModal({ isOpen, onClose, vehicle = null, onSuccess }) {
  const isEdit = Boolean(vehicle && vehicle.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Vehicle Details" : "Add Vehicle to Garage"}
      description={
        isEdit
          ? "Update the registration, make, model, or powertrain specs of your vehicle."
          : "Select your vehicle brand and model or enter custom details to register it to your garage."
      }
      maxWidth="max-w-lg"
    >
      {isOpen && (
        <VehicleForm
          key={vehicle?.id || "new-vehicle"}
          vehicle={vehicle}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
