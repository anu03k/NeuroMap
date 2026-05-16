import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useConceptStore } from '../hooks/useConceptStore';
import type { Concept } from '../types/concept';

// ─── Brain regions ────────────────────────────────────────────────────────────

interface BrainRegion {
  id: string;
  label: string;
  conceptIds: string[];
  shape: 'ellipse' | 'path';
  cx?: number; cy?: number; rx?: number; ry?: number;
  d?: string;
  labelPos: { x: number; y: number };
  color: string;
  glowColor: string;
}

const W = 600;
const H = 450;

// Top-down anatomical brain silhouette
const BRAIN_PATH =
  'M 300 32 C 268 30 230 38 196 53 C 160 70 126 96 104 128 ' +
  'C 82 152 74 184 74 216 C 74 252 86 284 108 312 ' +
  'C 130 340 165 360 208 372 C 240 380 270 384 300 385 ' +
  'C 330 384 360 380 392 372 C 435 360 470 340 492 312 ' +
  'C 514 284 526 252 526 216 C 526 184 518 152 498 128 ' +
  'C 476 96 442 70 404 53 C 370 38 332 30 300 32 Z';

const CEREBELLUM_PATH =
  'M 215 365 C 218 352 248 342 300 340 C 352 342 382 352 385 365 ' +
  'C 392 380 388 404 370 420 C 352 434 328 440 300 440 ' +
  'C 272 440 248 434 230 420 C 212 404 208 380 215 365 Z';

const REGIONS: BrainRegion[] = [
  {
    id: 'prefrontal',
    label: 'Prefrontal Cortex',
    conceptIds: ['prefrontal-executive-function', 'working-memory', 'default-mode-network'],
    shape: 'path',
    d: 'M 300 32 C 268 30 230 38 196 53 C 160 70 126 96 104 128 C 86 145 78 165 76 175 L 524 175 C 522 165 514 145 496 128 C 474 96 440 70 404 53 C 370 38 332 30 300 32 Z',
    labelPos: { x: 300, y: 100 },
    color: 'rgba(99,102,241,0.22)',
    glowColor: '#6366f1',
  },
  {
    id: 'parietal',
    label: 'Parietal Cortex',
    conceptIds: ['working-memory', 'mirror-neuron-empathy'],
    shape: 'path',
    d: 'M 76 175 L 524 175 C 526 205 526 238 520 268 C 515 290 506 310 494 326 L 106 326 C 94 310 85 290 80 268 C 74 238 74 205 76 175 Z',
    labelPos: { x: 300, y: 250 },
    color: 'rgba(6,182,212,0.18)',
    glowColor: '#06b6d4',
  },
  {
    id: 'hippocampus-l',
    label: 'Hippocampus (L)',
    conceptIds: ['hippocampal-memory-consolidation', 'sleep-memory-consolidation'],
    shape: 'ellipse',
    cx: 192, cy: 250, rx: 34, ry: 20,
    labelPos: { x: 192, y: 250 },
    color: 'rgba(16,185,129,0.2)',
    glowColor: '#10b981',
  },
  {
    id: 'hippocampus-r',
    label: 'Hippocampus (R)',
    conceptIds: ['hippocampal-memory-consolidation', 'sleep-memory-consolidation'],
    shape: 'ellipse',
    cx: 408, cy: 250, rx: 34, ry: 20,
    labelPos: { x: 408, y: 250 },
    color: 'rgba(16,185,129,0.2)',
    glowColor: '#10b981',
  },
  {
    id: 'amygdala-l',
    label: 'Amygdala (L)',
    conceptIds: ['amygdala-fear-response', 'cortisol-stress-response'],
    shape: 'ellipse',
    cx: 188, cy: 285, rx: 26, ry: 18,
    labelPos: { x: 188, y: 285 },
    color: 'rgba(244,63,94,0.25)',
    glowColor: '#f43f5e',
  },
  {
    id: 'amygdala-r',
    label: 'Amygdala (R)',
    conceptIds: ['amygdala-fear-response', 'cortisol-stress-response'],
    shape: 'ellipse',
    cx: 412, cy: 285, rx: 26, ry: 18,
    labelPos: { x: 412, y: 285 },
    color: 'rgba(244,63,94,0.25)',
    glowColor: '#f43f5e',
  },
  {
    id: 'nucleus-accumbens',
    label: 'Nucleus Accumbens',
    conceptIds: ['dopamine-reward-circuit', 'reward-prediction-error', 'intrinsic-motivation'],
    shape: 'ellipse',
    cx: 300, cy: 310, rx: 42, ry: 26,
    labelPos: { x: 300, y: 310 },
    color: 'rgba(245,158,11,0.22)',
    glowColor: '#f59e0b',
  },
  {
    id: 'cerebellum',
    label: 'Cerebellum',
    conceptIds: ['neuroplasticity'],
    shape: 'path',
    d: CEREBELLUM_PATH,
    labelPos: { x: 300, y: 400 },
    color: 'rgba(139,92,246,0.2)',
    glowColor: '#8b5cf6',
  },
];

