"use client";

import React from "react";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Link from "next/link";
import { Car, Plus, Sparkles } from "lucide-react";

export default function GaragePlaceholderPage() {
  return (
    <CustomerShell>
      <PageHeader
        title="My Garage"
        description="Manage your registered vehicles, view digital service handbooks, and track individual health telemetry."
        badge={
          <Badge variant="blue" size="sm">
            Phase 2 Preview
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Garage" },
        ]}
      />

      <EmptyState
        icon={Car}
        title="Garage Management Module"
        description="Vehicle registration, VIN decoding, and telemetry scorecards will be activated when the Vehicle service domain is connected in upcoming steps."
        action={
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Return to Dashboard
            </Button>
          </Link>
        }
        secondaryAction={
          <Link href="/services">
            <Button variant="outline" size="sm">
              Explore Services
            </Button>
          </Link>
        }
      />
    </CustomerShell>
  );
}
