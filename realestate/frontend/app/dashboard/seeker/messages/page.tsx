"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { seekerNav } from "@/lib/nav-config";
import { MessagesInbox } from "@/components/dashboard/MessagesInbox";

export default function SeekerMessagesPage() {
  return (
    <DashboardShell
      groups={seekerNav}
      pageTitle="Messages"
      pageSubtitle="Chat with owners, agents & builders"
    >
      <MessagesInbox />
    </DashboardShell>
  );
}
