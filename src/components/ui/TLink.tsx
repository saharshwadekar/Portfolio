"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** App link. Kept as a wrapper so routing behaviour can change in one place. */
export function TLink(props: ComponentProps<typeof Link> & { href: string }) {
  return <Link {...props} />;
}
