// Single source of truth for every word on the site.
// Facts come from Saharsh's résumés, his GitHub repositories and the IEEE record.
// Client names are anonymised on purpose; keep them that way. DealerMatix DMS and
// Xmatix are office work at DealerMatix, named with the company's products.

/** Areas of the stack. Used for skill groups, tints and the arcade palette. */
export type AreaId = "salesforce" | "backend" | "frontend" | "fullstack" | "mobile";

export interface Area {
  id: AreaId;
  name: string;
  accent: string;
  /** Darker accent used for text on the light theme. */
  accentInk: string;
}

export const areas: Area[] = [
  { id: "salesforce", name: "Salesforce", accent: "#4DB2FF", accentInk: "#0B6FC2" },
  { id: "backend", name: "Backend", accent: "#B6F24A", accentInk: "#4E7A08" },
  { id: "frontend", name: "Frontend", accent: "#FF6B82", accentInk: "#C21E3F" },
  { id: "fullstack", name: "Full Stack", accent: "#FFB547", accentInk: "#A05A00" },
  { id: "mobile", name: "Mobile", accent: "#A68BFF", accentInk: "#5B3FD1" },
];

export const areaById = Object.fromEntries(areas.map((a) => [a.id, a])) as Record<AreaId, Area>;

export const person = {
  name: "Saharsh Wadekar",
  first: "Saharsh",
  last: "Wadekar",
  role: "Full Stack Engineer",
  location: "Pune, India",
  relocation: "Open to relocation",
  timezone: "Asia/Kolkata",
  email: "saharshwadekar@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/saharshwadekar",
    github: "https://github.com/saharshwadekar",
  },
  company: "DealerMatix Technologies",
  resume: "/resume/saharsh-wadekar-full-stack.pdf",
  /** What I'm looking for, said plainly. */
  seeking: "Full stack roles across React Native, Next.js, .NET and Salesforce, in Pune, remote, or anywhere I can relocate to.",
};

export const intro = {
  headline: "I build software for 3,000+ people a day.",
  summary:
    "Full stack engineer at DealerMatix. React Native and Next.js on the front, .NET and Salesforce Apex behind them. I ship enterprise systems for FMCG, consumer-electronics and industrial brands.",
  proof: [
    { value: "9.35", label: "Highest CGPA in my department" },
    { value: "IEEE", label: "InGARSS 2025 co-author" },
    { value: "AppExchange", label: "App listed after I took 250+ Apex classes past 90% coverage" },
  ],
};

export interface Link {
  label: string;
  href: string;
}

