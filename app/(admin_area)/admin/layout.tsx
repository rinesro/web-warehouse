import React from "react";
import { auth } from "@/auth";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <DashboardLayoutClient user={session?.user}>
      {children}
    </DashboardLayoutClient>
  );
}
