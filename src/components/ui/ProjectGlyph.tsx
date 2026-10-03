import type { Project } from "@/content/profile";

// Abstract, hand-drawn SVG portraits of each project. They stand in for
// screenshots of confidential client work.

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, vectorEffect: "non-scaling-stroke" as const };

function Route() {
  return (
    <>
      {Array.from({ length: 11 }).map((_, i) =>
        Array.from({ length: 7 }).map((__, j) => (
          <circle key={`${i}-${j}`} cx={20 + i * 36} cy={20 + j * 36} r={1} fill="currentColor" opacity={0.25} />
        )),
      )}
      <rect x="150" y="40" width="100" height="180" rx="16" {...stroke} opacity={0.5} />
      <rect x="160" y="54" width="80" height="150" rx="6" {...stroke} opacity={0.25} />
      <path
        className="glyph-draw" pathLength={1}
        d="M20 200 C 80 200, 90 120, 150 130 S 230 200, 260 150 S 330 60, 370 70"
        {...stroke}
        stroke="var(--accent)"
        strokeWidth={2}
      />
      {[
        [20, 200],
        [150, 130],
        [260, 150],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={4} fill="var(--bg)" stroke="var(--accent)" strokeWidth={1.5} />
      ))}
      <path d="M370 70 m-12 0 a12 12 0 1 1 24 0 c0 10 -12 22 -12 22 s-12 -12 -12 -22z" fill="var(--accent)" />
      <circle cx="370" cy="70" r="4" fill="var(--bg)" />
      <circle className="glyph-pulse" cx="200" cy="112" r="16" {...stroke} stroke="var(--accent)" />
      <circle cx="200" cy="112" r="7" {...stroke} />
    </>
  );
}

function Graph() {
  const nodes: [number, number, string][] = [
    [50, 130, "Trigger"],
    [150, 60, "Rule"],
    [150, 200, "Rule"],
    [250, 90, "Action"],
    [250, 170, "Action"],
    [350, 130, "Record"],
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [1, 4],
    [3, 5],
    [4, 5],
  ];
  return (
    <>
      {edges.map(([a, b], i) => (
        <path
          key={i}
          className="glyph-draw" pathLength={1}
          d={`M${nodes[a][0]} ${nodes[a][1]} C ${(nodes[a][0] + nodes[b][0]) / 2} ${nodes[a][1]}, ${(nodes[a][0] + nodes[b][0]) / 2} ${nodes[b][1]}, ${nodes[b][0]} ${nodes[b][1]}`}
          {...stroke}
          opacity={0.6}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
      {nodes.map(([x, y, label], i) => (
        <g key={i}>
          <rect x={x - 34} y={y - 14} width="68" height="28" rx="14" {...stroke} fill="var(--bg)" stroke={i === 5 ? "var(--accent)" : "currentColor"} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" letterSpacing="0.5">
            {label.toUpperCase()}
          </text>
        </g>
      ))}
      <circle r="4" fill="var(--accent)">
        <animateMotion dur="3.6s" repeatCount="indefinite" path="M50 130 C 100 130, 100 60, 150 60 C 200 60, 200 90, 250 90 C 300 90, 300 130, 350 130" />
      </circle>
    </>
  );
}

function Invoice() {
  return (
    <>
      <rect x="110" y="20" width="180" height="220" rx="4" {...stroke} />
      <rect x="126" y="36" width="42" height="14" fill="var(--accent)" />
      <path d="M220 40 H274 M232 50 H274" {...stroke} opacity={0.5} />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i} opacity={0.75}>
          <path className="glyph-draw" pathLength={1} d={`M126 ${84 + i * 20} H274`} {...stroke} opacity={0.25} style={{ animationDelay: `${i * 0.1}s` }} />
          <rect x="126" y={76 + i * 20} width={40 + ((i * 37) % 60)} height="4" fill="currentColor" opacity={0.5} />
          <rect x="246" y={76 + i * 20} width="28" height="4" fill="currentColor" opacity={0.5} />
        </g>
      ))}
      <path d="M200 206 H274" {...stroke} stroke="var(--accent)" strokeWidth={2} />
      <circle className="glyph-pulse" cx="330" cy="70" r="26" {...stroke} stroke="var(--accent)" strokeDasharray="3 4" />
      <text x="330" y="74" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
        AUTO
      </text>
      <path d="M40 60 h40 M40 80 h28 M40 100 h34" {...stroke} opacity={0.35} />
    </>
  );
}

