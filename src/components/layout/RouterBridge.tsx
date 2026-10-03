"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { registerNavigator } from "@/lib/transition";
import { getLenis } from "./Providers";

const ease = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Lets non-React code (dock, keyboard, terminal) navigate with the Next router,
 * keeps smooth scroll in sync with new pages, and fades content in as it scrolls into view.
 */
export function RouterBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    registerNavigator((href) => router.push(href, { scroll: false }));
    return () => registerNavigator(null);
  }, [router]);

  useEffect(() => {
    const lenis = getLenis();
    const hash = window.location.hash.slice(1);
    // New page: measure its height, then start at the top or glide to the requested section.
    const t = window.setTimeout(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
      const el = hash ? document.getElementById(hash) : null;
      if (el) {
        if (lenis) lenis.scrollTo(el, { offset: -56, duration: 1.2, easing: ease });
        else el.scrollIntoView({ behavior: "smooth" });
      }
    }, 60);
    if (!hash) {
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }

    // Gentle scroll reveals for anything marked [data-reveal].
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (reduced || !targets.length) return () => clearTimeout(t);
    gsap.set(targets, { opacity: 0, y: 28 });
    const batch = ScrollTrigger.batch(targets, {
      start: "top 90%",
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", overwrite: true }),
    });
    return () => {
      clearTimeout(t);
      batch.forEach((b) => b.kill());
      gsap.set(targets, { clearProps: "opacity,transform" });
    };
  }, [pathname]);

  return null;
}
