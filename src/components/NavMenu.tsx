import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  AlertTriangle,
  Heart,
  Zap,
  BookOpen,
  GitFork,
  Shuffle,
  ChevronDown,
} from 'lucide-react';
import { IconSun, IconMoon } from '@tabler/icons-react';
import type { Category, Difficulty } from '../types/concept';
import { useConceptStore } from '../hooks/useConceptStore';
import { useTheme } from '../hooks/useTheme';

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string; lightColor: string }[] = [
  { label: 'Brain Regions',       icon: <Brain size={14} />,         color: '#6366f1', lightColor: '#c4956a' },
  { label: 'Cognitive Biases',    icon: <AlertTriangle size={14} />, color: '#f59e0b', lightColor: '#c4956a' },
  { label: 'Emotion Systems',     icon: <Heart size={14} />,         color: '#f43f5e', lightColor: '#c4956a' },
  { label: 'Motivation & Reward', icon: <Zap size={14} />,           color: '#10b981', lightColor: '#c4956a' },
  { label: 'Memory',              icon: <BookOpen size={14} />,      color: '#06b6d4', lightColor: '#c4956a' },
  { label: 'Decision Making',     icon: <GitFork size={14} />,       color: '#8b5cf6', lightColor: '#c4956a' },
];

const DIFFICULTIES: Difficulty[] = ['Beginner', 'University', 'Research'];

const DARK_DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner:   '#10b981',
  University: '#6366f1',
  Research:   '#f43f5e',
};