// ─── Pixel character ──────────────────────────────────────────────────────────

const PALETTE: Record<number, string> = {
  1: '#e2e8f0',
  2: '#06b6d4',
  3: '#1e293b',
  4: '#334155',
  5: '#fbbf24',
  6: '#0f172a',
};

// 4 walk frames, 16×16
const FRAMES: number[][] = [
  [
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,1,2,2,2,1,1,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,0,0,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,0,0,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,0,0,3,3,3,0,0,0,0,0,
    0,0,0,0,6,6,0,0,6,6,6,0,0,0,0,0,
    0,0,0,0,6,6,0,0,6,6,6,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ],
  [
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,1,2,2,2,1,1,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,3,3,3,0,0,0,3,3,3,0,0,0,0,
    0,0,0,3,3,3,0,0,0,3,3,3,0,0,0,0,
    0,0,0,0,3,3,0,0,0,0,3,3,0,0,0,0,
    0,0,0,0,6,6,0,0,0,0,6,6,0,0,0,0,
    0,0,0,0,6,6,0,0,0,0,6,6,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ],
  [
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,1,2,2,2,1,1,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,0,0,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,0,0,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,0,0,3,3,3,0,0,0,0,0,
    0,0,0,0,6,6,0,0,6,6,6,0,0,0,0,0,
    0,0,0,0,6,6,0,0,6,6,6,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ],
  [
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,1,2,2,2,1,1,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,4,3,3,3,3,3,3,3,3,4,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,
    0,0,0,0,3,3,3,0,0,0,3,3,3,0,0,0,
    0,0,0,0,3,3,3,0,0,0,3,3,3,0,0,0,
    0,0,0,0,3,3,0,0,0,3,3,0,0,0,0,0,
    0,0,0,0,6,6,0,0,0,6,6,0,0,0,0,0,
    0,0,0,0,6,6,0,0,0,6,6,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ],
];

const CELL = 3;
const CHAR_SIZE = 16 * CELL;