export interface Shot {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface Section {
  heading: string;
  body?: string;
  points?: string[];
}

export interface Project {
  slug: string;
  name: string;
  kind: string;
  period: string;
  role: string;
  /** "work" is office work at DealerMatix, not a personal project. */
  context: "work" | "side";
  stack: string[];
  area: AreaId;
  summary: string;
  /** Only numbers that can be defended in an interview. */
  stats: { value: string; label: string }[];
  glyph: "route" | "graph" | "invoice" | "rail" | "sheet";
  links?: Link[];
  /** A short left-to-right picture of how the pieces connect. */
  flow?: { label: string; detail: string }[];
  diagram?: Shot;
  shots?: Shot[];
  sections: Section[];
  /** Said up front rather than left for an interviewer to find. */
  note?: string;
}

export const projects: Project[] = [
  {
    slug: "dealermatix-dms",
    name: "DealerMatix DMS",
    kind: "Multi-tenant React Native app · office work",
    period: "2025 — Present",
    role: "Software Engineer on the 6–8 person React Native team",
    context: "work",
    stack: ["React Native", "Salesforce Apex", "LWC", "REST/SOAP", "Xcode"],
    area: "mobile",
    summary:
      "DealerMatix's field-sales app: one React Native codebase, configured per brand, that sales reps at four FMCG and consumer brands open every day, with a global engineering manufacturer as flagship partner. Salesforce Apex runs behind it.",
    stats: [
      { value: "3,000+", label: "Daily users" },
      { value: "4", label: "Brands in production" },
      { value: "iOS + Android", label: "Shipped to both stores" },
    ],
    glyph: "route",
    flow: [
      { label: "React Native app", detail: "iOS and Android, configured per brand" },
      { label: "Apex services", detail: "Incentives, orders, check-in verification" },
      { label: "Salesforce", detail: "Each brand's data and rules" },
    ],
    sections: [
      {
        heading: "The problem",
        body: "Field sales reps plan visits, take orders, log expenses, prove where they were and watch their incentives, all from a phone and often on a weak network. Every brand has its own rules for all of that, so the app has to be one product that behaves differently for each tenant.",
      },
      {
        heading: "What I built",
        points: [
          "The full frontend of a personal-care brand's app, from scratch, including client-side incentive calculation and leave management.",
          "Selfie check-in and GPS location tracking that keeps working offline.",
          "Screens for incentives and gamification, merchandising, expenses, order taking and visit planning.",
          "The Apex behind those features: incentive calculation, order processing and check-in verification.",
          "iOS and Android release builds (Xcode, IPA and APK) for each client brand.",
        ],
      },
      {
        heading: "In production",
        points: [
          "Fixed critical production bugs and improved Team Score performance for the two largest client brands.",
          "Joined as an intern in January 2025 and was converted to full time in July 2025.",
        ],
      },
    ],
  },
  {
    slug: "xmatix",
    name: "Xmatix",
    kind: "Multi-tenant business platform · office work",
    period: "Oct 2025 — Present",
    role: "Software Engineer: web and mobile modules, plus .NET domain logic",
    context: "work",
    stack: [".NET 10", "C#", "Next.js", "React 19", "TypeScript", "Ant Design", "Formily", "TanStack Query", "Expo", "React Native", "Zustand"],
    area: "backend",
    summary:
      "DealerMatix's own multi-tenant business platform: metadata-driven entities and screens, automation, integrations and a field-sales mobile app, live for three or more enterprise clients. I build its business modules on web and mobile.",
    stats: [
      { value: "360+", label: "Commits since Oct 2025" },
      { value: "3+", label: "Enterprise clients live" },
      { value: "Web + mobile", label: "Most modules shipped on both" },
    ],
    glyph: "graph",
    flow: [
      { label: "Next.js web app", detail: "Pages and widgets rendered from tenant metadata" },
      { label: ".NET services", detail: "Entities, rules and server actions" },
      { label: "Expo mobile app", detail: "The same metadata, on a phone, offline-aware" },
    ],
    sections: [
      {
        heading: "The problem",
        body: "In Xmatix each tenant defines its own entities, layouts and rules as metadata, and the web and mobile apps render from that metadata. So a feature is never one screen. It is a widget that has to work for any entity a tenant configures, on the web and on a phone, and has to stay in step on both.",
      },
      {
        heading: "Business modules (web)",
        points: [
          "Bank Reconciliation: statement mapping and a match panel for pairing bank lines with records.",
          "Inventory Console and the Product Configurator, which puts mandatory and bundled components first and recommends schemes, running on server actions.",
          "Item 360: one view of an item with its applied and eligible schemes and its alternates.",
          "Order Allocation with manual lot allocation, E-Invoice, and the GST consoles: GSTR-9C, statement reconciliation grids and GSTN sign-in.",
          "Convert Lead and Create From for every entity, and settling documents from the Open Documents widget.",
        ],
      },
      {
        heading: "Mobile app",
        points: [
          "Ported Item 360 and the activities panel (card, detail, edit) to the Expo app.",
          "A central entity-action dispatcher with one shared server-action dialog, so every entity's actions behave the same way.",
          "Inline editing of child grids, manual lot allocation, and tick-box line picking for any action dialog, with no hard-coded entity.",
          "A barcode scanner with composite labels that asks whether to skip or add when a scanned item is already on the document.",
          "While a write is pending offline, only the fields it touches are overlaid, so the rest of the record stays fresh.",
        ],
      },
      {
        heading: "Platform and backend",
        points: [
          "In the .NET domain layer: item aliases, groups, group rules and lot types, SKUs, and the tax service and tax fields on order lines.",
          "Lookup filters that can filter by a related entity on both sides of a condition, and entity lists whose rows are decided by a server action.",
          "Fixes across the formula builder, dashboard designer and reports, plus designer tests that keep the web and mobile renderers in lockstep.",
        ],
      },
    ],
  },
  {
    slug: "irctc-ticket-helper",
    name: "IRCTC Ticket Helper",
    kind: "Chrome extension · side project (unofficial)",
    period: "2026",
    role: "Solo: design, build and tests",
    context: "side",
    stack: ["TypeScript (strict)", "Chrome MV3", "Preact", "Tailwind CSS", "Vite", "Bun test"],
    area: "frontend",
    summary:
      "An unofficial Chrome extension that cuts an IRCTC booking from about 5 minutes to 1–2. It fills the Angular booking forms in milliseconds and counts down to the Tatkal window on a clock synced to IRCTC's own server, with its error bar on screen.",
    stats: [
      { value: "109", label: "Tests across 8 files" },
      { value: "±18 ms", label: "Clock error bound, from 27 samples" },
      { value: "5 → 1–2 min", label: "Booking time in my own runs" },
    ],
    glyph: "rail",
    links: [{ label: "Source on GitHub", href: "https://github.com/saharshwadekar/IRCTC" }],
    diagram: {
      src: "/work/irctc-helper/chain.svg",
      alt: "The booking chain: login, search, availability, book, fare, continue, pay and book, with the guard that holds each step",
      caption: "Every step in the chain, and the guard that holds it.",
      width: 900,
      height: 288,
    },
    shots: [
      { src: "/work/irctc-helper/ready.png", alt: "Ready tab with a server-synced countdown and per-page readiness", caption: "Ready: server-synced countdown with its error bar, and what each page can fill", width: 440, height: 560 },
      { src: "/work/irctc-helper/journey.png", alt: "Journey tab with route, date mode, quota and class", caption: "Journey: route, date mode, quota and class", width: 440, height: 560 },
      { src: "/work/irctc-helper/log.png", alt: "Log tab with timing marks and keyboard shortcuts", caption: "Log: timing marks, so you can see where the seconds went", width: 440, height: 560 },
    ],
    sections: [
      {
        heading: "The problem",
        body: "Tatkal seats go in seconds, and two things lose them. Autofill does not work on IRCTC: setting element.value changes the DOM but never reaches Angular's form model, so a field looks filled and then fails validation. And system clocks drift two to eight seconds, which is enough on its own to miss the window.",
      },
      {
        heading: "A fill that Angular accepts",
        points: [
          "Every write goes through the native prototype setter, then dispatches input, change and blur, which is what Angular's value accessor listens for.",
          "PrimeNG controls get their own handling: checkboxes are clicked through the styled box, autocompletes type and pick the suggestion, dropdowns match exact labels before substrings.",
          "Every write is read back. The toast reports \"18 fields in 12ms\", or names the field that did not land.",
          "Selectors live in one file as ordered candidate lists, with the visible label as a fallback, because IRCTC ships Angular rebuilds without notice.",
        ],
      },
      {
        heading: "A clock you can trust",
        body: "If a response was generated between local times t0 and t1 and its Date header reads second S, the true offset lies in [S − t1, S + 1000 − t0]. Intersecting those brackets across responses the browser already received narrows the offset to tens of milliseconds, without making a single extra request. A clock jump (sleep, NTP) produces a disjoint bracket, and the estimate resets instead of averaging across it.",
      },
      {
        heading: "Guards, and how it is tested",
        points: [
          "An unsolved CAPTCHA stops the chain. BOOK is never guessed: it needs both the train number and the class. Each step fires once per page.",
          "Buttons are matched on text as well as class, because IRCTC reuses one class for both \"Continue To Payment\" and \"Pay & Book\".",
          "105 tests, several pinned to trimmed copies of the real pages, because the failures they cover are silent.",
          "A dry-run trainer runs the real content script against local replicas of the forms, so the fill can be practised without touching IRCTC.",
        ],
      },
    ],
    note:
      "IRCTC's terms prohibit automated booking. The button-pressing part sits behind two separate switches with the risks written out; with both off, the extension only fills forms and leaves every press to you. The Aadhaar OTP is always typed by hand.",
  },
  {
    slug: "excel-to-salesforce",
    name: "Excel to Salesforce",
    kind: "Excel add-in and Apex REST API",
    period: "Side project",
    role: "Solo",
    context: "side",
    stack: ["VBA", "Office Ribbon XML", "Apex", "Salesforce REST"],
    area: "salesforce",
    summary:
      "An Excel add-in that puts a Salesforce tab on the ribbon: sign in, then create Quote records for Opportunities straight from a sheet, in one bulk API call.",
    stats: [],
    glyph: "sheet",
    links: [{ label: "Source on GitHub", href: "https://github.com/saharshwadekar/ExcelToSalesforce" }],
    flow: [
      { label: "Excel ribbon", detail: "VBA add-in: Login and Create Quote" },
      { label: "POST /createQuotes", detail: "JSON array of Opportunity rows" },
      { label: "Apex", detail: "One bulk insert of Quote__c" },
    ],
    sections: [
      {
        heading: "The problem",
        body: "Sales ops teams often keep Opportunity data in Excel, then create each Quote in Salesforce by hand. That is slow and easy to get wrong.",
      },
      {
        heading: "What I built",
        points: [
          "A custom ribbon tab (Office customUI XML) with Login / Logout and Create Quote buttons wired to VBA macros.",
          "An Apex @RestResource at /createQuotes that takes a JSON array of Opportunity IDs and names and inserts every Quote__c in a single DML statement, which stays well inside governor limits.",
          "It replies 201 with the new record IDs, or 400 with the DML error, so the sheet can tell the user exactly what happened.",
        ],
      },
      {
        heading: "What I'd do next",
        points: [
          "Validate each row before insert, and use Database.insert(records, false) so one bad row doesn't fail the whole batch.",
          "Add an Apex test class, and a README with setup steps and a short demo.",
        ],
      },
    ],
  },
];

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p])) as Record<string, Project>;

