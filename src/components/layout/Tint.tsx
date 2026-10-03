"use client";

import { useLayoutEffect } from "react";
import { setState } from "@/lib/store";
import type { AreaId } from "@/content/profile";

/** Tints the page with an area's accent (or clears it) while mounted. */
export function Tint({ area }: { area: AreaId | null }) {
  useLayoutEffect(() => {
    setState({ area });
  }, [area]);
  return null;
}
