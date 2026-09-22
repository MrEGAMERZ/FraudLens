import { ShieldAlert, BookOpen, Sparkles } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  activeTab: 'scanner' | 'library'
  setActiveTab: (tab: 'scanner' | 'library') => void
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-group" onClick={() => setActiveTab('scanner')}>
          <div className="logo-badge">
            <ShieldAlert className="logo-icon-svg" />
            <div className="logo-pulse-ring" />
          </div>
          <div className="brand-text-block">
            <div className="brand-row">
              <span className="brand-name">FraudLens</span>
              <span className="brand-version-pill">v2.1 PRO</span>
            </div>
            <span className="brand-subtitle">FRAUD FUNNEL X-RAY & INTELLIGENCE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-item ${activeTab === 'scanner' ? 'nav-item--active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <Sparkles className="nav-icon" size={16} />
            <span>Threat Scanner</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'library' ? 'nav-item--active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <BookOpen className="nav-icon" size={16} />
            <span>Threat Intel Library</span>
            <span className="nav-badge">6 Archetypes</span>
          </button>
        </nav>

        {/* Engine Status */}
        <div className="header-telemetry">
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-label">Engines: <strong className="status-state">Operational</strong></span>
          </div>
        </div>
      </div>
    </header>
  )
}