/** Smaller repositories: listed, not written up. */
export const more: { name: string; blurb: string; stack: string; href?: string }[] = [
  {
    name: "Text Classification",
    blurb: "Sorts BBC News articles into five topics with a Naive Bayes classifier on bag-of-words features.",
    stack: "Python · scikit-learn",
    href: "https://github.com/saharshwadekar/Text-Classification",
  },
  {
    name: "Pet Classification",
    blurb: "An image classifier trained in a notebook and served through a small Flask web app.",
    stack: "Python · Deep learning · Flask",
    href: "https://github.com/saharshwadekar/PetClassification",
  },
  {
    name: "Landmark Detection",
    blurb: "Recognises landmarks in photos. Two notebook iterations of the model.",
    stack: "Python · Deep learning",
    href: "https://github.com/saharshwadekar/LandmarkDetection",
  },
  {
    name: "Institute Management System",
    blurb: "Role-based portal for admins, teachers and students: attendance, grades and accounts. I led the backend.",
    stack: "PHP · MySQL · Tailwind",
    href: "https://github.com/saharshwadekar/Institute-management-system",
  }
];

export const experience = [
  {
    company: "DealerMatix Technologies",
    title: "Software Engineer",
    period: "Jul 2025 — Present",
    points: [
      "On the 6–8 person React Native team behind DealerMatix DMS: 3,000+ daily users across four brands.",
      "On Xmatix since October 2025, with 360+ commits across the Next.js web app, the Expo mobile app and the .NET domain layer: Bank Reconciliation, the Product Configurator, Item 360, GST and e-invoicing, and order allocation.",
      "Integrate third-party systems through MuleSoft and REST/SOAP, and validate every endpoint in Postman.",
    ],
  },
  {
    company: "DealerMatix Technologies",
    title: "Software Engineer Intern",
    period: "Jan 2025 — Jul 2025",
    points: [
      "Took 250+ Apex classes past 90% test coverage, which helped the app earn its official AppExchange listing.",
      "Built LWC modules for client-facing features, including a consumer-electronics brand's invoice generator.",
      "Built REST/SOAP integrations that keep Salesforce in sync with ERP systems, and wrote Flows and Triggers for each client brand.",
    ],
  },
];

