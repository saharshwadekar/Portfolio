import { ImageResponse } from "next/og";
import { areas, person } from "@/content/profile";

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
          <svg width="420" height="300" viewBox="0 0 420 300">
            <line x1="0" y1="190" x2="150" y2="160" stroke="#ffffff" strokeWidth="3" />
            {areas.map((l, i) => (
              <polygon key={l.id} points={`200,158 420,${40 + i * 50} 420,${80 + i * 50}`} fill={l.accent} opacity="0.75" />
            ))}
            <polygon points="180,50 260,200 100,200" fill="none" stroke="#ece8e1" strokeOpacity="0.7" strokeWidth="2" />
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
