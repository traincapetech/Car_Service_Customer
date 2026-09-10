"use client";

import React from "react";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Link from "next/link";
import { Activity, ArrowRight, Wrench } from "lucide-react";

export default function TrackingPlaceholderPage() {
  return (
    <CustomerShell>
      <PageHeader
        title="Live Repair Tracking"
        description="Real-time multi-stage workshop progress, technician assignments, digital inspection approvals, and pickup estimations."
        badge={
          <Badge variant="blue" size="sm">
            Phase 3 Preview
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Live Tracking" },
        ]}
      />

      <EmptyState
        icon={Activity}
        title="No Active Repair Job in Workshop"
        description="When your vehicle is checked in at an authorized Addior Mechanics Pro partner garage, its live bay telemetry and stage timeline will appear here in real time."
        action={
          <Link href="/services">
            <Button variant="primary" size="sm" rightIcon={ArrowRight}>
              Browse Services
            </Button>
          </Link>
        }
        secondaryAction={
          <Link href="/history">
            <Button variant="outline" size="sm">
              View Past Service Records
            </Button>
          </Link>
        }
      />
    </CustomerShell>
  );
}
