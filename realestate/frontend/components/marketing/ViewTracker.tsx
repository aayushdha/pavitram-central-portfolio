"use client";

import { useEffect } from "react";
import { trackPropertyView } from "@/lib/use-recently-viewed";

export function ViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    trackPropertyView(propertyId);
  }, [propertyId]);

  return null;
}
