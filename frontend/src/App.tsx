
import ScannerPage from './pages/ScannerPage'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">FraudLens</span>
          </div>
          <p className="logo-tagline">Fraud Funnel X-Ray — Detects <em>process</em>, not just keywords</p>
        </div>
      </header>
      <main>
        <ScannerPage />
      </main>
    </div>
  )
}