export const education = {
  school: "St. Vincent Pallotti College of Engineering & Technology",
  city: "Nagpur, India",
  degree: "B.Tech in Computer Engineering",
  period: "2021 — 2025",
  cgpa: "9.35 / 10",
  note: "Highest CGPA in the department, 2025 batch",
};

/** The stack, grouped by layer, with where each group was actually used. */
export const stack: { area: AreaId; name: string; items: string[]; usedIn: string[] }[] = [
  {
    area: "mobile",
    name: "Mobile & web",
    items: ["React Native", "Expo", "Next.js", "React", "TypeScript", "Ant Design", "Formily", "TanStack Query", "Zustand", "Tailwind CSS"],
    usedIn: ["xmatix", "dealermatix-dms", "irctc-ticket-helper"],
  },
  {
    area: "backend",
    name: "Backend & data",
    items: [".NET", "C#", "REST / SOAP", "MuleSoft", "PostgreSQL", "MySQL", "Prisma"],
    usedIn: ["xmatix", "dealermatix-dms"],
  },
  {
    area: "salesforce",
    name: "Salesforce",
    items: ["Apex", "LWC", "Flows", "Triggers", "REST resources", "AppExchange"],
    usedIn: ["dealermatix-dms", "excel-to-salesforce"],
  },
  {
    area: "fullstack",
    name: "Shipping",
    items: ["Xcode", "iOS & Android builds", "Git", "Postman", "AWS (EC2, S3, IAM)", "Chrome MV3", "Monorepos"],
    usedIn: ["dealermatix-dms", "xmatix", "irctc-ticket-helper"],
  },
];

