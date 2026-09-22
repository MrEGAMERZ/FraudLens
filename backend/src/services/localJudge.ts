import type { FunnelStage, Evidence } from '../types'

export interface LocalJudgeOutput {
  funnel_stages: FunnelStage[]
  ffcs_risk: number
  financial_ask: {
    detected: boolean
    type: string
    channel: string
    urgency_coupled: boolean
    quote: string | null
  }
  financial_ask_risk: number
  linguistic_markers: Array<{ technique: string; quote: string }>
  linguistic_risk: number
  extracted_company: string | null
  extracted_domain: string | null
  identity_match_risk: number
  evidence: Evidence[]
}

/**
 * High-performance, zero-latency TypeScript heuristic judge.
 * Guarantees 100% backend availability even if the Python ML microservice is restarting.
 */
export function runLocalProcessJudge(text: string): LocalJudgeOutput {
  const lower = text.toLowerCase()

  // 1. Detect Financial Ask & Payment Urgency
  const hasNegatedPayment = /(no payment|no deposit|no fees?|never ask.*payment|not require.*payment)/i.test(lower)
  const hasMoneyDemand = /(pay|transfer|deposit of|fee of|security deposit|processing fee|charge of|₹\s*\d+|\$\s*\d+)/i.test(lower)
  const hasMoney = hasMoneyDemand && !hasNegatedPayment
  const hasUpi = /(@paytm|@upi|@okhdfcbank|@okaxis|@ybl|zelle|crypto|wallet|wire)/i.test(lower) && !hasNegatedPayment
  const hasUrgency = /(within \d+ hours?|immediately|revoked|urgent|today only|2 hours|24 hours|deadline)/i.test(lower)
  const hasNoInterview = /(no interview|directly selected|without interview|instant selection)/i.test(lower)
  const hasRealInterview = /(interview with|completed your.*interview|rounds? of interview|technical interview)/i.test(lower)
  const hasBgCheck = /(background verification|bgv|reference check|contingent on)/i.test(lower)

  // 2. Domain & Identity Extraction
  let extractedDomain: string | null = null
  const emailMatch = text.match(/[\w.-]+@([\w.-]+\.[a-zA-Z]{2,})/)
  if (emailMatch) {
    extractedDomain = emailMatch[1].toLowerCase()
  }

  let extractedCompany: string | null = null
  const companyMatch = text.match(/(?:at|with|for)\s+([A-Z][A-Za-z0-9&.\s]{2,30}?)(?:\s+(?:Inc|LLC|Ltd|Corp|Solutions|Technologies|Limited))?/i)
  if (companyMatch) {
    extractedCompany = companyMatch[1].trim()
  }

  // 3. Evaluate Canonical 8-Stage Process Graph
  const stages: FunnelStage[] = [
    {
      id: 0,
      name: 'Application Acknowledged',
      status: (lower.includes('resume') || lower.includes('application') || lower.includes('linkedin')) ? 'present' : 'unknown',
      evidence: lower.includes('resume') ? 'Candidate resume acknowledged' : null
    },
    {
      id: 1,
      name: 'Screening Call',
      status: hasNoInterview ? 'skipped' : (lower.includes('screening') || lower.includes('phone call')) ? 'present' : hasMoney ? 'skipped' : 'unknown',
      evidence: hasNoInterview ? 'Bypassed screening round directly' : null
    },
    {
      id: 2,
      name: 'Interview(s)',
      status: hasRealInterview ? 'present' : (hasNoInterview || hasMoney) ? 'skipped' : 'unknown',
      evidence: hasRealInterview ? 'Documented interview round completed' : hasNoInterview ? 'No interview required' : null
    },
    {
      id: 3,
      name: 'Salary Negotiation',
      status: (lower.includes('as discussed') || lower.includes('negotiat') || (lower.includes('lpa') && !hasMoney)) ? 'present' : 'skipped',
      evidence: null
    },
    {
      id: 4,
      name: 'Written Offer',
      status: (lower.includes('offer') || lower.includes('position of')) ? 'present' : 'unknown',
      evidence: lower.includes('offer') ? 'Formal offer extended' : null
    },
    {
      id: 5,
      name: 'Background Check',
      status: hasBgCheck ? 'present' : hasMoney ? 'skipped' : 'unknown',
      evidence: hasBgCheck ? 'Contingent on standard verification' : null
    },
    {
      id: 6,
      name: 'Signed Offer',
      status: (lower.includes('sign') || lower.includes('portal') || lower.includes('hrms') || lower.includes('acceptance')) ? 'present' : 'skipped',
      evidence: null
    },
    {
      id: 7,
      name: 'Payroll Onboarding',
      status: (hasMoney && (hasUpi || lower.includes('deposit') || lower.includes('fee'))) ? 'skipped' : 'present',
      evidence: (hasMoney && hasUpi) ? 'Deposit required prior to onboarding' : null
    }
  ]

  // 4. Calculate Individual Risk Scores
  const evidence: Evidence[] = []

  // Financial Ask Risk
  let financialRisk = 0
  if (hasMoney) {
    financialRisk = hasUrgency ? 95 : 85
    evidence.push({
      text: 'Upfront deposit or fee demanded prior to commencement',
      signal: 'financialAsk',
      reason: 'Legitimate employers and verified landlords never charge upfront processing fees via consumer rails.',
      severity: 'critical'
    })
  }

  // Process Compression Risk (FFCS)
  let ffcsRisk = 15
  if (hasNoInterview || (hasMoney && !hasRealInterview)) {
    ffcsRisk = 92
    evidence.push({
      text: 'Drastic process compression detected',
      signal: 'ffcs',
      reason: 'Hiring stages (screening, technical evaluation, negotiation) were bypassed to rush candidate toward payment.',
      severity: 'critical'
    })
  } else if (hasRealInterview) {
    ffcsRisk = 8
  }

  // Linguistic Risk
  let linguisticRisk = 5
  if (hasUrgency) {
    linguisticRisk += 50
    evidence.push({
      text: 'Manufactured deadline pressure',
      signal: 'linguistic',
      reason: 'Urgency tactics (threat of revocation within hours) coerce unreflective compliance.',
      severity: 'warning'
    })
  }
  if (hasNoInterview) {
    linguisticRisk += 35
  }
  linguisticRisk = Math.min(linguisticRisk, 100)

  // Identity Match Risk
  let identityRisk = 10
  if (extractedDomain && (extractedDomain.includes('-india') || extractedDomain.includes('-careers') || extractedDomain.includes('solutions-'))) {
    identityRisk = 75
    evidence.push({
      text: `Suspicious domain pattern: ${extractedDomain}`,
      signal: 'identityMatch',
      reason: 'Lookalike naming convention commonly observed in phishing infrastructure.',
      severity: 'critical'
    })
  }

  return {
    funnel_stages: stages,
    ffcs_risk: ffcsRisk,
    financial_ask: {
      detected: hasMoney,
      type: lower.includes('deposit') ? 'security_deposit' : lower.includes('fee') ? 'processing_fee' : 'none',
      channel: hasUpi ? 'upi' : lower.includes('transfer') ? 'bank_transfer' : 'none',
      urgency_coupled: hasUrgency,
      quote: hasMoney ? 'Payment requested with deadline' : null
    },
    financial_ask_risk: financialRisk,
    linguistic_markers: hasUrgency ? [{ technique: 'Artificial Urgency', quote: 'Must be completed within strict timeframe' }] : [],
    linguistic_risk: linguisticRisk,
    extracted_company: extractedCompany || (extractedDomain ? extractedDomain.split('.')[0] : null),
    extracted_domain: extractedDomain,
    identity_match_risk: identityRisk,
    evidence
  }
}
