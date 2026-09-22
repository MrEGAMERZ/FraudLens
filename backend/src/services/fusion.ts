import type { ScanResult, DomainInfo } from '../types'

// Weights from FraudLens spec
const WEIGHTS = { ffcs: 0.35, financialAsk: 0.20, domainTrust: 0.20, identityMatch: 0.15, linguistic: 0.10 }

/**
 * Computes domain trust risk from RDAP, DNS, and SSL data.
 * Young domain (< 30 days) = high risk; < 90 days = medium.
 */
function domainTrustRisk(domain: DomainInfo): number {
  let risk = 0
  if (domain.error) return 30  // unknown = mild risk

  // RDAP age risk (max ~80)
  if (domain.domainAgeDays !== undefined) {
    if (domain.domainAgeDays < 14) risk += 60
    else if (domain.domainAgeDays < 30) risk += 45
    else if (domain.domainAgeDays < 90) risk += 25
    else if (domain.domainAgeDays < 365) risk += 10
  } else {
    // If we can't find age, add a small penalty
    risk += 15
  }

  // MX record risk (max ~20)
  if (domain.mxProvider === 'No MX records') risk += 20
  else if (!['Google Workspace', 'Microsoft 365'].includes(domain.mxProvider || '')) risk += 10

  // SSL certificate risk (max ~20)
  if (domain.sslIssuedDaysAgo !== undefined) {
    if (domain.sslIssuedDaysAgo < 14) risk += 20
    else if (domain.sslIssuedDaysAgo < 30) risk += 10
  } else {
    // Missing SSL / TLS error
    risk += 20
  }

  return Math.min(risk, 100)
}

/**
 * Fuses ML signals + domain signals into final ScanResult.
 */
export function fusionScore(mlData: any, domainInfo: DomainInfo): ScanResult {
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

  return {
    scamThreatIndex,
    verdict,
    signals,
    funnelStages: mlData.funnel_stages ?? [],
    evidence: mlData.evidence ?? [],
    domainInfo,
  }
}
