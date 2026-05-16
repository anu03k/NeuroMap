import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, Zap, ArrowRight, BookOpen, Link2 } from 'lucide-react';
import { useConceptStore } from '../hooks/useConceptStore';
import { useTheme } from '../hooks/useTheme';
import type { Category, Difficulty, Concept } from '../types/concept';

// ─── Style maps ───────────────────────────────────────────────────────────────

const DARK_CATEGORY_STYLE: Record<Category, { bg: string; border: string; text: string; dot: string }> = {
  'Brain Regions':      { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  text: '#818cf8', dot: '#6366f1' },
  'Cognitive Biases':   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  text: '#fbbf24', dot: '#f59e0b' },
  'Emotion Systems':    { bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.35)',   text: '#fb7185', dot: '#f43f5e' },
  'Motivation & Reward':{ bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)',  text: '#34d399', dot: '#10b981' },
  'Memory':             { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.35)',   text: '#22d3ee', dot: '#06b6d4' },
  'Decision Making':    { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.35)',  text: '#a78bfa', dot: '#8b5cf6' },
};

const LIGHT_CATEGORY_STYLE: Record<Category, { bg: string; border: string; text: string; dot: string }> = {
  'Brain Regions':      { bg: 'rgba(196,149,106,0.12)', border: '#c4a882', text: '#4a2c0a', dot: '#c4956a' },
  'Cognitive Biases':   { bg: 'rgba(196,149,106,0.12)', border: '#c4a882', text: '#4a2c0a', dot: '#c4956a' },
  'Emotion Systems':    { bg: 'rgba(196,149,106,0.12)', border: '#c4a882', text: '#4a2c0a', dot: '#c4956a' },
  'Motivation & Reward':{ bg: 'rgba(196,149,106,0.12)', border: '#c4a882', text: '#4a2c0a', dot: '#c4956a' },
  'Memory':             { bg: 'rgba(196,149,106,0.12)', border: '#c4a882', text: '#4a2c0a', dot: '#c4956a' },
  'Decision Making':    { bg: 'rgba(196,149,106,0.12)', border: '#c4a882', text: '#4a2c0a', dot: '#c4956a' },
};

const DARK_DIFFICULTY_STYLE: Record<Difficulty, { bg: string; border: string; text: string }> = {
  Beginner:   { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  text: '#34d399' },
  University: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  text: '#818cf8' },
  Research:   { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.3)',   text: '#fb7185' },
};

const LIGHT_DIFFICULTY_STYLE: Record<Difficulty, { bg: string; border: string; text: string }> = {
  Beginner:   { bg: '#fdf3e3', border: 'rgba(212,169,106,0.4)', text: '#d4a96a' },
  University: { bg: '#fef3cd', border: 'rgba(139,105,20,0.4)',  text: '#8b6914' },
  Research:   { bg: '#fdebd0', border: 'rgba(122,59,30,0.4)',   text: '#7a3b1e' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({ label, isDark }: { label: string; isDark: boolean }) {
  const bg = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(196,149,106,0.15)';
  const border = isDark ? 'rgba(99,102,241,0.25)' : '#c4a882';
  const text = isDark ? '#818cf8' : '#4a2c0a';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 500,
      background: bg, border: `1px solid ${border}`, color: text,
      letterSpacing: '0.02em',
      transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ icon, children, isDark }: { icon: React.ReactNode; children: React.ReactNode; isDark: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      color: isDark ? '#334155' : '#8b6a46',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', marginBottom: '8px',
      transition: 'color 0.3s ease',
    }}>
      <span style={{ color: isDark ? '#475569' : '#6b4f2a' }}>{icon}</span>
      {children}
    </div>
  );
}

