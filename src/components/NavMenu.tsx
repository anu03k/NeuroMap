import {
  Brain,
  AlertTriangle,
  Heart,
  Zap,
  BookOpen,
  GitFork,
  Shuffle,
} from 'lucide-react';
import type { Category, Difficulty } from '../types/concept';
import { useConceptStore } from '../hooks/useConceptStore';

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: 'Brain Regions', icon: <Brain size={14} />, color: '#6366f1' },
  { label: 'Cognitive Biases', icon: <AlertTriangle size={14} />, color: '#f59e0b' },
  { label: 'Emotion Systems', icon: <Heart size={14} />, color: '#f43f5e' },
  { label: 'Motivation & Reward', icon: <Zap size={14} />, color: '#10b981' },
  { label: 'Memory', icon: <BookOpen size={14} />, color: '#06b6d4' },
  { label: 'Decision Making', icon: <GitFork size={14} />, color: '#8b5cf6' },
];

const DIFFICULTIES: Difficulty[] = ['Beginner', 'University', 'Research'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: '#10b981',
  University: '#6366f1',
  Research: '#f43f5e',
};

export default function NavMenu() {
  const { activeCategory, difficultyLevel, setActiveCategory, setDifficultyLevel, selectRandomConcept } =
    useConceptStore();

  return (
    <nav
      style={{
        background: 'rgba(15, 15, 26, 0.95)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Brain size={15} color="white" />
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#e2e8f0',
            }}
          >
            NEURO<span style={{ color: '#6366f1' }}>MAP</span>
          </span>
        </div>

        {/* Category tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            flex: 1,
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 11px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: activeCategory === null ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.1)',
              background: activeCategory === null ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: activeCategory === null ? '#a5b4fc' : '#64748b',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            All
          </button>

          {CATEGORIES.map(({ label, icon, color }) => {
            const active = activeCategory === label;
            return (
              <button
                key={label}
                onClick={() => setActiveCategory(active ? null : label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: active ? `${color}60` : 'rgba(99,102,241,0.1)',
                  background: active ? `${color}20` : 'transparent',
                  color: active ? color : '#64748b',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ color: active ? color : '#475569' }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Difficulty segmented control */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
            flexShrink: 0,
          }}
        >
          {DIFFICULTIES.map((level) => {
            const active = difficultyLevel === level;
            const color = DIFFICULTY_COLORS[level];
            return (
              <button
                key={level}
                onClick={() => setDifficultyLevel(level)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '5px',
                  border: 'none',
                  background: active ? `${color}25` : 'transparent',
                  color: active ? color : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
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
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.35)',
            background: 'rgba(99,102,241,0.1)',
            color: '#818cf8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.6)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.35)';
          }}
        >
          <Shuffle size={13} />
          Random Insight
        </button>
      </div>
    </nav>
  );
}
