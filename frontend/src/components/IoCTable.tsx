import { useState } from 'react'
import type { ExtractedIoC, DomainInfo } from '../types'
import { ShieldCheck, Copy, Check, ExternalLink, Hash, Mail, Globe, CreditCard } from 'lucide-react'
import './IoCTable.css'

interface IoCTableProps {
  iocs?: ExtractedIoC[]
  domainInfo?: DomainInfo
  rawText?: string
}

export default function IoCTable({ iocs = [], domainInfo, rawText = '' }: IoCTableProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  // Derive IoCs dynamically if backend didn't provide pre-parsed list
  const derivedIoCs: ExtractedIoC[] = [...iocs]

  if (derivedIoCs.length === 0 && rawText) {
    // 1. Email extraction
    const emailMatches = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
    emailMatches.forEach(email => {
      const isFreeMail = /gmail|yahoo|hotmail|outlook/i.test(email)
      const isSuspicious = /paytm|careers|hr|support|techglobal/i.test(email)
      derivedIoCs.push({
        type: 'email',
        value: email,
        riskTag: isFreeMail ? 'Free Mailbox Provider' : isSuspicious ? 'Domain Spoofing Risk' : 'Inbound Sender',
        riskLevel: isFreeMail || isSuspicious ? 'critical' : 'warning'
      })
    })

    // 2. UPI / Payment rails
    const upiMatches = rawText.match(/[a-zA-Z0-9.\-_]{2,49}@(paytm|upi|okaxis|okhdfcbank|ibl|ybl|axl)/gi) || []
    upiMatches.forEach(upi => {
      derivedIoCs.push({
        type: 'payment_rail',
        value: upi,
        riskTag: 'Personal P2P UPI Transfer',
        riskLevel: 'critical',
        details: 'Legitimate employers never solicit payments via consumer UPI'
      })
    })

    // 3. URLs
    const urlMatches = rawText.match(/https?:\/\/[^\s]+/g) || []
    urlMatches.forEach(url => {
      const isShortlink = /bit\.ly|tinyurl|t\.me|cutt\.ly|linktr\.ee/i.test(url)
      derivedIoCs.push({
        type: 'url',
        value: url,
        riskTag: isShortlink ? 'Obfuscated Shortlink / Redirect' : 'External Web Link',
        riskLevel: isShortlink ? 'critical' : 'warning'
      })
    })

    // 4. Domain check from domainInfo
    if (domainInfo?.domain && !derivedIoCs.some(i => i.value === domainInfo.domain)) {
      const isYoung = (domainInfo.domainAgeDays ?? 999) < 60
      derivedIoCs.push({
        type: 'domain',
        value: domainInfo.domain,
        riskTag: isYoung ? 'Newly Registered Domain' : 'Infrastructure Host',
        riskLevel: isYoung ? 'critical' : 'neutral',
        details: domainInfo.registrar ? `Registrar: ${domainInfo.registrar}` : undefined
      })
    }
  }

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val)
    setCopiedValue(val)
    setTimeout(() => setCopiedValue(null), 2000)
  }

  const getIcon = (type: ExtractedIoC['type']) => {
    switch (type) {
      case 'email': return <Mail size={14} className="ioc-type-icon" />
      case 'domain': return <Globe size={14} className="ioc-type-icon" />
      case 'payment_rail': return <CreditCard size={14} className="ioc-type-icon text-rose" />
      case 'url': return <ExternalLink size={14} className="ioc-type-icon" />
      default: return <Hash size={14} className="ioc-type-icon" />
    }
  }

  return (
    <div className="ioc-card fade-in">
      <div className="ioc-header">
        <div className="ioc-title-group">
          <div className="ioc-badge">
            <Hash size={15} className="ioc-badge-icon" />
            <span className="mono">INDICATORS OF COMPROMISE (IoC)</span>
          </div>
          <h3 className="card-title">Extracted Forensic Entities</h3>
        </div>
        <span className="ioc-counter mono">{derivedIoCs.length} Entities Found</span>
      </div>

      {derivedIoCs.length === 0 ? (
        <div className="ioc-empty mono">
          <ShieldCheck size={28} className="empty-icon" />
          <p>No high-risk external IoCs (spoofed emails, payment rails, shortlinks) identified.</p>
        </div>
      ) : (
        <div className="ioc-table-wrapper">
          <table className="ioc-table mono">
            <thead>
              <tr>
                <th>Vector</th>
                <th>Entity Value</th>
                <th>Classification Tag</th>
                <th>Severity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {derivedIoCs.map((ioc, idx) => (
                <tr key={idx} className={`ioc-row ioc-row--${ioc.riskLevel}`}>
                  <td className="ioc-col-type">
                    <span className="ioc-type-badge">
                      {getIcon(ioc.type)}
                      <span>{ioc.type.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="ioc-col-val" title={ioc.value}>
                    <span className="ioc-val-text">{ioc.value}</span>
                  </td>
                  <td className="ioc-col-tag">
                    <span className="ioc-risk-tag">{ioc.riskTag}</span>
                  </td>
                  <td className="ioc-col-severity">
                    <span className={`ioc-severity-pill severity-${ioc.riskLevel}`}>
                      {ioc.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="ioc-col-action">
                    <button
                      className="btn-copy-ioc"
                      onClick={() => handleCopy(ioc.value)}
                      title="Copy entity to clipboard"
                    >
                      {copiedValue === ioc.value ? (
                        <Check size={13} className="text-emerald" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
