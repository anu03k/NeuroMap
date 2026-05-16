import { AnimatePresence, motion } from 'framer-motion';
import NavMenu from './components/NavMenu';
import BrainMap from './components/BrainMap';
import InfoPanel from './components/InfoPanel';
import DailyFact from './components/DailyFact';
import WelcomeModal from './components/WelcomeModal';
import { useConceptStore } from './hooks/useConceptStore';
import { useTheme } from './hooks/useTheme';
import './index.css';

export default function App() {
  const { selectedConcept } = useConceptStore();
  const { isDark } = useTheme();

  const pageBg = isDark ? '#0a0a0f' : '#f4efe6';
  const contentBg = isDark ? 'rgba(99,102,241,0.06)' : 'rgba(196,149,106,0.06)';
  const statusBg = isDark ? 'rgba(10,10,15,0.98)' : 'rgba(237,228,211,0.98)';
  const statusBorder = isDark ? 'rgba(99,102,241,0.1)' : '#c4a882';
  const statusText = isDark ? '#334155' : '#6b4f2a';
  const statusAccent = isDark ? '#6366f1' : '#c4956a';
  const statusCount = isDark ? '#1e293b' : '#8b6a46';
  const infoPanelBg = isDark ? '#0d0d1a' : '#f9f4ec';
  const infoPanelBorder = isDark ? 'rgba(99,102,241,0.12)' : '#c4a882';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100svh',
      background: pageBg,
      transition: 'background-color 0.3s ease',
    }}>
      <NavMenu />

      {/* Main content area */}
      <div
        className="grid-bg"
        style={{
          flex: 1,
          display: 'flex',
          gap: '1px',
          background: contentBg,
          overflow: 'hidden',
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* BrainMap + FactPanel */}
        <div style={{
          flex: selectedConcept ? '1 1 60%' : '1 1 100%',
          background: pageBg,
          padding: '20px',
          transition: 'flex-basis 0.32s ease, background-color 0.3s ease',
          minHeight: 'calc(100svh - 56px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <BrainMap />
          <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
            <DailyFact />
          </div>
        </div>

        {/* InfoPanel — slides in from right */}
        <AnimatePresence>
          {selectedConcept && (
            <motion.div
              key="info-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                flex: '0 0 380px',
                background: infoPanelBg,
                borderLeft: `1px solid ${infoPanelBorder}`,
                padding: '20px',
                overflowY: 'auto',
                minHeight: 'calc(100svh - 56px)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
              }}
            >
              <InfoPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      <div style={{
        height: '28px',
        background: statusBg,
        borderTop: `1px solid ${statusBorder}`,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: '16px',
        fontSize: '11px', color: statusText,
        transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
      }}>
        <span style={{ color: statusAccent, transition: 'color 0.3s ease' }}>◆</span>
        <span>NeuroMap</span>
        <span style={{ marginLeft: 'auto', color: statusCount, transition: 'color 0.3s ease' }}>
          20 concepts loaded
        </span>
      </div>

      <WelcomeModal />
    </div>
  );
}
