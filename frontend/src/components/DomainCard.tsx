import type { DomainInfo } from '../types'
import './DomainCard.css'

type Props = { info: DomainInfo }

function Row({ label, value, risk }: { label: string; value?: string | number; risk?: boolean }) {
  return (
    <div className="domain-row">
      <span className="domain-label">{label}</span>
      <span className={`domain-value ${risk ? 'risk' : ''}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function DomainCard({ info }: Props) {
  if (info.error) return (
    <div className="domain-card">
      <h3 className="card-title">Technical Trust</h3>
      <p className="muted-text">⚠️ {info.error}</p>
    </div>
  )

  const domainAgeRisk = info.domainAgeDays !== undefined && info.domainAgeDays < 90
  const sslRisk = info.sslIssuedDaysAgo !== undefined && info.sslIssuedDaysAgo < 30

  return (
    <div className="domain-card">
      <h3 className="card-title">Technical Trust</h3>
      <Row label="Domain" value={info.domain} />
      <Row
        label="Domain Age"
        value={info.domainAgeDays !== undefined ? `${info.domainAgeDays} days` : undefined}
        risk={domainAgeRisk}
      />
      <Row label="Registrar" value={info.registrar} />
      <Row
        label="SSL Issued"
        value={info.sslIssuedDaysAgo !== undefined ? `${info.sslIssuedDaysAgo} days ago` : undefined}
        risk={sslRisk}
      />
      <Row label="Mail Provider" value={info.mxProvider} />
      {domainAgeRisk && (
        <p className="domain-warning">⚠️ Domain registered less than 90 days ago — high risk.</p>
      )}
    </div>
  )
}
