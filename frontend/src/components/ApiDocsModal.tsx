import { useState } from 'react'
import { Terminal, Copy, Check, X } from 'lucide-react'
import './ApiDocsModal.css'

interface ApiDocsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiDocsModal({ isOpen, onClose }: ApiDocsModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!isOpen) return null

  const curlExample = `curl -X POST https://api.fraudlens.security/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Dear Applicant, You have been directly selected for Remote Data Entry. Pay ₹4,999 deposit via UPI: 9876543210@paytm within 2 hours to confirm."
  }'`

  const responseExample = `{
  "scamThreatIndex": 88,
  "verdict": "scam",
  "confidence": 98.4,
  "signals": {
    "ffcs": 92,
    "financialAsk": 95,
    "domainTrust": 75,
    "identityMatch": 80,
    "linguistic": 85
  },
  "funnelStages": [
    { "id": 0, "name": "Application Acknowledged", "status": "present" },
    { "id": 1, "name": "Screening Call", "status": "skipped" },
    { "id": 2, "name": "Interview(s)", "status": "skipped" },
    { "id": 7, "name": "Payroll/IT Onboarding", "status": "skipped" }
  ],
  "domainInfo": {
    "domain": "techglobal-solutions-india.net",
    "domainAgeDays": 9,
    "mxProvider": "No MX records"
  }
}`

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-badge mono">
              <Terminal size={14} />
              <span>DEVELOPER API INTEGRATION</span>
            </div>
            <h2 className="modal-title">FraudLens Threat Engine API</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Integrate the Fraud Funnel X-Ray engine into your mail gateways, ATS platforms, HRMS onboarding pipelines, or Chrome extensions.
          </p>

          <div className="api-endpoint-badge mono">
            <span className="method-pill">POST</span>
            <span className="endpoint-url">/api/scan</span>
          </div>

          <div className="code-block-section">
            <div className="code-block-header">
              <span className="code-block-title mono">cURL Request Example</span>
              <button
                className="btn-copy-code mono"
                onClick={() => copyToClipboard(curlExample, 'curl')}
              >
                {copied === 'curl' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="code-pre mono">{curlExample}</pre>
          </div>

          <div className="code-block-section">
            <div className="code-block-header">
              <span className="code-block-title mono">Response Schema (JSON)</span>
              <button
                className="btn-copy-code mono"
                onClick={() => copyToClipboard(responseExample, 'json')}
              >
                {copied === 'json' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied === 'json' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="code-pre mono">{responseExample}</pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-close" onClick={onClose}>
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  )
}
