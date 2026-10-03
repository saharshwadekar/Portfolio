# Saharsh Wadekar: Portfolio

A calm, desktop-style portfolio for a full stack engineer. The home page is a desktop of widgets and folders, followed by the evidence: case studies, experience, stack, smaller repositories, recognition and contact. Three small games sit at the end as optional side quests.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Routes

| URL | View |
| --- | --- |
| `/` | Home: hero, case studies, experience, stack, more on GitHub, recognition, side quests, contact |
| `/work/[slug]` | Case study: problem, what I built, outcome, with a flow diagram and screenshots where they exist |
| `/arcade/refract` | **Refract:** route light through mirrors and prisms (5 levels) |
| `/arcade/bug-hunt` | **Bug Hunt:** squash bugs in Apex classes and ship with 90%+ coverage |
| `/arcade/stack-match` | **Stack Match:** pair each technology with what was built with it |

`/play` redirects to Refract. The old discipline URLs (`/salesforce`, `/backend`, …) redirect home.

## Easter eggs

Spoilers. Each one unlocks a secret achievement.

- **Terminal widget:** it takes real commands: `help`, `ls`, `projects`, `open irctc`, `play bug-hunt`, `cat secrets.txt`, `sudo hire saharsh`, `coffee`…
- **Konami code** (↑↑↓↓←→←→BA): spectrum mode and confetti. Enter it again to turn it off.
- **Type `hire`** anywhere outside an input: copies my email.
- **Triangle logo → "About this portfolio"**: an About This Mac-style spec sheet.
- **Tap the ID card five times:** it flips over.
- **Browser console:** a note for developers.

## Structure

```
src/content/profile.ts       every word on the site (projects, experience, stack, recognition)
src/components/lander/       desktop, widgets, dock, case folders, case study
src/components/game/         arcade: shell, Refract (engine + levels), Bug Hunt, Stack Match
src/components/layout/       menu bar, achievements/toasts, easter eggs, providers, page tint
src/lib/achievements.ts      XP, badges and toasts (stored in localStorage)
public/work/                 case-study screenshots and diagrams
```

Area accent colours are mirrored in `src/app/globals.css` (`[data-area=…]`); keep them in sync with `areas` in `profile.ts`. The résumé the site links to is `public/resume/SaharshWadekar.pdf`, exported from `resume-source/full-stack-anonymised.docx`. Client names are deliberately anonymised, on the site and in the résumé. The two office projects (DealerMatix DMS and Xmatix) are named with the company's products and list only the parts I built. `resume-source/` is not served, and `full-stack-original.docx` in it has the real client names: never move it into `public/`.

## Stack

Next.js 16 (App Router, static generation), React 19, TypeScript, Tailwind CSS v4, GSAP and Lenis. No WebGL.

**Typography.** Apple devices render SF Pro through the system font stack (SF Pro may not be bundled on the web); other devices get Inter with optical sizing. The Tailwind scale (`text-xs` to `text-7xl`) and the roles `type-hero`, `type-headline`, `type-title`, `type-subhead` and `type-eyebrow` follow Apple's sizes and line heights. Letter-spacing uses Inter's dynamic metrics by default, and Apple's SF tracking when `html.sf` is detected at load (see `globals.css`).

## Quality

- Light theme by default, with a dark theme
- Honours `prefers-reduced-motion`
- Keyboard-playable games
- JSON-LD `Person` schema, sitemap, robots and OG image

## Deploy

Deploy to Vercel and set `NEXT_PUBLIC_SITE_URL`.
