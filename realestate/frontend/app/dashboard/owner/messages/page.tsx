"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { MessagesInbox } from "@/components/dashboard/MessagesInbox";

export default function OwnerMessagesPage() {
  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="Messages"
      pageSubtitle="Chat with interested seekers, with call masking"
    >
      <MessagesInbox />
    </DashboardShell>
  );
}
