import type { Signals } from '../types'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart } from 'lucide-react'
import './SignalRadar.css'

type Props = { signals: Signals }

const SIGNAL_LABELS: Record<keyof Signals, { label: string; desc: string }> = {
  ffcs: { label: 'Funnel Compression', desc: 'Bypassed canonical process stages' },
  financialAsk: { label: 'Financial Demand', desc: 'Upfront fees, UPI, gift cards' },
  domainTrust: { label: 'Domain & Infra', desc: 'RDAP age, SSL, MX security' },
  identityMatch: { label: 'Identity Spoofing', desc: 'Brand name & lookalike domains' },
  linguistic: { label: 'Psychological Coercion', desc: 'Urgency, scarcity, isolation' },
}

const WEIGHTS: Record<keyof Signals, number> = {
  ffcs: 35,
  financialAsk: 20,
  domainTrust: 20,
  identityMatch: 15,
  linguistic: 10,
}

export default function SignalRadar({ signals }: Props) {
  const chartData = (Object.keys(signals) as Array<keyof Signals>).map(key => ({
    key,
    subject: SIGNAL_LABELS[key]?.label || key,
    risk: signals[key] ?? 0,
    weight: WEIGHTS[key] ?? 10
  }))

  return (
    <div className="radar-card fade-in">
      <div className="radar-header">
        <div className="radar-badge">
          <PieChart size={15} className="radar-badge-icon" />
          <span className="mono">MULTI-VECTOR SIGNAL FUSION</span>
        </div>
        <h3 className="card-title">Orthogonal Threat Radar</h3>
      </div>

      {/* Radar Visual */}
      <div className="radar-chart-box">
        <ResponsiveContainer width="100%" height={230}>
          <RadarChart data={chartData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94A3B8', fontSize: 10.5, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            />
            <Radar
              name="Threat Vector Risk"
              dataKey="risk"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="#3B82F6"
              fillOpacity={0.25}
              dot={{ fill: '#60A5FA', r: 3.5, strokeWidth: 1, stroke: '#1E293B' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                fontSize: 12,
                color: '#F8FAFC',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}
              formatter={(val: number) => [`${val}/100 Risk Score`, 'Vector Severity']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Weighted Sub-Score Progress Bars */}
      <div className="signal-bars-stack">
        {chartData.map(({ key, subject, risk, weight }) => {
          const isHigh = risk >= 60
          const isMed = risk >= 30 && risk < 60
          const barColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981'

          return (
            <div key={key} className="signal-bar-item">
              <div className="signal-bar-header">
                <div className="signal-title-wrap">
                  <span className="signal-name">{subject}</span>
                  <span className="signal-desc">{SIGNAL_LABELS[key as keyof Signals]?.desc}</span>
                </div>
                <div className="signal-scores-wrap mono">
                  <span className="signal-risk-val" style={{ color: barColor }}>
                    {risk}/100
                  </span>
                  <span className="signal-weight-pill">w: {weight}%</span>
                </div>
              </div>
              <div className="signal-track">
                <div
                  className="signal-fill"
                  style={{
                    width: `${Math.max(risk, 3)}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 8px ${barColor}66`
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
