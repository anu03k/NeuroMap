import { useState, useCallback } from 'react';
import factsData from '../data/facts.json';

type Category = 'psychology' | 'cognitiveBiases' | 'neuroscience' | 'experiments';

interface Fact {
  id: string;
  text: string;
}

const TABS: { key: Category; label: string; color: string; accent: string }[] = [
  { key: 'psychology',      label: 'Psychology',    color: '#6366f1', accent: 'rgba(99,102,241,0.15)' },
  { key: 'cognitiveBiases', label: 'Biases',        color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  { key: 'neuroscience',    label: 'Neuroscience',  color: '#06b6d4', accent: 'rgba(6,182,212,0.15)'  },
  { key: 'experiments',     label: 'Experiments',   color: '#10b981', accent: 'rgba(16,185,129,0.15)' },
];

const facts = factsData as Record<Category, Fact[]>;

function randomIndex(len: number) {
  return Math.floor(Math.random() * len);
}

export default function DailyFact() {
  const [active, setActive] = useState<Category>('psychology');
  const [idx, setIdx] = useState(() => randomIndex(facts['psychology'].length));
  const [fading, setFading] = useState(false);

  const tab = TABS.find((t) => t.key === active)!;
  const pool = facts[active];
  const fact = pool[idx];

  const switchTab = useCallback((key: Category) => {
    if (key === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(key);
      setIdx(randomIndex(facts[key].length));
      setFading(false);
    }, 150);
  }, [active]);

  const nextFact = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIdx((prev) => {
        let next = randomIndex(pool.length);
        if (pool.length > 1 && next === prev) next = (prev + 1) % pool.length;
        return next;
      });
      setFading(false);
    }, 150);
  }, [pool.length]);

  return (
    <div
      style={{
        width: '100%',
        background: '#0d0d1a',
        border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Tab row */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: isActive ? t.accent : 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${t.color}` : '2px solid transparent',
                color: isActive ? t.color : '#334155',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textTransform: 'uppercase' as const,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Fact display */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Color accent bar */}
        <div style={{ width: 3, minHeight: 32, background: tab.color, borderRadius: 2, flexShrink: 0, opacity: 0.7, marginTop: 2 }} />

        <p
          style={{
            flex: 1,
            margin: 0,
            fontSize: '12px',
            lineHeight: '1.65',
            color: fading ? 'transparent' : '#94a3b8',
            transition: 'color 0.15s ease',
            letterSpacing: '0.01em',
          }}
        >
          {fact.text}
        </p>

        {/* Next button */}
        <button
          onClick={nextFact}
          title="Next fact"
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: '6px',
            border: `1px solid ${tab.color}44`,
            background: 'transparent',
            color: tab.color,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
            marginTop: 2,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = tab.accent; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          ↻
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', color: '#1e293b', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
          {tab.label} · {idx + 1} / {pool.length}
        </span>
        <span style={{ fontSize: '9px', color: tab.color, opacity: 0.5, letterSpacing: '0.04em' }}>
          ◆ NeuroMap
        </span>
      </div>
    </div>
  );
}
