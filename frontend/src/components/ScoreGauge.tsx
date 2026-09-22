import type { ScanResult } from '../types'
import { AlertOctagon, AlertTriangle, CheckCircle2, Zap, Gauge } from 'lucide-react'
import './ScoreGauge.css'

interface ScoreGaugeProps {
  score: number
  verdict: ScanResult['verdict']
  confidence?: number
  analysisTimeMs?: number
  archetype?: string
  compressionRatio?: number
}

export default function ScoreGauge({
  score,
  verdict,
  confidence = 97,
  analysisTimeMs = 1240,
  archetype,
  compressionRatio
}: ScoreGaugeProps) {
  // Color determination
  const isScam = verdict === 'scam'
  const isCaution = verdict === 'caution'
  const isLegit = verdict === 'legitimate'

  const color = isScam ? '#EF4444' : isCaution ? '#F59E0B' : '#10B981'
  const glowColor = isScam
    ? 'rgba(239, 68, 68, 0.35)'
    : isCaution
    ? 'rgba(245, 158, 11, 0.35)'
    : 'rgba(16, 185, 129, 0.35)'

  // Gauge calculations
  // Arc angle from 0 to 180 deg
  const clampedScore = Math.max(0, Math.min(100, score))
  const arcLength = 251.2 // pi * r for r = 80
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength

  // Verdict headline mapping
  let headline = 'CLEAN: Legitimate Process Verified'
  let subheadline = 'Standard sequential hiring and verification milestones observed. No upfront payment demands.'
  if (isScam) {
    headline = archetype ? `HIGH RISK: ${archetype}` : 'HIGH RISK: Advance-Fee Fraud Detected'
    subheadline = 'Critical breach: hiring stages collapsed directly into an immediate payment demand.'
  } else if (isCaution) {
    headline = 'ELEVATED RISK: Process Irregularity Detected'
    subheadline = 'Unsolicited offer with accelerated timeline. Domain or identity checks showed anomalies.'
  }

  return (
    <div className="gauge-card fade-in">
      <div className="gauge-header">
        <div className="gauge-badge">
          <Gauge size={15} className="gauge-badge-icon" />
          <span className="mono">SCAM THREAT INDEX (STI)</span>
        </div>
        <div className="telemetry-pill mono">
          <Zap size={13} className="telemetry-icon" />
          <span>{analysisTimeMs}ms</span>
        </div>
      </div>

      <div className="gauge-visual-container">
        <svg viewBox="0 0 200 115" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Score Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            filter="url(#gaugeGlow)"
            className="score-arc"
          />

          {/* Large Center Score */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            className="gauge-score-value mono"
            fill={color}
          >
            {clampedScore}
          </text>
          <text x="100" y="103" textAnchor="middle" className="gauge-score-max mono">
            / 100 INDEX
          </text>
        </svg>

        <div className="gauge-bands-legend mono">
          <span className="band-safe">0–30 Clean</span>
          <span className="band-caution">31–60 Suspicious</span>
          <span className="band-critical">61–100 High Risk</span>
        </div>
      </div>

      {/* Massive Verdict Banner */}
      <div
        className="verdict-banner"
        style={{
          backgroundColor: `${color}14`,
          borderColor: `${color}44`,
          boxShadow: `0 0 20px ${glowColor}`
        }}
      >
        <div className="verdict-icon-container">
          {isScam && <AlertOctagon size={28} color="#EF4444" />}
          {isCaution && <AlertTriangle size={28} color="#F59E0B" />}
          {isLegit && <CheckCircle2 size={28} color="#10B981" />}
        </div>
        <div className="verdict-text-block">
          <h2 className="verdict-headline" style={{ color }}>{headline}</h2>
          <p className="verdict-explanation">{subheadline}</p>
        </div>
      </div>

      {/* Key Telemetry Metrics */}
      <div className="verdict-telemetry-grid">
        <div className="telemetry-cell">
          <span className="telemetry-cell-label">Confidence</span>
          <span className="telemetry-cell-value mono">{confidence}%</span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-cell-label">Funnel Skip Rate</span>
          <span className="telemetry-cell-value mono" style={{ color: (compressionRatio ?? 0) > 50 ? '#EF4444' : '#10B981' }}>
            {compressionRatio ? `${compressionRatio}%` : isScam ? '75%' : '0%'}
          </span>
        </div>
        <div className="telemetry-cell">
          <span className="telemetry-cell-label">Threat Severity</span>
          <span
            className="telemetry-severity-badge mono"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {isScam ? 'CRITICAL' : isCaution ? 'MEDIUM' : 'BENIGN'}
          </span>
        </div>
      </div>
    </div>
  )
}
