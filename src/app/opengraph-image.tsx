import { ImageResponse } from "next/og";
import { person } from "@/content/profile";

export const alt = `${person.name}, ${person.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0c",
          color: "#ece8e1",
          padding: 64,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#8b8780", letterSpacing: 2 }}>
          <span>PORTFOLIO · 2026</span>
          <span>PUNE, INDIA</span>
        </div>
        <div style={{ position: "absolute", right: 90, top: 150, display: "flex" }}>
          <svg width="260" height="215" viewBox="0 0 48 40" fill="none">
            <path d="M24 7H12L5 15l15 10-7 8H3" stroke="#e7efff" strokeWidth="4" />
            <path d="m22 14 5 19 8-13 5 13 6-26" stroke="#e7efff" strokeWidth="4" />
            <path d="M27 7h6" stroke="#8aa6ff" strokeWidth="4" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -6, lineHeight: 0.9 }}>Saharsh</div>
          <div style={{ fontSize: 132, fontStyle: "italic", letterSpacing: -4, lineHeight: 0.95 }}>Wadekar</div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 34, fontWeight: 600 }}>{person.role}</div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 24, color: "#8b8780" }}>
            React Native · Next.js · .NET · Salesforce Apex · 3,000+ daily users
          </div>
        </div>
      </div>
    ),
    size,
  );
}