/** IRCTC Ticket Helper: a rail line into a countdown dial. */
function Rail() {
  return (
    <>
      <path d="M20 200 H250" {...stroke} opacity={0.5} />
      <path d="M20 214 H250" {...stroke} opacity={0.5} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M${28 + i * 19} 194 V220`} {...stroke} opacity={0.3} />
      ))}
      <path className="glyph-draw" pathLength={1} d="M20 207 H250" {...stroke} stroke="var(--accent)" strokeWidth={2} />
      <circle cx="310" cy="110" r="62" {...stroke} opacity={0.5} />
      <circle className="glyph-pulse" cx="310" cy="110" r="74" {...stroke} stroke="var(--accent)" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M${310 + Math.sin(a) * 52} ${110 - Math.cos(a) * 52} L${310 + Math.sin(a) * 60} ${110 - Math.cos(a) * 60}`}
            {...stroke}
            opacity={0.6}
          />
        );
      })}
      <path d="M310 110 V66" {...stroke} strokeWidth={2} />
      <path d="M310 110 L342 124" {...stroke} stroke="var(--accent)" strokeWidth={2} />
      <circle cx="310" cy="110" r="4" fill="var(--accent)" />
      <path d="M250 207 C 280 207, 290 180, 290 168" {...stroke} strokeDasharray="4 5" opacity={0.6} />
      <text x="310" y="200" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="currentColor" opacity={0.7}>
        ±18ms
      </text>
    </>
  );
}

/** Excel to Salesforce: a spreadsheet grid feeding a cloud. */
function Sheet() {
  const rows = 6;
  const cols = 4;
  return (
    <>
      <rect x="30" y="40" width="190" height="180" rx="10" {...stroke} opacity={0.6} />
      {Array.from({ length: rows - 1 }).map((_, r) => (
        <path key={`r${r}`} d={`M30 ${70 + r * 30} H220`} {...stroke} opacity={0.3} />
      ))}
      {Array.from({ length: cols - 1 }).map((_, c) => (
        <path key={`c${c}`} d={`M${77 + c * 47} 40 V220`} {...stroke} opacity={0.3} />
      ))}
      <rect x="30" y="100" width="190" height="30" fill="var(--accent)" opacity={0.18} />
      <rect className="glyph-bar" x="30" y="130" width="190" height="30" fill="var(--accent)" opacity={0.12} />
      <path className="glyph-draw" pathLength={1} d="M220 130 C 260 130, 260 110, 290 110" {...stroke} stroke="var(--accent)" strokeWidth={2} />
      <path d="M284 104 L292 110 L284 116" {...stroke} stroke="var(--accent)" strokeWidth={2} />
      <path
        d="M300 132 a22 22 0 0 1 4 -43 a30 30 0 0 1 56 -6 a22 22 0 0 1 10 49 Z"
        {...stroke}
        stroke="var(--accent)"
        strokeWidth={1.6}
      />
      <text x="336" y="120" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" opacity={0.7}>
        201
      </text>
    </>
  );
}

const glyphs = { route: Route, graph: Graph, invoice: Invoice, rail: Rail, sheet: Sheet };

export function ProjectGlyph({ glyph, className = "" }: { glyph: Project["glyph"]; className?: string }) {
  const G = glyphs[glyph];
  return (
    <svg viewBox="0 0 400 260" className={`glyph ${className}`} aria-hidden>
      <G />
    </svg>
  );
}
