"use client";

import { useEffect, useState } from "react";
import { person } from "@/content/profile";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: person.timezone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Live local time in Pune. */
export function Clock({ className = "", prefix = "Pune" }: { className?: string; prefix?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={className} suppressHydrationWarning>
      {prefix} <span className="tabular-nums">{now ?? "--:--:--"}</span> IST
    </span>
  );
}