export default function NavMenu() {
  const {
    activeCategory,
    difficultyLevel,
    setActiveCategory,
    setDifficultyLevel,
    selectRandomConcept,
    concepts,
    selectConceptAndWalk,
  } = useConceptStore();

  const { isDark, toggle } = useTheme();

  const [dropdownCategory, setDropdownCategory] = useState<Category | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  // Derived theme colors
  const navBg = isDark ? 'rgba(15,15,26,0.95)' : '#ede4d3';
  const navBorder = isDark ? 'rgba(99,102,241,0.15)' : '#c4a882';
  const navText = isDark ? '#64748b' : '#2c1f0e';
  const logoText = isDark ? '#e2e8f0' : '#2c1f0e';
  const logoAccent = isDark ? '#6366f1' : '#c4956a';
  const logoGlow = isDark ? 'rgba(99,102,241,0.4)' : 'rgba(196,149,106,0.4)';
  const tabBorder = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(196,168,130,0.4)';
  const allActiveBg = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(196,149,106,0.15)';
  const allActiveBorder = isDark ? 'rgba(99,102,241,0.6)' : '#c4956a';
  const allActiveText = isDark ? '#a5b4fc' : '#2c1f0e';
  const diffBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(237,228,211,0.8)';
  const diffBorder = isDark ? 'rgba(99,102,241,0.15)' : '#c4a882';
  const diffInactive = isDark ? '#475569' : '#6b4f2a';
  const randomBg = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(196,149,106,0.1)';
  const randomBorder = isDark ? 'rgba(99,102,241,0.35)' : '#c4a882';
  const randomText = isDark ? '#818cf8' : '#4a2c0a';
  const dropdownBg = isDark ? 'rgba(10,10,20,0.98)' : 'rgba(249,244,236,0.98)';
  const dropdownBorder = isDark ? '#6366f130' : '#c4a882';
  const dropdownLabelText = isDark ? '#818cf8' : '#4a2c0a';
  const dropdownItemText = isDark ? '#94a3b8' : '#6b4f2a';
  const dropdownItemHoverBg = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(196,149,106,0.12)';
  const dropdownItemHoverText = isDark ? '#e2e8f0' : '#2c1f0e';

  const handleCategoryClick = useCallback((label: Category, e: React.MouseEvent<HTMLButtonElement>) => {
    if (dropdownCategory === label) {
      setDropdownCategory(null);
      setActiveCategory(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownLeft(rect.left);
      setDropdownCategory(label);
      setActiveCategory(label);
    }
  }, [dropdownCategory, setActiveCategory]);

  const closeDropdown = useCallback(() => {
    setDropdownCategory(null);
    setActiveCategory(null);
  }, [setActiveCategory]);

  useEffect(() => {
    if (!dropdownCategory) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-neuromap-nav]')) closeDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownCategory, closeDropdown]);

  const dropdownConcepts = dropdownCategory
    ? concepts.filter((c) => c.category === dropdownCategory)
    : [];

  return (
    <>
      <nav
        data-neuromap-nav
        style={{
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            height: '56px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', flexShrink: 0 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: isDark
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'linear-gradient(135deg, #c4956a, #a07850)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px ${logoGlow}`,
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}>
              <Brain size={15} color={isDark ? 'white' : '#f4efe6'} />
            </div>
            <span style={{
              fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em',
              color: logoText, transition: 'color 0.3s ease',
            }}>
              NEURO<span style={{ color: logoAccent, transition: 'color 0.3s ease' }}>MAP</span>
            </span>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }}>
            <button
              onClick={() => { setActiveCategory(null); setDropdownCategory(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 11px', borderRadius: '6px', border: '1px solid',
                borderColor: activeCategory === null ? allActiveBorder : tabBorder,
                background: activeCategory === null ? allActiveBg : 'transparent',
                color: activeCategory === null ? allActiveText : navText,
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              All
            </button>

            {CATEGORIES.map(({ label, icon, color, lightColor }) => {
              const active = activeCategory === label;
              const open = dropdownCategory === label;
              const accent = isDark ? color : lightColor;
              return (
                <button
                  key={label}
                  onClick={(e) => handleCategoryClick(label, e)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 11px', borderRadius: '6px', border: '1px solid',
                    borderColor: active ? `${accent}60` : tabBorder,
                    background: active ? `${accent}20` : 'transparent',
                    color: active ? accent : navText,
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ color: active ? accent : (isDark ? '#475569' : '#8b6a46') }}>{icon}</span>
                  {label}
                  <ChevronDown
                    size={11}
                    style={{
                      color: active ? accent : (isDark ? '#334155' : '#8b6a46'),
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Difficulty segmented control */}
          <div style={{
            display: 'flex',
            background: diffBg,
            border: `1px solid ${diffBorder}`,
            borderRadius: '8px',
            padding: '3px', gap: '2px', flexShrink: 0,
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}>
            {DIFFICULTIES.map((level) => {
              const active = difficultyLevel === level;
              const color = isDark ? DARK_DIFFICULTY_COLORS[level] : '#c4956a';
              return (
                <button
                  key={level}
                  onClick={() => setDifficultyLevel(level)}
                  style={{
                    padding: '4px 12px', borderRadius: '5px', border: 'none',
                    background: active ? (isDark ? `${color}25` : 'rgba(196,149,106,0.2)') : 'transparent',
                    color: active ? color : diffInactive,
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em',
                    cursor: 'pointer', transition: 'all 0.15s',
                    outline: active ? `1px solid ${color}50` : 'none',
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Random Insight button */}
          <button
            onClick={selectRandomConcept}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              border: `1px solid ${randomBorder}`,
              background: randomBg,
              color: randomText,
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                isDark ? 'rgba(99,102,241,0.2)' : 'rgba(196,149,106,0.2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                isDark ? 'rgba(99,102,241,0.6)' : '#a07850';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = randomBg;
              (e.currentTarget as HTMLButtonElement).style.borderColor = randomBorder;
            }}
          >
            <Shuffle size={13} />
            Random Insight
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#c4a882'}`,
              background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(196,149,106,0.1)',
              color: isDark ? '#818cf8' : '#6b4f2a',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                isDark ? 'rgba(99,102,241,0.18)' : 'rgba(196,149,106,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                isDark ? 'rgba(99,102,241,0.08)' : 'rgba(196,149,106,0.1)';
            }}
          >
            {isDark ? <IconMoon size={15} /> : <IconSun size={15} />}
          </button>
        </div>
      </nav>

      {/* Category dropdown */}
      {dropdownCategory && (
        <div
          data-neuromap-nav
          style={{
            position: 'fixed',
            top: '56px',
            left: dropdownLeft,
            zIndex: 200,
            background: dropdownBg,
            border: `1px solid ${dropdownBorder}`,
            borderRadius: '8px',
            padding: '6px',
            minWidth: '210px',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 24px rgba(44,31,14,0.15)',
            backdropFilter: 'blur(12px)',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div style={{
            padding: '4px 8px 6px',
            marginBottom: '2px',
            borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(196,168,130,0.4)'}`,
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: dropdownLabelText,
          }}>
            {dropdownCategory}
          </div>
          {dropdownConcepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => {
                selectConceptAndWalk(concept);
                setDropdownCategory(null);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: '5px',
                border: 'none',
                background: 'transparent',
                color: dropdownItemText,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = dropdownItemHoverBg;
                (e.currentTarget as HTMLButtonElement).style.color = dropdownItemHoverText;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = dropdownItemText;
              }}
            >
              {concept.title}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
