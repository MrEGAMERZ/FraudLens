import { useState, lazy, Suspense } from 'react'
import Header from './components/Header'
import { Shield, Code2, Lock } from 'lucide-react'
import './App.css'

// Lazy load heavy components for code-splitting efficiency
const ScannerPage = lazy(() => import('./pages/ScannerPage'))
const ThreatLibrary = lazy(() => import('./components/ThreatLibrary'))

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'library'>('scanner')
  const [prefilledPayload, setPrefilledPayload] = useState<string | null>(null)

  const handleSelectArchetype = (payload: string) => {
    setPrefilledPayload(payload)
    setActiveTab('scanner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <main className="app-main">
        <Suspense fallback={<div className="loading-fallback">Loading intelligence modules...</div>}>
          {activeTab === 'scanner' && (
            <ScannerPage
              externalPayload={prefilledPayload}
              onResetExternalPayload={() => setPrefilledPayload(null)}
            />
          )}

          {activeTab === 'library' && (
            <ThreatLibrary onSelectArchetype={handleSelectArchetype} />
          )}
        </Suspense>
      </main>

      {/* Corporate Security Footer */}
      <footer className="app-footer print-hide">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-brand">
              <Shield size={16} className="footer-logo-icon" />
              <span className="footer-brand-title">FraudLens Security Intelligence</span>
            </div>
            <p className="footer-desc">
              Next-generation Fraud Funnel X-Ray engine detecting process collapse, stage skipping, 
              and psychological coercion across digital solicitations.
            </p>
          </div>

          <div className="footer-links-group mono">
            <a
              href="https://github.com/MrEGAMERZ/FraudLens"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              <Code2 size={13} />
              <span>Source Repository</span>
            </a>

            <div className="footer-pill">
              <Lock size={12} className="text-emerald" />
              <span>Zero-Retention Architecture</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar mono">
          <span>© 2026 FraudLens Intelligence Platform. Built for PromptWars × GEN AI Club.</span>
          <span>Engine v2.1.0 • RDAP / DNS / Gemini Flash Fusion</span>
        </div>
      </footer>
    </div>
  )
}
