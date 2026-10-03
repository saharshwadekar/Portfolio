/** Read the live theme tokens (they change with the area tint and theme). */
export function readTokens() {
  const s = getComputedStyle(document.documentElement);
  return {
    bg: s.getPropertyValue("--bg").trim() || "#f5f5f6",
    surface: s.getPropertyValue("--surface").trim() || "#ffffff",
    fg: s.getPropertyValue("--fg").trim() || "#111113",
    muted: s.getPropertyValue("--muted").trim() || "#6b6b73",
    accent: s.getPropertyValue("--accent").trim() || "#111113",
    mono: getComputedStyle(document.body).getPropertyValue("--font-geist-mono").trim().split(",")[0].replace(/['"]/g, "") || "monospace",
  };
}
