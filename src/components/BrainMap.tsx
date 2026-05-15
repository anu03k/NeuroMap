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

const REGIONS: BrainRegion[] = [
  {
    id: 'prefrontal',
    label: 'Prefrontal Cortex',
    conceptIds: ['prefrontal-executive-function', 'working-memory', 'default-mode-network'],
    shape: 'path',
    d: 'M 200 60 C 200 30 240 18 300 18 C 360 18 400 30 400 60 C 420 75 430 95 428 115 C 420 130 390 140 350 145 L 300 148 L 250 145 C 210 140 180 130 172 115 C 170 95 180 75 200 60 Z',
    labelPos: { x: 300, y: 85 },
    color: 'rgba(99,102,241,0.22)',
    glowColor: '#6366f1',
  },
  {
    id: 'parietal',
    label: 'Parietal Cortex',
    conceptIds: ['working-memory', 'mirror-neuron-empathy'],
    shape: 'path',
    d: 'M 180 150 C 185 138 200 133 250 130 L 300 128 L 350 130 C 400 133 415 138 420 150 C 430 170 432 200 430 225 C 420 230 390 235 350 237 L 300 238 L 250 237 C 210 235 180 230 170 225 C 168 200 170 170 180 150 Z',
    labelPos: { x: 300, y: 185 },
    color: 'rgba(6,182,212,0.18)',
    glowColor: '#06b6d4',
  },
  {
    id: 'hippocampus-l',
    label: 'Hippocampus (L)',
    conceptIds: ['hippocampal-memory-consolidation', 'sleep-memory-consolidation'],
    shape: 'path',
    d: 'M 175 230 C 165 222 158 210 158 200 C 158 185 168 172 182 168 C 195 165 210 170 218 180 C 225 190 224 205 218 215 C 210 225 195 232 180 232 Z',
    labelPos: { x: 190, y: 198 },
    color: 'rgba(16,185,129,0.2)',
    glowColor: '#10b981',
  },
  {
    id: 'hippocampus-r',
    label: 'Hippocampus (R)',
    conceptIds: ['hippocampal-memory-consolidation', 'sleep-memory-consolidation'],
    shape: 'path',
    d: 'M 425 230 C 435 222 442 210 442 200 C 442 185 432 172 418 168 C 405 165 390 170 382 180 C 375 190 376 205 382 215 C 390 225 405 232 420 232 Z',
    labelPos: { x: 412, y: 198 },
    color: 'rgba(16,185,129,0.2)',
    glowColor: '#10b981',
  },
  {
    id: 'amygdala-l',
    label: 'Amygdala (L)',
    conceptIds: ['amygdala-fear-response', 'cortisol-stress-response'],
    shape: 'ellipse',
    cx: 205, cy: 260, rx: 28, ry: 20,
    labelPos: { x: 205, y: 260 },
    color: 'rgba(244,63,94,0.25)',
    glowColor: '#f43f5e',
  },
  {
    id: 'amygdala-r',
    label: 'Amygdala (R)',
    conceptIds: ['amygdala-fear-response', 'cortisol-stress-response'],
    shape: 'ellipse',
    cx: 395, cy: 260, rx: 28, ry: 20,
    labelPos: { x: 395, y: 260 },
    color: 'rgba(244,63,94,0.25)',
    glowColor: '#f43f5e',
  },
  {
    id: 'nucleus-accumbens',
    label: 'Nucleus Accumbens',
    conceptIds: ['dopamine-reward-circuit', 'reward-prediction-error', 'intrinsic-motivation'],
    shape: 'ellipse',
    cx: 300, cy: 270, rx: 38, ry: 26,
    labelPos: { x: 300, y: 270 },
    color: 'rgba(245,158,11,0.22)',
    glowColor: '#f59e0b',
  },
  {
    id: 'cerebellum',
    label: 'Cerebellum',
    conceptIds: ['neuroplasticity'],
    shape: 'path',
    d: 'M 220 340 C 225 315 255 300 300 298 C 345 300 375 315 380 340 C 385 360 375 385 355 398 C 335 410 310 415 300 415 C 290 415 265 410 245 398 C 225 385 215 360 220 340 Z',
    labelPos: { x: 300, y: 358 },
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
  // keep charPos accessible in keydown handler without re-registering
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

      // Proximity check
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
  // walkTo is stable (useCallback with stable deps), pendingWalkTarget is the real trigger
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
          background: '#05050e',
          outline: 'none',
        }}
        tabIndex={0}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            {REGIONS.map((r) => (
              <filter key={r.id} id={`glow-${r.id}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
          </defs>

          {/* Outer brain silhouette */}
          <ellipse cx={300} cy={225} rx={242} ry={202} fill="#08081a" stroke="#181830" strokeWidth={1.5} />

          {/* Anatomical sulci lines */}
          <g stroke="#111128" strokeWidth={1} fill="none" opacity={0.8}>
            <path d="M 300 28 C 295 90 298 150 300 210 C 302 270 298 330 300 415" />
            <path d="M 195 125 C 218 148 242 168 258 198 C 268 220 270 248 267 272" />
            <path d="M 405 125 C 382 148 358 168 342 198 C 332 220 330 248 333 272" />
            <path d="M 172 188 C 198 193 228 190 258 186" />
            <path d="M 428 188 C 402 193 372 190 342 186" />
            <path d="M 230 300 C 255 295 278 292 300 292 C 322 292 345 295 370 300" />
          </g>

          {/* Regions */}
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

          {/* Concept dots */}
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

          {/* Tooltips */}
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
