import type { ScanResult, DomainInfo, ExtractedIoC, FunnelStage } from '../types'

// Weights from FraudLens spec
const WEIGHTS = {
  ffcs: 0.35,
  financialAsk: 0.20,
  domainTrust: 0.20,
  identityMatch: 0.15,
  linguistic: 0.10
}

/**
 * Computes domain trust risk from RDAP, DNS, and SSL data.
 */
function domainTrustRisk(domain: DomainInfo): number {
  let risk = 0
  if (domain.error) return 30 // unknown = mild risk

  // RDAP age risk
  if (domain.domainAgeDays !== undefined) {
    if (domain.domainAgeDays < 14) risk += 60
    else if (domain.domainAgeDays < 30) risk += 45
    else if (domain.domainAgeDays < 90) risk += 25
    else if (domain.domainAgeDays < 365) risk += 10
  } else {
    risk += 15
  }

  // MX record risk
  if (domain.mxProvider === 'No MX records') risk += 20
  else if (!['Google Workspace', 'Microsoft 365'].includes(domain.mxProvider || '')) risk += 10

  // SSL certificate risk
  if (domain.sslIssuedDaysAgo !== undefined) {
    if (domain.sslIssuedDaysAgo < 14) risk += 20
    else if (domain.sslIssuedDaysAgo < 30) risk += 10
  } else {
    risk += 20
  }

  return Math.min(risk, 100)
}

/**
 * Derives the threat archetype based on detected signals and process skips.
 */
function deriveArchetype(scamThreatIndex: number, mlData: any, stages: FunnelStage[]): string {
  if (scamThreatIndex <= 30) {
    return 'Verified Corporate Recruitment'
  }

  const finType = mlData?.financial_ask?.type
  const finChannel = mlData?.financial_ask?.channel
  const textSample = (mlData?.evidence?.map((e: any) => e.text).join(' ') || '').toLowerCase()

  if (finType === 'security_deposit' || textSample.includes('security deposit') || textSample.includes('deposit')) {
    if (textSample.includes('flat') || textSample.includes('apartment') || textSample.includes('tenant')) {
      return 'Advance-Deposit Rental Sublease Trap'
    }
    return 'Advance-Fee Equipment Onboarding Scam'
  }

  if (finChannel === 'upi' || textSample.includes('upi') || textSample.includes('@paytm')) {
    return 'P2P Payment Rail Impersonation Scam'
  }

  if (textSample.includes('telegram') || textSample.includes('rate') || textSample.includes('task')) {
    return 'High-Yield Task & Rating Ponzi Funnel'
  }

  const skippedCount = stages.filter(s => s.status === 'skipped').length
  if (skippedCount >= 4) {
    return 'Severe Hiring Process Collapse Phish'
  }

  return scamThreatIndex >= 61 ? 'High-Confidence Process Fraud' : 'Suspicious Inbound Solicitation'
}

/**
 * Extracts IoCs (Indicators of Compromise) for threat intelligence.
 */
function extractIoCs(mlData: any, domainInfo: DomainInfo): ExtractedIoC[] {
  const iocs: ExtractedIoC[] = []

  if (domainInfo.domain) {
    iocs.push({
      type: 'domain',
      value: domainInfo.domain,
      riskTag: (domainInfo.domainAgeDays !== undefined && domainInfo.domainAgeDays < 30) ? 'Newly Registered Domain' : 'Sender Domain',
      riskLevel: (domainInfo.domainAgeDays !== undefined && domainInfo.domainAgeDays < 30) ? 'critical' : 'neutral',
      details: domainInfo.registrar ? `Registrar: ${domainInfo.registrar}` : undefined
    })
  }

  if (mlData?.financial_ask?.detected && mlData?.financial_ask?.channel) {
    iocs.push({
      type: 'payment_rail',
      value: mlData.financial_ask.channel.toUpperCase(),
      riskTag: 'Suspicious Upfront Rail',
      riskLevel: 'critical',
      details: mlData.financial_ask.quote || 'Demands direct payment transfer before onboarding'
    })
  }

  if (mlData?.extracted_company) {
    iocs.push({
      type: 'identity',
      value: mlData.extracted_company,
      riskTag: 'Target Entity',
      riskLevel: mlData?.identity_match_risk >= 60 ? 'warning' : 'neutral'
    })
  }

  return iocs
}

/**
 * Fuses ML signals + domain signals into final ScanResult.
 */
export function fusionScore(mlData: any, domainInfo: DomainInfo, latencyMs?: number): ScanResult {
  const domainRisk = domainTrustRisk(domainInfo)

  const signals = {
    ffcs: Math.round(mlData.ffcs_risk ?? 0),
    financialAsk: Math.round(mlData.financial_ask_risk ?? 0),
    domainTrust: domainRisk,
    identityMatch: Math.round(mlData.identity_match_risk ?? 0),
    linguistic: Math.round(mlData.linguistic_risk ?? 0),
  }

  const scamThreatIndex = Math.round(
    signals.ffcs * WEIGHTS.ffcs +
    signals.financialAsk * WEIGHTS.financialAsk +
    signals.domainTrust * WEIGHTS.domainTrust +
    signals.identityMatch * WEIGHTS.identityMatch +
    signals.linguistic * WEIGHTS.linguistic
  )

  const verdict: ScanResult['verdict'] =
    scamThreatIndex >= 61 ? 'scam' : scamThreatIndex >= 31 ? 'caution' : 'legitimate'

  const stages: FunnelStage[] = mlData.funnel_stages ?? []
  const skippedCount = stages.filter(s => s.status === 'skipped').length
  const totalEvaluated = stages.filter(s => s.status !== 'unknown').length || 8
  const funnelCompressionRatio = Math.round((skippedCount / totalEvaluated) * 100)

  const confidence = Math.min(
    99.4,
    Math.round((82 + (mlData.evidence?.length || 0) * 3 + (domainInfo.domainAgeDays ? 5 : 0)) * 10) / 10
  )

  const archetype = deriveArchetype(scamThreatIndex, mlData, stages)
  const extractedIoCs = extractIoCs(mlData, domainInfo)

  return {
    scamThreatIndex,
    verdict,
    confidence,
    analysisTimeMs: latencyMs,
    archetype,
    funnelCompressionRatio,
    signals,
    funnelStages: stages,
    evidence: mlData.evidence ?? [],
    domainInfo,
    extractedIoCs
  }
}
