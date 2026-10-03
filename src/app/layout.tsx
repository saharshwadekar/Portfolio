import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { person, paper } from "@/content/profile";
import { site } from "@/lib/site";
import { Providers } from "@/components/layout/Providers";
import { Nav } from "@/components/layout/Nav";
import { Toasts } from "@/components/layout/Achievements";
import { RouterBridge } from "@/components/layout/RouterBridge";
import { EasterEggs } from "@/components/layout/EasterEggs";
import { Dock } from "@/components/lander/Dock";

// SF Pro is used wherever the OS provides it (Apple devices); Inter, with optical
// sizing, is the closest open fallback everywhere else.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", axes: ["opsz"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${person.name} · ${person.role}`,
    template: `%s · ${person.name}`,
  },
  description:
    "Saharsh Wadekar is a full stack engineer in Pune: React Native and Next.js on the front, .NET and Salesforce Apex behind them, shipping enterprise software used by 3,000+ people a day.",
  keywords: ["Saharsh Wadekar", "Full Stack Engineer", "Full Stack Developer", "React Native", "Next.js", ".NET", "Salesforce Apex", "Pune"],
  authors: [{ name: person.name, url: site.url }],
  creator: person.name,
  openGraph: {
    type: "website",
    siteName: person.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
    { media: "(prefers-color-scheme: light)", color: "#efebe4" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before first paint: the saved theme, and whether SF Pro is available.
const boot = `(function(){try{var d=document.documentElement;
var t=localStorage.getItem('sw:theme');if(t!=='light'&&t!=='dark')t='light';d.dataset.theme=t;
var c=document.createElement('canvas').getContext('2d'),w='mmmmwwwlliI10';c.font='72px monospace';var m=c.measureText(w).width;c.font='72px -apple-system,BlinkMacSystemFont,monospace';if(c.measureText(w).width!==m)d.classList.add('sf');}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: site.url,
  email: `mailto:${person.email}`,
  jobTitle: person.role,
  worksFor: { "@type": "Organization", name: person.company },
  address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" },
  alumniOf: "St. Vincent Pallotti College of Engineering & Technology",
  sameAs: [person.links.linkedin, person.links.github],
  knowsAbout: ["React Native", "Next.js", "TypeScript", ".NET", "C#", "Salesforce Apex", "Lightning Web Components"],
  subjectOf: { "@type": "ScholarlyArticle", name: paper.title, url: paper.href },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-fg px-4 py-2.5 text-sm text-bg transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <RouterBridge />
          <EasterEggs />
          <Nav />
          <main id="main" className="relative">
            {children}
          </main>
          <Dock />
          <Toasts />
        </Providers>
      </body>
    </html>
  );
}
