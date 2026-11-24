"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { navigate } from "@/lib/transition";
import { person } from "@/content/profile";
import { toggleTheme, getLenis } from "./Providers";
import { TLink } from "@/components/ui/TLink";
import { GlassKey } from "./OpeningKey";

const links = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "arcade", label: "Play" },
  { id: "contact", label: "Contact" },
];

export function goSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: 0.9, offset: -90 });
    else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  } else navigate(`/#${id}`);
}

export function Nav() {
  const theme = useStore(s => s.theme);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  if (["/arcade/relay-zero", "/arcade/orbit-rush"].includes(pathname)) return null;
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <TLink href="/" className="brand" aria-label="Saharsh Wadekar home">
          <GlassKey variant="header" />
          <span>Saharsh<span className="brand-surname"> Wadekar</span><small>Engineer & builder</small></span>
        </TLink>
        <nav className="desktop-links" aria-label="Main navigation">
          {links.map(l => <button key={l.id} onClick={() => goSection(l.id)}>{l.label}</button>)}
        </nav>
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
          </button>
          <a href={person.resume} target="_blank" rel="noreferrer" className="header-resume">Résumé</a>
          <button className="mobile-menu-button" aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button>
        </div>
      </div>
      {menu && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
        {links.map(l => <button key={l.id} onClick={() => { goSection(l.id); setMenu(false); }}>{l.label}</button>)}
      </nav>}
    </header>
  );
}
