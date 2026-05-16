import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPointer,
  IconArrowUp,
  IconAdjustments,
  IconRefresh,
} from '@tabler/icons-react';
import { useTheme } from '../hooks/useTheme';

const LS_KEY = 'psych-explorer-visited';

const INSTRUCTIONS = [
  { icon: <IconPointer size={16} />, text: 'Click any brain region dot to discover what it does' },
  { icon: <IconArrowUp size={16} />, text: 'Use arrow keys to walk your explorer around the brain' },
  { icon: <IconAdjustments size={16} />, text: 'Switch difficulty — Beginner, University, or Research' },
  { icon: <IconRefresh size={16} />, text: 'Hit shuffle in the fact panel for a random psychology insight' },
];

export default function WelcomeModal() {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(() => !localStorage.getItem(LS_KEY));

  const dismiss = () => {
    localStorage.setItem(LS_KEY, '1');
    setVisible(false);
  };

  const showAgain = () => {
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  };

  // Theme-aware colors
  const cardBg = isDark ? '#0d0d1a' : '#f9f4ec';
  const cardBorder = isDark ? '#1a1a3e' : '#c4a882';
  const titleColor = isDark ? '#e2e8f0' : '#2c1f0e';
  const textColor = isDark ? '#94a3b8' : '#6b4f2a';
  const iconColor = isDark ? '#00ffd5' : '#c4956a';
  const btnBorder = isDark ? '#00ffd5' : '#c4956a';
  const btnBg = isDark ? 'rgba(0,255,213,0.08)' : 'rgba(196,149,106,0.12)';
  const btnBgHover = isDark ? 'rgba(0,255,213,0.16)' : 'rgba(196,149,106,0.22)';
  const btnText = isDark ? '#00ffd5' : '#4a2c0a';
  const linkText = isDark ? '#334155' : '#8b6a46';
  const linkHover = isDark ? '#64748b' : '#4a2c0a';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismiss}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '28px 24px',
              maxWidth: '480px',
              width: 'calc(100% - 40px)',
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            <h2 style={{
              margin: '0 0 20px',
              fontSize: '18px',
              fontWeight: 700,
              color: titleColor,
              letterSpacing: '-0.01em',
              transition: 'color 0.3s ease',
            }}>
              How to explore
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {INSTRUCTIONS.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: iconColor, flexShrink: 0, marginTop: '1px', transition: 'color 0.3s ease' }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '13px', color: textColor, lineHeight: 1.55, transition: 'color 0.3s ease' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={dismiss}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                border: `1px solid ${btnBorder}`,
                background: btnBg,
                color: btnText,
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'background 0.15s, color 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = btnBgHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = btnBg;
              }}
            >
              Start exploring
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={showAgain}
                style={{
                  background: 'none', border: 'none',
                  color: linkText, fontSize: '11px',
                  cursor: 'pointer', textDecoration: 'underline',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = linkHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = linkText;
                }}
              >
                Show this again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