function PixelCharacter({ frame, facingLeft }: { frame: number; facingLeft: boolean }) {
  const grid = FRAMES[frame % 4];
  return (
    <svg
      width={CHAR_SIZE}
      height={CHAR_SIZE}
      style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)', imageRendering: 'pixelated', display: 'block' }}
    >
      {grid.map((colorIdx, i) => {
        if (colorIdx === 0) return null;
        const col = i % 16;
        const row = Math.floor(i / 16);
        return (
          <rect
            key={i}
            x={col * CELL}
            y={row * CELL}
            width={CELL}
            height={CELL}
            fill={PALETTE[colorIdx]}
          />
        );
      })}
    </svg>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function RegionTooltip({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <rect x={x - 72} y={y - 30} width={144} height={22} rx={6}
        fill="rgba(15,15,26,0.94)" stroke="rgba(99,102,241,0.45)" strokeWidth={0.8}
      />
      <text x={x} y={y - 15} textAnchor="middle" fill="#c7d2fe"
        fontSize={10} fontFamily="system-ui,sans-serif" fontWeight={600} letterSpacing={0.4}
      >
        {label}
      </text>
    </motion.g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrainMap() {
  const { concepts, selectConcept, selectedConcept, filteredConcepts, pendingWalkTarget, clearWalkTarget } = useConceptStore();

  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [charPos, setCharPos] = useState({ x: W / 2, y: H / 2 });
  const [isWalking, setIsWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [showDiscovery, setShowDiscovery] = useState(false);

  const charControls = useAnimation();
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charPosRef = useRef(charPos);
  useEffect(() => { charPosRef.current = charPos; }, [charPos]);

  // Walk-frame ticker at 8fps
  useEffect(() => {
    if (isWalking) {
      frameIntervalRef.current = setInterval(() => setWalkFrame((f) => (f + 1) % 4), 125);
    } else {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      setWalkFrame(0);
    }
    return () => { if (frameIntervalRef.current) clearInterval(frameIntervalRef.current); };
  }, [isWalking]);

  const triggerDiscovery = useCallback(() => {
    setShowDiscovery(true);
    setTimeout(() => setShowDiscovery(false), 800);
  }, []);

  const walkTo = useCallback(async (
    x: number,
    y: number,
    opts?: { regionId?: string }
  ) => {
    const cur = charPosRef.current;
    const dx = x - cur.x;
    if (Math.abs(dx) > 4) setFacingLeft(dx < 0);

    setIsWalking(true);
    const dist = Math.hypot(x - cur.x, y - cur.y);
    const duration = Math.max(0.35, dist / 240);

    await charControls.start({
      x: x - CHAR_SIZE / 2,
      y: y - CHAR_SIZE / 2,
      transition: { duration, ease: 'easeInOut' },
    });

    setCharPos({ x, y });
    setIsWalking(false);
    triggerDiscovery();

    if (opts?.regionId) {
      const region = REGIONS.find((r) => r.id === opts.regionId);
      if (region) {
        const match = concepts.find((c) => region.conceptIds.includes(c.id));
        if (match) selectConcept(match);
      }
    }
  }, [charControls, concepts, selectConcept, triggerDiscovery]);

  const handleRegionClick = useCallback((region: BrainRegion) => {
    setActiveRegion(region.id);
    walkTo(region.labelPos.x, region.labelPos.y, { regionId: region.id });
  }, [walkTo]);

  const handleConceptClick = useCallback((concept: Concept) => {
    selectConcept(concept);
    const px = (concept.map_position.x / 100) * W;
    const py = (concept.map_position.y / 100) * H;
    walkTo(px, py);
  }, [walkTo, selectConcept]);

  // Arrow-key movement
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const step = 20;
      const cur = charPosRef.current;
      let nx = cur.x;
      let ny = cur.y;
      if (e.key === 'ArrowLeft')  { nx -= step; setFacingLeft(true); }
      if (e.key === 'ArrowRight') { nx += step; setFacingLeft(false); }
      if (e.key === 'ArrowUp')    ny -= step;
      if (e.key === 'ArrowDown')  ny += step;

      nx = Math.max(CHAR_SIZE / 2, Math.min(W - CHAR_SIZE / 2, nx));
      ny = Math.max(CHAR_SIZE / 2, Math.min(H - CHAR_SIZE / 2, ny));

      await charControls.start({
        x: nx - CHAR_SIZE / 2,
        y: ny - CHAR_SIZE / 2,
        transition: { duration: 0.08, ease: 'linear' },
      });
      setCharPos({ x: nx, y: ny });

      for (const r of REGIONS) {
        const d = Math.hypot(nx - r.labelPos.x, ny - r.labelPos.y);
        if (d < 40) {
          setActiveRegion(r.id);
          triggerDiscovery();
          const match = concepts.find((c) => r.conceptIds.includes(c.id));
          if (match) selectConcept(match);
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [charControls, concepts, selectConcept, triggerDiscovery]);

  // Set initial character position
  useEffect(() => {
    charControls.set({ x: W / 2 - CHAR_SIZE / 2, y: H / 2 - CHAR_SIZE / 2 });
  }, [charControls]);

  // React to store-initiated walks (from InfoPanel related-concept clicks / breadcrumb jumps)
  useEffect(() => {
    if (!pendingWalkTarget) return;
    const concept = pendingWalkTarget;
    clearWalkTarget();
    const px = (concept.map_position.x / 100) * W;
    const py = (concept.map_position.y / 100) * H;
    walkTo(px, py);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingWalkTarget]);

  const visible = filteredConcepts();

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>

      {/* Brain map */}
      <div
        style={{
          position: 'relative',
          width: W,
          height: H,
          maxWidth: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(99,102,241,0.14)',
          background: '#0a0a0f',
          outline: 'none',
        }}
        tabIndex={0}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            {/* Clip path for lobe zone fills */}
            <clipPath id="brain-clip">
              <path d={BRAIN_PATH} />
            </clipPath>

            {/* Glow filters for each region */}
            {REGIONS.map((r) => (
              <filter key={r.id} id={`glow-${r.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
          </defs>

          {/* ── Cerebellum (behind main brain) ── */}
          <path d={CEREBELLUM_PATH} fill="#090910" stroke="#1e2a3a" strokeWidth={1.5} />
          {/* Cerebellum fold lines */}
          <g stroke="#152030" strokeWidth={0.8} fill="none">
            <path d="M 244 352 C 264 348 282 346 300 345 C 318 346 336 348 356 352" />
            <path d="M 236 364 C 258 360 278 358 300 357 C 322 358 342 360 364 364" />
            <path d="M 228 376 C 252 372 275 370 300 369 C 325 370 348 372 372 376" />
            <path d="M 225 388 C 250 384 275 382 300 381 C 325 382 350 384 375 388" />
            <path d="M 228 400 C 252 397 276 395 300 394 C 324 395 348 397 372 400" />
          </g>

          {/* ── Brain stem ── */}
          <path d="M 287 430 Q 284 442 300 444 Q 316 442 313 430 Z" fill="#0a0a14" stroke="#1e2a3a" strokeWidth={1} />

          {/* ── Main brain base fill ── */}
          <path d={BRAIN_PATH} fill="#090916" />

          {/* ── Lobe zone tints (clipped to brain shape) ── */}
          <g clipPath="url(#brain-clip)">
            {/* Frontal lobe — dark blue */}
            <rect x="0" y="0" width="600" height="168" fill="#0d1117" opacity={0.9} />
            {/* Temporal lobe left — dark teal */}
            <rect x="0" y="112" width="205" height="210" fill="#0a1212" opacity={0.85} />
            {/* Temporal lobe right — dark teal */}
            <rect x="395" y="112" width="205" height="210" fill="#0a1212" opacity={0.85} />
            {/* Parietal lobe — dark purple */}
            <rect x="205" y="168" width="190" height="155" fill="#0d0d1a" opacity={0.9} />
            {/* Occipital lobe — dark green */}
            <rect x="0" y="323" width="600" height="100" fill="#0a110a" opacity={0.9} />
          </g>

          {/* ── Sulci fold lines ── */}
          <g stroke="#152030" strokeWidth={0.8} fill="none">
            {/* L superior frontal sulcus */}
            <path d="M 195 46 C 192 75 188 108 188 138 C 188 155 190 165 194 172" />
            {/* R superior frontal sulcus */}
            <path d="M 405 46 C 408 75 412 108 412 138 C 412 155 410 165 406 172" />
            {/* L inferior frontal sulcus */}
            <path d="M 120 110 C 138 128 152 148 160 168 C 165 178 168 188 170 198" />
            {/* R inferior frontal sulcus */}
            <path d="M 480 110 C 462 128 448 148 440 168 C 435 178 432 188 430 198" />
            {/* L central sulcus */}
            <path d="M 98 168 C 128 174 160 177 198 176 C 235 175 262 173 295 172" />
            {/* R central sulcus */}
            <path d="M 502 168 C 472 174 440 177 402 176 C 365 175 338 173 305 172" />
            {/* L postcentral sulcus */}
            <path d="M 90 198 C 124 205 160 208 198 208" />
            {/* R postcentral sulcus */}
            <path d="M 510 198 C 476 205 440 208 402 208" />
            {/* L intraparietal sulcus */}
            <path d="M 162 212 C 166 240 170 268 170 292" />
            {/* R intraparietal sulcus */}
            <path d="M 438 212 C 434 240 430 268 430 292" />
            {/* L parieto-occipital sulcus */}
            <path d="M 100 312 C 136 316 172 318 215 318" />
            {/* R parieto-occipital sulcus */}
            <path d="M 500 312 C 464 316 428 318 385 318" />
            {/* L Sylvian fissure */}
            <path d="M 108 130 C 130 158 148 188 155 220 C 158 238 158 256 156 272" />
            {/* R Sylvian fissure */}
            <path d="M 492 130 C 470 158 452 188 445 220 C 442 238 442 256 444 272" />
            {/* L occipital sulcus */}
            <path d="M 116 328 C 148 335 185 340 228 344" />
            {/* R occipital sulcus */}
            <path d="M 484 328 C 452 335 415 340 372 344" />
            {/* L frontal gyrus */}
            <path d="M 248 72 C 258 88 265 105 268 125 C 270 138 270 152 270 165" />
            {/* R frontal gyrus */}
            <path d="M 352 72 C 342 88 335 105 332 125 C 330 138 330 152 330 165" />
            {/* Transverse occipital sulcus */}
            <path d="M 200 355 C 238 360 268 363 300 364 C 332 363 362 360 400 355" />
            {/* Supplementary motor area arc */}
            <path d="M 270 42 C 274 62 278 88 280 118 C 281 135 281 152 280 165" />
            <path d="M 330 42 C 326 62 322 88 320 118 C 319 135 319 152 320 165" />
          </g>

          {/* ── Longitudinal fissure (center line) ── */}
          <path
            d="M 300 32 C 300 80 300 160 300 250 C 300 310 300 348 300 380"
            stroke="#1e2a3a" strokeWidth={1.2} fill="none"
          />

          {/* ── Brain outline (on top of fills) ── */}
          <path d={BRAIN_PATH} fill="none" stroke="#1e2a3a" strokeWidth={1.5} />

          {/* ── Clickable regions ── */}
          {REGIONS.map((region) => {
            const hovered = hoveredRegion === region.id;
            const active = activeRegion === region.id;
            const glowing = hovered || active;

            const sharedAttrs = {
              fill: glowing
                ? region.color.replace(/0\.\d+\)/, '0.4)')
                : region.color,
              stroke: glowing ? region.glowColor : region.glowColor + '55',
              strokeWidth: glowing ? 1.5 : 0.8,
              filter: glowing ? `url(#glow-${region.id})` : undefined,
              style: { cursor: 'pointer', transition: 'fill 0.2s, stroke-width 0.2s' } as React.CSSProperties,
              onMouseEnter: () => setHoveredRegion(region.id),
              onMouseLeave: () => setHoveredRegion(null),
              onClick: () => handleRegionClick(region),
            };

            const shape = region.shape === 'ellipse' ? (
              <ellipse key={region.id} cx={region.cx} cy={region.cy} rx={region.rx} ry={region.ry} {...sharedAttrs} />
            ) : (
              <path key={region.id} d={region.d} {...sharedAttrs} />
            );

            if (active) {
              return (
                <motion.g key={region.id} animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 1.8, repeat: Infinity }}>
                  {shape}
                </motion.g>
              );
            }
            return <g key={region.id}>{shape}</g>;
          })}

          {/* ── Concept dots ── */}
          {visible.map((concept) => {
            const cx = (concept.map_position.x / 100) * W;
            const cy = (concept.map_position.y / 100) * H;
            const sel = selectedConcept?.id === concept.id;
            return (
              <g key={concept.id} style={{ cursor: 'pointer' }} onClick={() => handleConceptClick(concept)}>
                <circle cx={cx} cy={cy} r={sel ? 6 : 4}
                  fill={sel ? '#6366f1' : 'rgba(99,102,241,0.45)'}
                  stroke={sel ? '#a5b4fc' : 'rgba(99,102,241,0.25)'}
                  strokeWidth={sel ? 2 : 1}
                />
                {sel && (
                  <motion.circle cx={cx} cy={cy} r={8} fill="none" stroke="#6366f1" strokeWidth={1}
                    animate={{ r: [8, 18], opacity: [0.6, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity }}
                  />
                )}
              </g>
            );
          })}

          {/* ── Tooltips ── */}
          <AnimatePresence>
            {hoveredRegion && (() => {
              const r = REGIONS.find((rg) => rg.id === hoveredRegion)!;
              return <RegionTooltip key={hoveredRegion} label={r.label} x={r.labelPos.x} y={r.labelPos.y} />;
            })()}
          </AnimatePresence>
        </svg>

        {/* Pixel character */}
        <motion.div
          animate={charControls}
          style={{ position: 'absolute', top: 0, left: 0, width: CHAR_SIZE, height: CHAR_SIZE, zIndex: 10, pointerEvents: 'none' }}
        >
          <motion.div
            animate={showDiscovery ? { y: [0, -12, 0] } : { y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <PixelCharacter frame={walkFrame} facingLeft={facingLeft} />
          </motion.div>
          <AnimatePresence>
            {showDiscovery && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -18 }}
                exit={{ opacity: 0, scale: 0 }}
                style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', fontSize: 13, pointerEvents: 'none', color: '#f59e0b' }}
              >
                ✦
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {REGIONS.filter((r) => !r.id.endsWith('-r')).map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: r.glowColor, opacity: 0.7 }} />
              <span style={{ fontSize: 9, color: '#334155', letterSpacing: '0.04em' }}>
                {r.label.replace(' (L)', '').replace('Nucleus ', '')}
              </span>
            </div>
          ))}
        </div>

        {/* Keyboard hint */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 9, color: '#1e293b' }}>
          ↑↓←→ move explorer
        </div>
      </div>

      {/* Concept chips */}
      {visible.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxWidth: W, justifyContent: 'center' }}>
          {visible.map((c) => (
            <button
              key={c.id}
              onClick={() => handleConceptClick(c)}
              style={{
                padding: '3px 9px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: selectedConcept?.id === c.id ? 'rgba(99,102,241,0.55)' : 'rgba(99,102,241,0.1)',
                background: selectedConcept?.id === c.id ? 'rgba(99,102,241,0.14)' : 'transparent',
                color: selectedConcept?.id === c.id ? '#a5b4fc' : '#334155',
                fontSize: '10px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