export const paper = {
  title: "Cloud Dynamics Modeling for Meteorological Predictions",
  venue: "2025 IEEE India Geoscience and Remote Sensing Symposium (InGARSS)",
  href: "https://ieeexplore.ieee.org/document/11583853",
  doi: "10.1109/InGARSS67683.2025.11583853",
  author: "https://ieeexplore.ieee.org/author/120488137350939",
};

export const recognition = [
  {
    tag: "Publication",
    title: "IEEE InGARSS 2025",
    body: `Co-authored “${paper.title}”, a spatiotemporal model for weather prediction.`,
    href: paper.href,
  },
  {
    tag: "Award",
    title: "Highest CGPA in Department",
    body: "Topped the 2025 Computer Engineering batch at St. Vincent Pallotti College, with 9.35 / 10.",
  },
  {
    tag: "Milestone",
    title: "Official AppExchange listing",
    body: "Took 250+ Apex classes past 90% coverage, which helped earn the app its AppExchange listing.",
  },
  {
    tag: "Scholarship",
    title: "Infocepts “Innovate for Impact”",
    body: "Received the Infocepts scholarship for innovation with impact.",
  },
  {
    tag: "Leadership",
    title: "Event Lead, Technex Hackathon",
    body: "Ran technical logistics for 300+ participants from across India.",
  },
];
