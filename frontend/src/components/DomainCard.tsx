import type { DomainInfo } from '../types'
import { Server, Globe, Lock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import './DomainCard.css'

type Props = { info: DomainInfo }

export default function DomainCard({ info }: Props) {
  if (info.error && !info.domain) {
    return (
      <div className="domain-card fade-in">
        <div className="domain-header">
          <div className="domain-badge">
            <Server size={15} className="domain-badge-icon" />
            <span className="mono">INFRASTRUCTURE TELEMETRY</span>
          </div>
          <h3 className="card-title">Domain & Infrastructure Trust</h3>
        </div>
        <div className="domain-empty mono">
          <Globe size={24} className="empty-globe" />
          <p>{info.error}</p>
          <span className="text-muted text-xs">Target contains no verifiable domain host or web endpoints.</span>
        </div>
      </div>
    )
  }

  const ageDays = info.domainAgeDays
  const isBrandNew = ageDays !== undefined && ageDays < 30
  const isYoung = ageDays !== undefined && ageDays < 90

  const mxIsCorporate = info.mxProvider?.includes('Google') || info.mxProvider?.includes('Microsoft')
  const mxIsMissing = info.mxProvider === 'No MX records' || !info.mxProvider

  return (
    <div className="domain-card fade-in">
      <div className="domain-header">
        <div className="domain-badge">
          <Server size={15} className="domain-badge-icon" />
          <span className="mono">INFRASTRUCTURE TELEMETRY</span>
        </div>
        <h3 className="card-title">Domain & Infrastructure Trust</h3>
      </div>

      {/* Target Domain Host Banner */}
      <div className="domain-host-banner">
        <Globe size={18} className="banner-globe-icon" />
        <div className="host-text-group">
          <span className="host-label mono">TARGET HOST IDENTIFIER</span>
          <span className="host-value mono">{info.domain || 'Unknown Host'}</span>
        </div>
        <span
          className={`trust-status-badge mono ${
            isBrandNew ? 'status-critical' : isYoung ? 'status-warning' : 'status-clean'
          }`}
        >
          {isBrandNew ? 'HIGH RISK HOST' : isYoung ? 'UNCONFIRMED AGE' : 'VERIFIED STABLE'}
        </span>
      </div>

      {/* Specs Grid */}
      <div className="domain-metrics-grid">
        {/* RDAP Domain Age */}
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-label">RDAP Domain Age</span>
            {isBrandNew ? (
              <XCircle size={15} className="text-danger" />
            ) : isYoung ? (
              <AlertTriangle size={15} className="text-warning" />
            ) : (
              <CheckCircle2 size={15} className="text-emerald" />
            )}
          </div>
          <div className="metric-val mono">
            {ageDays !== undefined ? `${ageDays} days old` : 'Lookup Unavailable'}
          </div>
          <span className="metric-subtext">
            {isBrandNew
              ? '🚨 Registered < 30 days ago (Classic scam domain profile)'
              : isYoung
              ? '⚠️ Registered < 90 days ago (Recent registration)'
              : '✅ Established domain (> 1 year)'}
          </span>
        </div>

        {/* Registrar */}
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-label">Authoritative Registrar</span>
            <Server size={14} className="text-blue" />
          </div>
          <div className="metric-val mono">{info.registrar || 'Private / Redacted'}</div>
          <span className="metric-subtext">ICANN accredited entity via RDAP protocol</span>
        </div>

        {/* SSL Certificate Date */}
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-label">TLS/SSL Encryption</span>
            {info.sslIssuedDaysAgo !== undefined ? (
              <Lock size={14} className="text-blue" />
            ) : (
              <XCircle size={15} className="text-danger" />
            )}
          </div>
          <div className="metric-val mono">
            {info.sslIssuedDaysAgo !== undefined
              ? `Issued ${info.sslIssuedDaysAgo}d ago`
              : 'Handshake Failed'}
          </div>
          <span className="metric-subtext">
            {info.sslIssuedDaysAgo !== undefined 
              ? 'Automated handshake inspection' 
              : 'No valid SSL cert detected'}
          </span>
        </div>

        {/* MX Mail Routing */}
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-label">Mail Exchange (MX) Provider</span>
            {mxIsCorporate ? (
              <CheckCircle2 size={15} className="text-emerald" />
            ) : mxIsMissing ? (
              <XCircle size={15} className="text-danger" />
            ) : (
              <AlertTriangle size={15} className="text-warning" />
            )}
          </div>
          <div className="metric-val mono">{info.mxProvider || 'No MX Configured'}</div>
          <span className="metric-subtext">
            {mxIsCorporate
              ? 'Verified enterprise mail infrastructure'
              : 'Untrusted / generic mail routing'}
          </span>
        </div>
      </div>
    </div>
  )
}
