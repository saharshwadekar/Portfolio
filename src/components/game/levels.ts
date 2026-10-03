import type { Cell, Level, Piece } from "./engine";

const at = (x: number, y: number, piece: Piece): Cell => ({ x, y, piece });
const src = (x: number, y: number, dir: 0 | 1 | 2 | 3) => at(x, y, { kind: "source", dir });
const mir = (x: number, y: number, orient: "/" | "\\", locked = false) => at(x, y, { kind: "mirror", orient, locked });
const spl = (x: number, y: number, orient: "/" | "\\") => at(x, y, { kind: "splitter", orient });
const wall = (x: number, y: number) => at(x, y, { kind: "wall" });

// Five levels, one per area. Each target is named after something real
// from my work; clearing a level unlocks a fact about it.

export const levels: Level[] = [
  {
    id: 1,
    area: "salesforce",
    title: "Hello, Apex",
    brief: "Refract white light into Salesforce blue and guide it to AppExchange. Click a mirror to flip it.",
    unlock: "I took 250+ Apex classes past 90% test coverage, which helped earn our app its official AppExchange listing.",
    cols: 9,
    rows: 6,
    cells: [
      src(0, 1, 0),
      at(2, 1, { kind: "prism", color: "salesforce" }),
      mir(6, 1, "/"),
      mir(6, 4, "\\"),
      at(2, 4, { kind: "target", color: "salesforce", label: "AppExchange" }),
      wall(4, 3),
      wall(8, 0),
    ],
  },
  {
    id: 2,
    area: "backend",
    title: "Integration",
    brief: "One request, two systems. A splitter lets light pass through and reflect at the same time. Sync Salesforce and the ERP.",
    unlock: "I build REST/SOAP integrations and MuleSoft connections that keep Salesforce in sync with external ERP systems.",
    cols: 9,
    rows: 6,
    cells: [
      src(0, 2, 0),
      at(1, 2, { kind: "prism", color: "backend" }),
      spl(4, 2, "\\"),
      mir(6, 2, "/"),
      at(4, 0, { kind: "target", color: "backend", label: "Salesforce" }),
      at(6, 5, { kind: "target", color: "backend", label: "ERP" }),
      wall(4, 5),
      mir(2, 4, "/", true),
      wall(8, 3),
    ],
  },
  {
    id: 3,
    area: "frontend",
    title: "Pixel Perfect",
    brief: "From design file to production. Colour matters: a blue beam won't light a coral target.",
    unlock: "I turn Figma designs into metadata-driven Next.js widgets for Xmatix and React Native screens used by 3,000+ people daily.",
    cols: 9,
    rows: 6,
    cells: [
      src(0, 0, 1),
      mir(0, 1, "/"),
      at(2, 1, { kind: "prism", color: "frontend" }),
      mir(3, 1, "/"),
      mir(3, 3, "/"),
      spl(5, 3, "/"),
      at(6, 3, { kind: "target", color: "frontend", label: "Figma" }),
      at(5, 5, { kind: "target", color: "frontend", label: "Production" }),
      at(5, 0, { kind: "prism", color: "salesforce" }),
      wall(1, 4),
      wall(7, 5),
    ],
  },
  {
    id: 4,
    area: "fullstack",
    title: "Every Layer",
    brief: "Light the UI, the API and the database with a single beam. Two splitters, four decisions.",
    unlock: "From the React Native screen to the .NET services behind it: I've shipped every layer for leading Fast-Moving Consumer Goods (FMCG), consumer-electronics and industrial brands.",
    cols: 9,
    rows: 6,
    cells: [
      src(0, 5, 0),
      at(1, 5, { kind: "prism", color: "fullstack" }),
      spl(3, 5, "\\"),
      mir(3, 3, "\\"),
      spl(6, 5, "\\"),
      mir(6, 1, "/"),
      at(8, 5, { kind: "target", color: "fullstack", label: "Database" }),
      at(8, 3, { kind: "target", color: "fullstack", label: "API" }),
      at(0, 1, { kind: "target", color: "fullstack", label: "UI" }),
      wall(1, 2),
      wall(5, 0),
      mir(8, 0, "/"),
    ],
  },
  {
    id: 5,
    area: "mobile",
    title: "Offline First",
    brief: "Two colours from one source: GPS data in violet, the sync in Salesforce blue. Route both through the field.",
    unlock: "I build offline-capable GPS tracking and selfie check-ins in React Native, shipped to iOS and Android for multiple brands.",
    cols: 9,
    rows: 6,
    cells: [
      src(4, 0, 1),
      spl(4, 1, "/"),
      at(4, 2, { kind: "prism", color: "mobile" }),
      mir(4, 4, "/"),
      at(8, 4, { kind: "target", color: "mobile", label: "GPS" }),
      at(6, 1, { kind: "prism", color: "salesforce" }),
      mir(7, 1, "/"),
      at(7, 3, { kind: "target", color: "salesforce", label: "Sync" }),
      wall(2, 2),
      wall(1, 3),
      wall(6, 3),
      mir(1, 5, "\\"),
    ],
  },
];
