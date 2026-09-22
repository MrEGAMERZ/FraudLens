import type { ScanResult } from '../types'
import './ScoreGauge.css'

type Props = { score: number; verdict: ScanResult['verdict'] }

const COLORS = { legitimate: '#10b981', caution: '#f59e0b', scam: '#ef4444' }
const LABELS = { legitimate: 'Looks Legitimate', caution: 'Exercise Caution', scam: 'High-Confidence Scam' }

export default function ScoreGauge({ score, verdict }: Props) {
  const color = COLORS[verdict]
  const deg = (score / 100) * 180

  return (
    <div className="gauge-card">
      <h3 className="card-title">Scam Threat Index</h3>
      <div className="gauge-wrapper">
        <svg viewBox="0 0 200 110" className="gauge-svg">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1f2937" strokeWidth="16" strokeLinecap="round" />
          {/* Score arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(deg / 180) * 251} 251`}
          />
          {/* Score text */}
          <text x="100" y="88" textAnchor="middle" fontSize="32" fontWeight="700" fill={color}>
            {score}
          </text>
          <text x="100" y="104" textAnchor="middle" fontSize="11" fill="#6b7280">
            out of 100
          </text>
        </svg>
        <div className="gauge-bands">
          <span style={{ color: '#10b981' }}>0–30 Safe</span>
          <span style={{ color: '#f59e0b' }}>31–60 Caution</span>
          <span style={{ color: '#ef4444' }}>61+ Scam</span>
        </div>
      </div>
      <div className="gauge-verdict" style={{ background: `${color}22`, borderColor: color, color }}>
        {verdict === 'scam' ? '🚨' : verdict === 'caution' ? '⚠️' : '✅'} {LABELS[verdict]}
      </div>
    </div>
  )
}
