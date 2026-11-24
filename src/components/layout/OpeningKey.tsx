"use client";

import { useEffect, useState } from "react";
import BerylCap from "./BerylCap";
import styles from "./OpeningKey.module.css";

export function GlassKey({ variant }: { variant: "opening" | "header" }) {
  return (
    <div className={styles[variant]} aria-hidden="true">
      <BerylCap
        mark="/brand/sw.png"
        legend=""
        background="transparent"
      />
    </div>
  );
}

export function OpeningKey() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1250);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay} aria-hidden="true" onAnimationEnd={() => setVisible(false)}>
      <GlassKey variant="opening" />
    </div>
  );
}
