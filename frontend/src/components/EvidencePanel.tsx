import type { Evidence } from '../types'
import './EvidencePanel.css'

type Props = { evidence: Evidence[] }

const SIGNAL_COLORS: Record<string, string> = {
  ffcs: '#8b5cf6',
  financialAsk: '#f59e0b',
  domainTrust: '#3b82f6',
  identityMatch: '#ec4899',
  linguistic: '#ef4444',
}

const SIGNAL_NAMES: Record<string, string> = {
  ffcs: 'Funnel',
  financialAsk: 'Financial',
  domainTrust: 'Domain',
  identityMatch: 'Identity',
  linguistic: 'Linguistic',
}

export default function EvidencePanel({ evidence }: Props) {
  if (!evidence.length) return (
    <div className="evidence-card">
      <h3 className="card-title">Evidence</h3>
      <p className="muted-text">No specific red flags detected in the text.</p>
    </div>
  )

  return (
    <div className="evidence-card">
      <h3 className="card-title">Evidence Panel</h3>
      <div className="evidence-list">
        {evidence.map((e, i) => (
          <div key={i} className="evidence-item">
            <span
              className="evidence-tag"
              style={{ background: `${SIGNAL_COLORS[e.signal]}22`, color: SIGNAL_COLORS[e.signal], borderColor: SIGNAL_COLORS[e.signal] }}
            >
              {SIGNAL_NAMES[e.signal] || e.signal}
            </span>
            <div className="evidence-content">
              <blockquote className="evidence-quote">"{e.text}"</blockquote>
              <p className="evidence-reason">{e.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
