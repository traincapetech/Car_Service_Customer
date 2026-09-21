"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuditLogsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/audit");
  }, [router]);

  return null;
}