function RelatedConceptCard({
  concept,
  onClick,
  isDark,
}: {
  concept: Concept;
  onClick: () => void;
  isDark: boolean;
}) {
  const cs = isDark ? DARK_CATEGORY_STYLE[concept.category] : LIGHT_CATEGORY_STYLE[concept.category];
  const cardBg = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(237,228,211,0.5)';
  const cardBorder = isDark ? 'rgba(99,102,241,0.1)' : '#c4a882';
  const titleColor = isDark ? '#c7d2fe' : '#2c1f0e';
  const excerptColor = isDark ? '#475569' : '#6b4f2a';
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
        border: `1px solid ${cardBorder}`,
        background: cardBg,
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px',
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = cs.border;
        (e.currentTarget as HTMLButtonElement).style.background = cs.bg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = cardBorder;
        (e.currentTarget as HTMLButtonElement).style.background = cardBg;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: cs.text, display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot, display: 'inline-block', flexShrink: 0 }} />
          {concept.category}
        </span>
        <ArrowRight size={11} style={{ color: isDark ? '#334155' : '#8b6a46', flexShrink: 0 }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: titleColor, lineHeight: 1.3 }}>
        {concept.title}
      </span>
      <span style={{
        fontSize: '10px', color: excerptColor, lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {concept.summary.beginner.slice(0, 80)}…
      </span>
    </motion.button>
  );
}

