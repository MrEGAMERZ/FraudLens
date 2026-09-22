import { useState } from 'react'
import type { ScanResult } from '../types'
import { MessageSquareText, Copy, Check, Sparkles, ShieldCheck, Send, AlertTriangle } from 'lucide-react'
import './CounterInquiryPanel.css'

interface CounterInquiryPanelProps {
  scanResult: ScanResult
  rawInput?: string
}

type Strategy = 'corporate_verify' | 'refuse_deposit' | 'in_person_walkin'

export default function CounterInquiryPanel({ scanResult }: CounterInquiryPanelProps) {
  const [strategy, setStrategy] = useState<Strategy>('corporate_verify')
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Extract detected company or domain
  const domain = scanResult.domainInfo?.domain || 'company-domain.com'
  const isHighRisk = scanResult.scamThreatIndex >= 50

  const getResponseTemplate = (strat: Strategy): string => {
    switch (strat) {
      case 'corporate_verify':
        return `Dear Hiring Team,

Thank you for your correspondence regarding the position. Before proceeding with onboarding and document submission, our university compliance advisor requires us to verify employer credentials.

Could you kindly provide:
1. The official corporate CIN / Registration number for your entity.
2. An email confirmation sent directly from your primary enterprise domain (e.g. @${domain.includes('net') || domain.includes('gmail') ? 'primary-official-domain.com' : domain}).
3. A contact number for your central HR or talent acquisition office for background verification.

Once verified through our placement registry, I will be delighted to move forward with the formal documentation.

Kind regards,
Applicant`

      case 'refuse_deposit':
        return `Dear Talent Acquisition,

Thank you for extending the offer. Regarding the requested security deposit / equipment advance fee, standard employment regulations and university guidelines prohibit candidates from making upfront monetary transfers or deposits.

If equipment or administrative processing costs are required, please feel free to deduct this amount directly from my initial monthly payroll disbursement once onboarding is formalized.

Please let me know if we can proceed under this standard arrangement.

Best regards,
Applicant`

      case 'in_person_walkin':
        return `Dear Team,

Thank you for the communication. Given that no formal virtual interview was conducted, I would appreciate the opportunity to visit your registered office premises for an in-person verification and briefing with the team.

Please let me know your corporate office address and available visiting hours this week so I can schedule an appointment.

Sincerely,
Applicant`
    }
  }

  const [customResponse, setCustomResponse] = useState(getResponseTemplate('corporate_verify'))

  const handleStrategyChange = (newStrat: Strategy) => {
    setStrategy(newStrat)
    setIsGenerating(true)
    setTimeout(() => {
      setCustomResponse(getResponseTemplate(newStrat))
      setIsGenerating(false)
    }, 280)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(customResponse)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="counter-inquiry-card">
      <div className="counter-inquiry-header">
        <div className="header-badge-group">
          <div className="inquiry-icon-badge">
            <MessageSquareText size={18} className="text-cyan" />
          </div>
          <div>
            <div className="title-row">
              <h3 className="inquiry-title">AI Safe Counter-Inquiry Generator</h3>
              <span className="inquiry-pill mono">
                <Sparkles size={11} /> Gemini Co-Pilot
              </span>
            </div>
            <p className="inquiry-desc">
              Generate polite, legally non-confrontational verification responses to test recruiter legitimacy without disclosing sensitive personal information.
            </p>
          </div>
        </div>

        {isHighRisk && (
          <div className="risk-callout-pill mono">
            <AlertTriangle size={13} />
            <span>Recommended Defense Action</span>
          </div>
        )}
      </div>

      {/* Strategy Selector Tabs */}
      <div className="strategy-tabs-bar mono">
        <span className="strategy-label">Response Tactic:</span>
        <div className="strategy-buttons">
          <button
            className={`strategy-btn ${strategy === 'corporate_verify' ? 'strategy-btn--active' : ''}`}
            onClick={() => handleStrategyChange('corporate_verify')}
          >
            <ShieldCheck size={13} />
            <span>Demand Entity Verification</span>
          </button>

          <button
            className={`strategy-btn ${strategy === 'refuse_deposit' ? 'strategy-btn--active' : ''}`}
            onClick={() => handleStrategyChange('refuse_deposit')}
          >
            <span>🚫 Refuse Upfront Deposit</span>
          </button>

          <button
            className={`strategy-btn ${strategy === 'in_person_walkin' ? 'strategy-btn--active' : ''}`}
            onClick={() => handleStrategyChange('in_person_walkin')}
          >
            <span>📍 Request Office Walk-In</span>
          </button>
        </div>
      </div>

      {/* Response Display Box */}
      <div className="response-box-wrapper">
        <div className="response-box-header mono">
          <span className="response-status-indicator">
            <span className="status-dot-active" />
            {isGenerating ? 'Synthesizing Tactical Response...' : 'Generated Safety Draft'}
          </span>
          <button className="btn-copy-action mono" onClick={handleCopy} disabled={isGenerating}>
            {copied ? (
              <>
                <Check size={13} className="text-emerald" />
                <span className="text-emerald">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Response</span>
              </>
            )}
          </button>
        </div>

        <textarea
          className="response-textarea mono"
          value={customResponse}
          onChange={(e) => setCustomResponse(e.target.value)}
          rows={11}
          placeholder="Generating counter response..."
        />

        <div className="response-footer-bar mono">
          <div className="footer-tip">
            💡 <strong>Pro-Tip:</strong> Legitimate recruiters will readily provide CIN numbers or official corporate email verification. Scammers will immediately sever contact or intensify artificial urgency.
          </div>
          <button
            className="btn-mailto-action"
            onClick={() => {
              window.location.href = `mailto:?subject=Regarding Employment Offer Verification&body=${encodeURIComponent(customResponse)}`
            }}
          >
            <Send size={13} />
            <span>Open in Mail</span>
          </button>
        </div>
      </div>
    </div>
  )
}
