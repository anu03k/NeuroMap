import NavMenu from './components/NavMenu';
import BrainMap from './components/BrainMap';
import InfoPanel from './components/InfoPanel';
import DailyFact from './components/DailyFact';
import { useConceptStore } from './hooks/useConceptStore';
import './index.css';

export default function App() {
  const { selectedConcept } = useConceptStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        background: '#0a0a0f',
      }}
    >
      <NavMenu />

      {/* Main content area */}
      <div
        className="grid-bg"
        style={{
          flex: 1,
          display: 'flex',
          gap: '1px',
          background: 'rgba(99,102,241,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* BrainMap + FactPanel — left/main area */}
        <div
          style={{
            flex: selectedConcept ? '1 1 60%' : '1 1 100%',
            background: '#0a0a0f',
            padding: '20px',
            transition: 'flex 0.3s ease',
            minHeight: 'calc(100svh - 56px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <BrainMap />
          <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
            <DailyFact />
          </div>
        </div>

        {/* InfoPanel — right side, shown when concept selected */}
        {selectedConcept && (
          <div
            style={{
              flex: '0 0 380px',
              background: '#0d0d1a',
              borderLeft: '1px solid rgba(99,102,241,0.12)',
              padding: '20px',
              overflowY: 'auto',
              minHeight: 'calc(100svh - 56px)',
            }}
          >
            <InfoPanel />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          height: '28px',
          background: 'rgba(10,10,15,0.98)',
          borderTop: '1px solid rgba(99,102,241,0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '16px',
          fontSize: '11px',
          color: '#334155',
        }}
      >
        <span style={{ color: '#6366f1' }}>◆</span>
        <span>NeuroMap</span>
        <span style={{ marginLeft: 'auto', color: '#1e293b' }}>
          20 concepts loaded
        </span>
      </div>
    </div>
  );
}
