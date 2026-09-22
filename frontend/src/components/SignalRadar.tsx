import type { Signals } from '../types'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import './SignalRadar.css'

type Props = { signals: Signals }

const SIGNAL_LABELS: Record<keyof Signals, string> = {
  ffcs: 'Funnel Compression',
  financialAsk: 'Financial Ask',
  domainTrust: 'Domain Trust',
  identityMatch: 'Identity Match',
  linguistic: 'Linguistic Tactics',
}

const WEIGHTS: Record<keyof Signals, number> = {
  ffcs: 35, financialAsk: 20, domainTrust: 20, identityMatch: 15, linguistic: 10,
}

export default function SignalRadar({ signals }: Props) {
  const data = (Object.keys(signals) as Array<keyof Signals>).map(key => ({
    signal: SIGNAL_LABELS[key],
    risk: signals[key],
    weight: WEIGHTS[key],
  }))

  return (
    <div className="radar-card">
      <h3 className="card-title">Signal Breakdown</h3>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data}>
          <PolarGrid stroke="#1f2937" />
          <PolarAngleAxis dataKey="signal" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Radar
            name="Risk"
            dataKey="risk"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.25}
            dot={{ fill: '#ef4444', r: 3 }}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
            formatter={(v: number) => [`${v}/100`, 'Risk Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="signal-bars">
        {data.map(({ signal, risk, weight }) => (
          <div key={signal} className="signal-row">
            <span className="signal-label">{signal}</span>
            <div className="signal-bar-track">
              <div
                className="signal-bar-fill"
                style={{ width: `${risk}%`, background: risk > 60 ? '#ef4444' : risk > 30 ? '#f59e0b' : '#10b981' }}
              />
            </div>
            <span className="signal-score">{risk}</span>
            <span className="signal-weight">{weight}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
