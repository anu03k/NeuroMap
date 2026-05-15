import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, Zap, ArrowRight, BookOpen, Link2 } from 'lucide-react';
import { useConceptStore } from '../hooks/useConceptStore';
import type { Category, Difficulty, Concept } from '../types/concept';

// ─── Style maps ───────────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<Category, { bg: string; border: string; text: string; dot: string }> = {
  'Brain Regions':     { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  text: '#818cf8', dot: '#6366f1' },
  'Cognitive Biases':  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  text: '#fbbf24', dot: '#f59e0b' },
  'Emotion Systems':   { bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.35)',   text: '#fb7185', dot: '#f43f5e' },
  'Motivation & Reward':{ bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#34d399', dot: '#10b981' },
  'Memory':            { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.35)',   text: '#22d3ee', dot: '#06b6d4' },
  'Decision Making':   { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.35)',  text: '#a78bfa', dot: '#8b5cf6' },
};

const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; border: string; text: string }> = {
  Beginner:   { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  text: '#34d399' },
  University: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  text: '#818cf8' },
  Research:   { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.3)',   text: '#fb7185' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 500,
      background: `${color}18`,
      border: `1px solid ${color}35`,
      color,
      letterSpacing: '0.02em',
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#334155',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: '8px',
    }}>
      <span style={{ color: '#475569' }}>{icon}</span>
      {children}
    </div>
  );
}

function RelatedConceptCard({ concept, onClick }: { concept: Concept; onClick: () => void }) {
  const cs = CATEGORY_STYLE[concept.category];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid rgba(99,102,241,0.1)`,
        background: 'rgba(255,255,255,0.025)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = cs.border;
        (e.currentTarget as HTMLButtonElement).style.background = cs.bg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.1)';
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.025)';
      }}
    >
      {/* Category dot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: cs.text,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot, display: 'inline-block', flexShrink: 0 }} />
          {concept.category}
        </span>
        <ArrowRight size={11} style={{ color: '#334155', flexShrink: 0 }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#c7d2fe', lineHeight: 1.3 }}>
        {concept.title}
      </span>
      <span style={{
        fontSize: '10px',
        color: '#475569',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {concept.summary.beginner.slice(0, 80)}…
      </span>
    </motion.button>
  );
}

// ─── Breadcrumb trail ─────────────────────────────────────────────────────────

function Breadcrumbs({ crumbs, onJump }: { crumbs: Concept[]; onJump: (i: number) => void }) {
  if (crumbs.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2px',
        padding: '8px 10px',
        borderRadius: '8px',
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.12)',
        marginBottom: '14px',
      }}
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={() => onJump(i)}
            style={{
              background: 'none',
              border: 'none',
              padding: '1px 4px',
              borderRadius: '4px',
              color: '#6366f1',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.12s, background 0.12s',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
          >
            {crumb.title.length > 22 ? crumb.title.slice(0, 20) + '…' : crumb.title}
          </button>
          <ChevronRight size={10} style={{ color: '#1e293b', flexShrink: 0 }} />
        </span>
      ))}
      <span style={{ fontSize: '10px', color: '#475569', padding: '1px 4px' }}>you are here</span>
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

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when concept changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedConcept?.id]);

  if (!selectedConcept) return null;

  const cs = CATEGORY_STYLE[selectedConcept.category];
  const ds = DIFFICULTY_STYLE[difficultyLevel];
  const summaryText = selectedConcept.summary[difficultyLevel.toLowerCase() as 'beginner' | 'university' | 'research'];
  const related = getRelatedConcepts(selectedConcept);

  return (
    <div
      ref={scrollRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        paddingRight: '2px',
      }}
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
          <Breadcrumbs crumbs={breadcrumbs} onJump={jumpToBreadcrumb} />

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '2px 8px', borderRadius: '4px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot, display: 'inline-block' }} />
                  {selectedConcept.category}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 8px', borderRadius: '4px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: ds.bg, border: `1px solid ${ds.border}`, color: ds.text,
                }}>
                  {difficultyLevel}
                </span>
                {viewedConcepts.has(selectedConcept.id) && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '2px 6px', borderRadius: '4px',
                    fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                    color: '#34d399',
                  }}>
                    ✓ visited
                  </span>
                )}
              </div>
              <button
                onClick={() => selectConcept(null)}
                style={{
                  background: 'none', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '6px',
                  padding: '3px 5px', cursor: 'pointer', color: '#334155', flexShrink: 0,
                  display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(244,63,94,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#f43f5e'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#334155'; }}
              >
                <X size={13} />
              </button>
            </div>

            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#e2e8f0',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}>
              {selectedConcept.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '11px' }}>
              <MapPin size={11} style={{ color: cs.dot, flexShrink: 0 }} />
              <span>{selectedConcept.brain_region}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(99,102,241,0.1)' }} />

          {/* Summary */}
          <div>
            <p style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: 1.65,
              color: '#94a3b8',
            }}>
              {summaryText}
            </p>
          </div>

          {/* Triggers */}
          <div>
            <SectionLabel icon={<Zap size={11} />}>Triggers</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selectedConcept.triggers.map((t) => (
                <Pill key={t} label={t} color={cs.dot} />
              ))}
            </div>
          </div>

          {/* Effects */}
          <div>
            <SectionLabel icon={<ArrowRight size={11} />}>Effects</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selectedConcept.effects.map((e) => (
                <Pill key={e} label={e} color="#8b5cf6" />
              ))}
            </div>
          </div>

          {/* Real-life examples */}
          <div>
            <SectionLabel icon={<BookOpen size={11} />}>Real-life examples</SectionLabel>
            <ol style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedConcept.real_life_examples.map((ex, i) => (
                <li key={i} style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                  {ex}
                </li>
              ))}
            </ol>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(99,102,241,0.1)' }} />

          {/* Related concepts */}
          {related.length > 0 && (
            <div>
              <SectionLabel icon={<Link2 size={11} />}>Connected concepts</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {related.map((rc) => (
                  <RelatedConceptCard
                    key={rc.id}
                    concept={rc}
                    onClick={() => navigateToConcept(rc)}
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
                    fontSize: '9px',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(99,102,241,0.1)',
                    color: '#334155',
                    letterSpacing: '0.04em',
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
