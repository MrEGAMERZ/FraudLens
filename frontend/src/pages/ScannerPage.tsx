import { useState } from 'react'
import axios from 'axios'
import type { ScanResult, ScanInput } from '../types'
import ScoreGauge from '../components/ScoreGauge'
import SignalRadar from '../components/SignalRadar'
import FunnelBar from '../components/FunnelBar'
import EvidencePanel from '../components/EvidencePanel'
import DomainCard from '../components/DomainCard'
import './ScannerPage.css'

const DEMO_SCAM = `Dear Applicant,

We are pleased to inform you that after reviewing your resume on LinkedIn, you have been selected for the position of Remote Data Entry Specialist at TechGlobal Solutions Inc.

You are required to pay a one-time refundable security deposit of ₹4,999 via UPI to confirm your position. This must be done within 2 hours or your offer will be revoked. No interview is required — you have been directly selected. Joining date is immediate.

Please transfer to: 9876543210@paytm
HR Department, TechGlobal Solutions Inc.
hr@techglobal-solutions-india.net`

const DEMO_LEGIT = `Dear Mohammed Rehan,

Thank you for completing your final interview with our engineering team last Thursday. We were impressed with your problem-solving approach and technical depth.

We are pleased to extend an official offer for the role of Software Engineer - II at Bangalore office. Salary: ₹18 LPA. Start date: 1st November 2026.

This offer is contingent on a standard background verification, which our HR team will initiate by email from verify@infosys.com. You will receive a formal offer letter via our HRMS portal within 48 hours. No payment or deposit is required from your side at any point.

Please reply to confirm acceptance at your convenience.

Regards,
Priya Sharma, Talent Acquisition
Infosys Limited`

export default function ScannerPage() {
  const [tab, setTab] = useState<'text' | 'url'>('text')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload: ScanInput = tab === 'text' ? { text: input } : { url: input }
      const { data } = await axios.post<ScanResult>('/api/scan', payload, { timeout: 30000 })
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Scan failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="scanner">
      {/* Input Section */}
      <section className="input-section">
        <div className="tabs">
          <button className={tab === 'text' ? 'tab active' : 'tab'} onClick={() => setTab('text')}>
            📋 Paste Offer Text
          </button>
          <button className={tab === 'url' ? 'tab active' : 'tab'} onClick={() => setTab('url')}>
            🔗 Paste URL
          </button>
        </div>

        {tab === 'text' ? (
          <textarea
            className="input-area"
            placeholder="Paste a job offer letter, rental agreement, or any suspicious message here..."
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={8}
          />
        ) : (
          <input
            className="input-url"
            type="url"
            placeholder="https://example.com/job-offer"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        )}

        <div className="input-actions">
          <div className="demo-buttons">
            <button className="btn-demo" onClick={() => { setTab('text'); setInput(DEMO_SCAM) }}>
              ⚠️ Load Scam Sample
            </button>
            <button className="btn-demo" onClick={() => { setTab('text'); setInput(DEMO_LEGIT) }}>
              ✅ Load Legit Sample
            </button>
          </div>
          <button
            className="btn-scan"
            onClick={handleScan}
            disabled={loading || !input.trim()}
          >
            {loading ? '🔄 Scanning...' : '🔍 Scan Now'}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && <div className="error-banner">❌ {error}</div>}

      {/* Results */}
      {result && (
        <section className="results">
          <div className="results-top">
            <ScoreGauge score={result.scamThreatIndex} verdict={result.verdict} />
            <SignalRadar signals={result.signals} />
          </div>

          <FunnelBar stages={result.funnelStages} />

          <div className="results-bottom">
            <EvidencePanel evidence={result.evidence} />
            <DomainCard info={result.domainInfo} />
          </div>
        </section>
      )}
    </div>
  )
}
