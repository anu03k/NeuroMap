# NeuroMap — Developer Documentation

## What is NeuroMap?

NeuroMap is a browser-based psychology concept explorer built with React and TypeScript. It presents a top-down anatomical SVG map of the human brain. Users click on brain regions or concept dots to learn about 58 psychological and neuroscientific concepts at three levels of depth — casual, university, and research-grade. A pixel-art character walks across the map as the user navigates, turning exploration into something more like a game than a textbook.

The app is entirely front-end. There is no backend, no database, no authentication. All data lives in two JSON files in `src/data/`. It runs in the browser and can be deployed to any static host.

---

## Tech Stack

| Tool | Version | Why it's here |
|------|---------|---------------|
| React | 19 | Component model for the SVG map and panel system |
| TypeScript | 6 | Strict types across concepts, store, and components |
| Vite | 8 | Dev server and production bundler |
| Tailwind CSS v4 | 4.3 | Utility classes via `@tailwindcss/vite` plugin — no config file needed |
| Zustand | 5 | Minimal global state store (selected concept, category filter, breadcrumbs) |
| Framer Motion | 12 | Character walk animations, discovery bounce, AnimatePresence for tooltips |
| lucide-react | 1 | Icon set used in NavMenu |

Tailwind v4 works differently from v3 — there is no `tailwind.config.js`. The Vite plugin handles everything. Styles are co-located as inline style objects in components (the SVG layout requires exact pixel coordinates that utility classes can't express cleanly).

---

## Project Structure

```
src/
├── components/
│   ├── BrainMap.tsx      # Main SVG brain map + pixel character + region hotspots
│   ├── InfoPanel.tsx     # Concept detail panel (breadcrumbs, summary tiers, related concepts)
│   ├── DailyFact.tsx     # Fact panel with 4-tab category selector
│   ├── NavMenu.tsx       # Top navigation bar with category filters and difficulty toggle
│   └── AskClaude.tsx     # Placeholder for future AI Q&A integration
├── data/
│   ├── concepts.json     # 58 psychology/neuroscience concepts (the core dataset)
│   └── facts.json        # 238 standalone facts across 4 categories
├── hooks/
│   └── useConceptStore.ts  # Zustand store — all app state lives here
├── types/
│   └── concept.ts        # TypeScript interfaces: Concept, Category, Difficulty, etc.
├── App.tsx               # Root layout — BrainMap left, InfoPanel right, DailyFact below
├── index.css             # Global styles (grid background, font imports)
└── main.tsx              # React root mount
```

---

## How the App Works

### The Data Layer

Everything the app displays comes from `src/data/concepts.json`. Each concept is a JSON object with this shape:

```typescript
interface Concept {
  id: string;              // slug, e.g. "dopamine-reward-circuit"
  title: string;
  category: Category;      // one of 6 categories
  brain_region: string;    // human-readable label
  difficulty: Difficulty;  // default display level
  summary: {
    beginner: string;      // analogy + concrete example, plain language
    university: string;    // brain structures, mechanism, research area
    research: string;      // computational framing, named researcher, open question
  };
  triggers: string[];
  effects: string[];
  real_life_examples: string[];
  related_topics: string[];  // array of other concept IDs — must all resolve
  tags: string[];
  map_position: { x: number; y: number };  // percentage-based coordinates (0–100)
}
```

`map_position` is stored as percentages so it scales with the SVG canvas size (`W=600, H=450`). A concept at `{ x: 50, y: 50 }` renders at pixel `(300, 225)`.

All 58 `related_topics` arrays have been validated — every ID in any concept's `related_topics` resolves to another concept in the same file.

### The Global Store (`useConceptStore`)

Built with Zustand. There is one store with two kinds of selection:

- **`selectConcept(concept)`** — direct selection. Used by map clicks, concept dots, NavMenu random. Resets the breadcrumb trail.
- **`navigateToConcept(concept)`** — graph navigation. Used by InfoPanel related-concept clicks. Pushes the current concept onto the breadcrumb trail and sets `pendingWalkTarget`, which triggers the character walk in BrainMap.

The `pendingWalkTarget` field is the bridge between InfoPanel and BrainMap. When a user clicks a related concept in the InfoPanel, it doesn't call into BrainMap directly — it sets a store value. BrainMap watches `pendingWalkTarget` in a `useEffect` and fires the walk animation when it changes. This keeps the two components decoupled.

`filteredConcepts()` returns all concepts when no category filter is active, or the filtered subset when a category is selected from NavMenu.

### The Brain Map (`BrainMap.tsx`)

This is the largest component (~340 lines). It renders an SVG that is a top-down anatomical brain visualization, layered in this order:

1. **Cerebellum** — a separate rounded path behind the main brain body, with 5 horizontal fold lines
2. **Brain stem** — small tapered triangle at the base
3. **Main brain fill** — the outer silhouette path filled dark
4. **Lobe zone tints** — four `<rect>` elements (frontal, parietal, temporal, occipital) each with a slightly different dark color tint, all clipped to the brain outline via `<clipPath id="brain-clip">`
5. **Sulci** — 21 thin curved paths representing the major sulci and gyri (Sylvian fissure, central sulcus, intraparietal sulcus, etc.)
6. **Longitudinal fissure** — the center line dividing left and right hemispheres
7. **Brain outline** — the outer path stroked on top of all fills
8. **8 clickable region hotspots** — path or ellipse shapes with hover glow and click handlers
9. **Concept dots** — one circle per visible concept, positioned by `map_position`
10. **Tooltips** — AnimatePresence-wrapped labels on hover
11. **Pixel character** — a 16×16 grid character rendered as SVG `<rect>` cells, animated via Framer Motion's `useAnimation`

**The pixel character** cycles through 4 walk frame arrays at 8fps (125ms interval). It moves by calling `charControls.start()` which animates a `motion.div` wrapper. Arrow keys move it manually in 20px steps; clicking a region or concept calls `walkTo()` which calculates distance and sets a proportional duration (speed is always 240px/s).

**Clickable regions** (`REGIONS` array) each contain:
- `shape: 'path' | 'ellipse'` — determines which SVG element to render
- `conceptIds` — which concepts to select when clicked (takes first match in the loaded concepts array)
- `labelPos` — where the character walks to and where the tooltip appears
- `color` / `glowColor` — used for fill and the Gaussian blur glow filter

### The Info Panel (`InfoPanel.tsx`)

Renders when a concept is selected. Contains:

1. **Breadcrumb trail** — a horizontal row of concept titles showing navigation history. Clicking any breadcrumb calls `jumpToBreadcrumb(index)` which truncates the trail at that point and walks the character back.
2. **Concept header** — title, category badge, brain region label, difficulty tag
3. **Difficulty toggle** — switches between Beginner / University / Research summaries, stored in the Zustand store so it persists across concept changes
4. **Triggers and Effects** — pill badges from the concept's `triggers[]` and `effects[]` arrays
5. **Related concepts** — cards for each ID in `related_topics`. Clicking one calls `navigateToConcept()`, pushing the current concept to breadcrumbs and triggering the character walk

### The Fact Panel (`DailyFact.tsx`)

Renders below the BrainMap. Loads all 238 facts from `src/data/facts.json` and displays one at a time. Four tab buttons (Psychology / Biases / Neuroscience / Experiments) switch categories with a 150ms fade transition. The ↻ button picks a random different fact from the current category. A progress counter shows current position in the pool.

### Navigation (`NavMenu.tsx`)

The top bar provides:
- **Category filter buttons** — filters the concept dots visible on the map and chips below it
- **Difficulty toggle** — switches the summary tier shown in InfoPanel
- **Random concept** — calls `selectRandomConcept()` from the store, which picks from the filtered pool

---

## How It Was Built (From Scratch)

The project was scaffolded using `npm create vite@latest` with the React + TypeScript template. Tailwind v4 was added by installing `@tailwindcss/vite` and adding it as a Vite plugin — no PostCSS config, no `tailwind.config.js`. Zustand and Framer Motion were installed as npm packages.

**Phase 1 — Scaffold and core UI.**  
All types, the Zustand store, and the five component files were created in one pass. The initial BrainMap used a simple `<ellipse>` as the brain silhouette with 6 basic sulci lines. InfoPanel, NavMenu, and DailyFact were functional stubs.

**Phase 2 — Concept data.**  
`concepts.json` was expanded from an initial 20 concepts to 58, covering all 6 categories. Every concept was given accurate `related_topics` references (validated by script to catch broken IDs) and spread `map_position` coordinates across the canvas (X: 18–88%, Y: 14–75%).

**Phase 3 — Summary depth.**  
All 58 concept summaries were rewritten across all three tiers. The beginner tier follows a strict structure: analogy + concrete example. The university tier names specific brain structures and research areas. The research tier includes a computational or mathematical framing, a named researcher or landmark paper, and an open question still debated in the field.

**Phase 4 — Anatomical brain SVG.**  
The ellipse was replaced with a proper top-down cortical silhouette built from a single SVG cubic Bezier path. Lobe zones were added as clipped colored rectangles. The cerebellum, brain stem, and longitudinal fissure were added as separate elements. 21 sulci paths were drawn to suggest the major gyral folding pattern. All 8 clickable hotspots were repositioned to anatomically reasonable coordinates on the new shape.

**Phase 5 — Facts panel.**  
`facts.json` was created with 238 facts (62 Psychology, 62 Cognitive Biases, 62 Neuroscience, 52 Famous Experiments) — each under 40 words, each describing something counterintuitive or surprising. DailyFact.tsx was rewritten as a full tabbed panel and wired into App.tsx below the BrainMap.

---

## Running Locally

```bash
npm install
npm run dev        # starts dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

TypeScript is checked as part of the build (`tsc -b && vite build`). To type-check without building:

```bash
npx tsc --noEmit
```

---

## Deployment

The output of `npm run build` is a static `dist/` folder containing `index.html` and hashed JS/CSS assets. It can be deployed to:

- **Vercel** — drag the `dist/` folder or connect the repo, set build command to `npm run build` and output directory to `dist`
- **Netlify** — same as above
- **GitHub Pages** — use the `dist/` folder or a CI step that builds and pushes to `gh-pages`
- Any static file server (Nginx, S3 + CloudFront, Cloudflare Pages)

No environment variables, no server-side rendering, no API keys. The app has zero runtime dependencies that need to be configured.

---

## Adding a New Concept

1. Open `src/data/concepts.json`
2. Add a new object matching the `Concept` interface exactly — all fields are required
3. Set `map_position` to coordinates not already taken (check existing values; X 18–88, Y 14–75 covers the brain area)
4. Set `related_topics` to IDs of existing concepts only — run the validation script below to check
5. No code changes needed — the store loads the JSON at startup and the map renders all concepts automatically

**Validation script** (run from project root):

```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('src/data/concepts.json','utf8'));
const ids = new Set(data.map(c => c.id));
let broken = [];
data.forEach(c => {
  c.related_topics.forEach(rt => {
    if (!ids.has(rt)) broken.push(c.id + ' -> ' + rt);
  });
});
console.log(broken.length ? broken : 'All related_topics valid');
"
```

---

## Adding a New Brain Region Hotspot

Open `src/components/BrainMap.tsx` and add an entry to the `REGIONS` array:

```typescript
{
  id: 'my-region',
  label: 'My Region',
  conceptIds: ['my-concept-id'],   // must exist in concepts.json
  shape: 'ellipse',                // or 'path'
  cx: 300, cy: 200, rx: 30, ry: 20,
  labelPos: { x: 300, y: 200 },   // where character walks to
  color: 'rgba(99,102,241,0.22)',
  glowColor: '#6366f1',
}
```

For `shape: 'path'`, provide a `d` string instead of `cx/cy/rx/ry`. The region automatically gets a glow filter, hover state, click handler, and animated pulse when active — the `REGIONS` array is the only thing to change.

---

## Known Limitations

- **Bundle size**: The production bundle is ~554 kB minified (~183 kB gzipped). The bulk is framer-motion and concepts.json. Code-splitting with dynamic imports would reduce initial load if concepts.json grows large.
- **No persistence**: Selected concepts, viewed state, and unlocked concepts exist only in memory. Refreshing resets the session. Adding `localStorage` via Zustand's `persist` middleware would fix this.
- **AskClaude is a stub**: `src/components/AskClaude.tsx` exists but is not wired into the UI. It would need an API key and a backend proxy to call the Anthropic API safely from a browser.
- **Mobile layout**: The BrainMap SVG is fixed at 600×450px. On small screens it overflows its container. Responsive scaling via `viewBox` + `width: 100%` would be required for a full mobile experience.