function Breadcrumbs({ crumbs, onJump, isDark }: { crumbs: Concept[]; onJump: (i: number) => void; isDark: boolean }) {
  if (crumbs.length === 0) return null;
  const bg = isDark ? 'rgba(99,102,241,0.06)' : 'rgba(196,149,106,0.08)';
  const border = isDark ? 'rgba(99,102,241,0.12)' : '#c4a882';
  const linkColor = isDark ? '#6366f1' : '#6b4f2a';
  const sepColor = isDark ? '#1e293b' : '#c4a882';
  const hereColor = isDark ? '#475569' : '#8b6a46';
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px',
        padding: '8px 10px', borderRadius: '8px',
        background: bg, border: `1px solid ${border}`, marginBottom: '14px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={() => onJump(i)}
            style={{
              background: 'none', border: 'none', padding: '1px 4px', borderRadius: '4px',
              color: linkColor, fontSize: '10px', fontWeight: 600,
              cursor: 'pointer', transition: 'color 0.12s, background 0.12s', letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                isDark ? 'rgba(99,102,241,0.15)' : 'rgba(196,149,106,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            {crumb.title.length > 22 ? crumb.title.slice(0, 20) + '…' : crumb.title}
          </button>
          <ChevronRight size={10} style={{ color: sepColor, flexShrink: 0 }} />
        </span>
      ))}
      <span style={{ fontSize: '10px', color: hereColor, padding: '1px 4px' }}>you are here</span>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InfoPanel() {
  const {
    selectedConcept,
    selectConcept,
    difficultyLevel,
    breadcrumbs,
    navigateToConcept,
    jumpToBreadcrumb,
    getRelatedConcepts,
    viewedConcepts,
  } = useConceptStore();

  const { isDark } = useTheme();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedConcept?.id]);

  if (!selectedConcept) return null;

  const cs = isDark
    ? DARK_CATEGORY_STYLE[selectedConcept.category]
    : LIGHT_CATEGORY_STYLE[selectedConcept.category];
  const ds = isDark
    ? DARK_DIFFICULTY_STYLE[difficultyLevel]
    : LIGHT_DIFFICULTY_STYLE[difficultyLevel];
  const summaryText = selectedConcept.summary[difficultyLevel.toLowerCase() as 'beginner' | 'university' | 'research'];
  const related = getRelatedConcepts(selectedConcept);

  const textPrimary = isDark ? '#e2e8f0' : '#2c1f0e';
  const textSecondary = isDark ? '#94a3b8' : '#6b4f2a';
  const textMuted = isDark ? '#64748b' : '#8b6a46';
  const divider = isDark ? 'rgba(99,102,241,0.1)' : '#c4a882';
  const closeBtnBorder = isDark ? 'rgba(99,102,241,0.15)' : '#c4a882';
  const closeBtnColor = isDark ? '#334155' : '#8b6a46';
  const visitedBg = isDark ? 'rgba(16,185,129,0.06)' : 'rgba(196,149,106,0.1)';
  const visitedBorder = isDark ? 'rgba(16,185,129,0.2)' : '#c4a882';
  const visitedText = isDark ? '#34d399' : '#6b4f2a';
  const tagBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(196,149,106,0.08)';
  const tagBorder = isDark ? 'rgba(99,102,241,0.1)' : '#c4a882';
  const tagText = isDark ? '#334155' : '#8b6a46';

  return (
    <div
      ref={scrollRef}
      style={{ height: '100%', overflowY: 'auto', paddingRight: '2px' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedConcept.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '24px' }}
        >
          {/* Breadcrumb trail */}
          <Breadcrumbs crumbs={breadcrumbs} onJump={jumpToBreadcrumb} isDark={isDark} />

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                {/* Category badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '2px 8px', borderRadius: '4px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text,
                  transition: 'all 0.3s ease',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot, display: 'inline-block' }} />
                  {selectedConcept.category}
                </span>
                {/* Difficulty badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 8px', borderRadius: '4px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: ds.bg, border: `1px solid ${ds.border}`, color: ds.text,
                  transition: 'all 0.3s ease',
                }}>
                  {difficultyLevel}
                </span>
                {viewedConcepts.has(selectedConcept.id) && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '2px 6px', borderRadius: '4px',
                    fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em',
                    background: visitedBg, border: `1px solid ${visitedBorder}`, color: visitedText,
                  }}>
                    ✓ visited
                  </span>
                )}
              </div>
              {/* Close button */}
              <button
                onClick={() => selectConcept(null)}
                style={{
                  background: 'none', border: `1px solid ${closeBtnBorder}`, borderRadius: '6px',
                  padding: '3px 5px', cursor: 'pointer', color: closeBtnColor, flexShrink: 0,
                  display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    isDark ? 'rgba(244,63,94,0.4)' : '#a07850';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    isDark ? '#f43f5e' : '#4a2c0a';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = closeBtnBorder;
                  (e.currentTarget as HTMLButtonElement).style.color = closeBtnColor;
                }}
              >
                <X size={13} />
              </button>
            </div>

            <h2 style={{
              margin: 0, fontSize: '18px', fontWeight: 700, lineHeight: 1.25,
              color: textPrimary, letterSpacing: '-0.01em',
              transition: 'color 0.3s ease',
            }}>
              {selectedConcept.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: textMuted, fontSize: '11px' }}>
              <MapPin size={11} style={{ color: cs.dot, flexShrink: 0 }} />
              <span>{selectedConcept.brain_region}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: divider, transition: 'background-color 0.3s ease' }} />

          {/* Summary */}
          <div>
            <p style={{
              margin: 0, fontSize: '13px', lineHeight: 1.65,
              color: textSecondary, transition: 'color 0.3s ease',
            }}>
              {summaryText}
            </p>
          </div>

          {/* Triggers */}
          <div>
            <SectionLabel icon={<Zap size={11} />} isDark={isDark}>Triggers</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selectedConcept.triggers.map((t) => (
                <Pill key={t} label={t} isDark={isDark} />
              ))}
            </div>
          </div>

          {/* Effects */}
          <div>
            <SectionLabel icon={<ArrowRight size={11} />} isDark={isDark}>Effects</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selectedConcept.effects.map((e) => (
                <Pill key={e} label={e} isDark={isDark} />
              ))}
            </div>
          </div>

          {/* Real-life examples */}
          <div>
            <SectionLabel icon={<BookOpen size={11} />} isDark={isDark}>Real-life examples</SectionLabel>
            <ol style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedConcept.real_life_examples.map((ex, i) => (
                <li key={i} style={{
                  fontSize: '12px', lineHeight: 1.5,
                  color: textMuted, transition: 'color 0.3s ease',
                }}>
                  {ex}
                </li>
              ))}
            </ol>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: divider, transition: 'background-color 0.3s ease' }} />

          {/* Related concepts */}
          {related.length > 0 && (
            <div>
              <SectionLabel icon={<Link2 size={11} />} isDark={isDark}>Connected concepts</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {related.map((rc) => (
                  <RelatedConceptCard
                    key={rc.id}
                    concept={rc}
                    onClick={() => navigateToConcept(rc)}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {selectedConcept.tags.length > 0 && (
            <div style={{ paddingTop: '4px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {selectedConcept.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '9px', padding: '1px 6px', borderRadius: '3px',
                    background: tagBg, border: `1px solid ${tagBorder}`,
                    color: tagText, letterSpacing: '0.04em',
                    transition: 'all 0.3s ease',
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
