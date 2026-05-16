import { useState, useCallback } from 'react';
import factsData from '../data/facts.json';
import { useTheme } from '../hooks/useTheme';

type Category = 'psychology' | 'cognitiveBiases' | 'neuroscience' | 'experiments';

interface Fact {
  id: string;
  text: string;
}

const TABS: { key: Category; label: string; darkColor: string; darkAccent: string }[] = [
  { key: 'psychology',      label: 'Psychology',   darkColor: '#6366f1', darkAccent: 'rgba(99,102,241,0.15)' },
  { key: 'cognitiveBiases', label: 'Biases',       darkColor: '#f59e0b', darkAccent: 'rgba(245,158,11,0.15)' },
  { key: 'neuroscience',    label: 'Neuroscience', darkColor: '#06b6d4', darkAccent: 'rgba(6,182,212,0.15)'  },
  { key: 'experiments',     label: 'Experiments',  darkColor: '#10b981', darkAccent: 'rgba(16,185,129,0.15)' },
];

const facts = factsData as Record<Category, Fact[]>;

function randomIndex(len: number) {
  return Math.floor(Math.random() * len);
}

export default function DailyFact() {
  const { isDark } = useTheme();

  const [active, setActive] = useState<Category>('psychology');
  const [idx, setIdx] = useState(() => randomIndex(facts['psychology'].length));
  const [fading, setFading] = useState(false);

  const tab = TABS.find((t) => t.key === active)!;
  const pool = facts[active];
  const fact = pool[idx];

  // Light mode unified colors
  const lightAccentColor = '#c4956a';
  const lightAccentBg = 'rgba(196,149,106,0.15)';

  const tabColor = isDark ? tab.darkColor : lightAccentColor;
  const tabAccent = isDark ? tab.darkAccent : lightAccentBg;

  // Panel colors
  const panelBg = isDark ? '#0d0d1a' : '#ede4d3';
  const panelBorder = isDark ? 'rgba(99,102,241,0.12)' : '#c4a882';
  const tabRowBorder = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(196,168,130,0.4)';
  const factText = isDark ? '#94a3b8' : '#2c1f0e';
  const footerText = isDark ? '#1e293b' : '#8b6a46';
  const footerAccent = isDark ? tab.darkColor : '#c4956a';
  const footerBrand = isDark ? '#1e293b' : '#c4a882';

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
    <div style={{
      width: '100%',
      background: panelBg,
      border: `1px solid ${panelBorder}`,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Tab row */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${tabRowBorder}`, transition: 'border-color 0.3s ease' }}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          const color = isDark ? t.darkColor : lightAccentColor;
          const accent = isDark ? t.darkAccent : lightAccentBg;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                flex: 1, padding: '8px 4px',
                background: isActive ? accent : 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                color: isActive ? color : (isDark ? '#334155' : '#8b6a46'),
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em',
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
        <div style={{
          width: 3, minHeight: 32, background: tabColor,
          borderRadius: 2, flexShrink: 0, opacity: 0.7, marginTop: 2,
          transition: 'background-color 0.3s ease',
        }} />
        <p style={{
          flex: 1, margin: 0, fontSize: '12px', lineHeight: '1.65',
          color: fading ? 'transparent' : factText,
          transition: 'color 0.15s ease',
          letterSpacing: '0.01em',
        }}>
          {fact.text}
        </p>
        <button
          onClick={nextFact}
          title="Next fact"
          style={{
            flexShrink: 0, width: 26, height: 26, borderRadius: '6px',
            border: `1px solid ${tabColor}44`,
            background: 'transparent', color: tabColor,
            fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.3s ease, border-color 0.3s ease',
            marginTop: 2,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = tabAccent; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          ↻
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '9px', color: footerText,
          letterSpacing: '0.06em', textTransform: 'uppercase' as const,
          transition: 'color 0.3s ease',
        }}>
          {tab.label} · {idx + 1} / {pool.length}
        </span>
        <span style={{
          fontSize: '9px', color: footerAccent, opacity: 0.5,
          letterSpacing: '0.04em', transition: 'color 0.3s ease',
        }}>
          ◆ {footerBrand === '#c4a882' ? '' : ''}NeuroMap
        </span>
      </div>
    </div>
  );
}
