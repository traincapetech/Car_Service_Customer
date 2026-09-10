"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Car, Fuel, Gauge, Edit2, Trash2, Calendar, Wrench } from "lucide-react";
import { FUEL_TYPES, TRANSMISSIONS } from "../../lib/vehicles";

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  if (!vehicle) return null;

  const fuelConfig = FUEL_TYPES.find((f) => f.value === vehicle.fuelType);
  const transmissionConfig = TRANSMISSIONS.find((t) => t.value === vehicle.transmission);

  const fuelLabel = fuelConfig?.label || vehicle.fuelType || "Unknown";
  const fuelBadgeVariant = fuelConfig?.badgeVariant || "neutral";
  const transmissionLabel = transmissionConfig?.label || vehicle.transmission || "Unknown";

  return (
    <Card hover className="flex flex-col justify-between overflow-hidden group">
      {/* CARD HEADER */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Car className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Model Year {vehicle.year}</span>
              </p>
            </div>
          </div>

          <Badge variant="neutral" size="sm" className="shrink-0 font-mono">
            {vehicle.year}
          </Badge>
        </div>
      </CardHeader>

      {/* CARD CONTENT / SPECS */}
      <CardContent className="space-y-3.5 py-4">
        {/* Registration Number License Plate Style */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Reg. No.
          </span>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" aria-hidden="true" />
            <span className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              {vehicle.registrationNumber}
            </span>
          </div>
        </div>

        {/* Fuel & Transmission Badges Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Fuel Type */}
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Fuel className="w-3 h-3 text-slate-400" aria-hidden="true" />
              Fuel
            </span>
            <div>
              <Badge variant={fuelBadgeVariant} size="sm" dot>
                {fuelLabel}
              </Badge>
            </div>
          </div>

          {/* Transmission */}
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" aria-hidden="true" />
              Gearbox
            </span>
            <div>
              <Badge variant="blue" size="sm">
                {transmissionLabel}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>

      {/* CARD ACTIONS */}
      <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <Link href={`/bookings/new?vehicleId=${vehicle.id}`}>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Wrench}
            aria-label={`Book service for ${vehicle.make} ${vehicle.model}`}
          >
            Book Service
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Edit2}
            onClick={() => onEdit(vehicle)}
            aria-label={`Edit ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`}
          >
            Edit
          </Button>
          <Button
            variant="subtleDanger"
            size="sm"
            leftIcon={Trash2}
            onClick={() => onDelete(vehicle)}
            aria-label={`Delete ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
