/**
 * FraudLens TypeScript/JavaScript SDK
 * Official client for the FraudLens Fraud Detection API.
 *
 * @example
 * import { FraudLens } from 'fraudlens-sdk'
 *
 * const client = new FraudLens()
 * const result = await client.scanText("You have been selected! Pay Rs 4999 now...")
 * console.log(result.verdict)         // "scam"
 * console.log(result.scamThreatIndex) // 87
 */

export const DEFAULT_BASE_URL = 'https://fraudlens-sqzh.onrender.com'

export interface SignalScores {
  ffcs: number
  financialAsk: number
  domainTrust: number
  identityMatch: number
  linguistic: number
}

export interface FunnelStage {
  id: number
  name: string
  status: 'present' | 'skipped' | 'unknown'
  evidence: string | null
}

export interface DomainInfo {
  domain?: string
  domainAgeDays?: number
  registrar?: string
  sslIssuedDaysAgo?: number
  mxProvider?: string
  error?: string
}

export interface EvidenceItem {
  text: string
  signal: string
  reason: string
}

export interface ScanResult {
  scamThreatIndex: number
  verdict: 'safe' | 'caution' | 'scam'
  confidence: number
  archetype: string | null
  funnelCompressionRatio: number
  signals: SignalScores
  funnelStages: FunnelStage[]
  domainInfo: DomainInfo | null
  processingTimeMs: number
  evidence: EvidenceItem[]
  /** Convenience helpers */
  isScam: boolean
  isSafe: boolean
  skippedStages: FunnelStage[]
}

export class FraudLensError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'FraudLensError'
  }
}

function enrichResult(raw: Omit<ScanResult, 'isScam' | 'isSafe' | 'skippedStages'>): ScanResult {
  return {
    ...raw,
    isScam: raw.verdict === 'scam',
    isSafe: raw.verdict === 'safe',
    skippedStages: (raw.funnelStages ?? []).filter((s) => s.status === 'skipped'),
  }
}

async function parseResponse(res: Response): Promise<ScanResult> {
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.error ?? message
    } catch {
      /* no-op */
    }
    throw new FraudLensError(res.status, message)
  }
  const data = await res.json()
  return enrichResult(data)
}

export class FraudLens {
  private baseUrl: string

  /**
   * @param baseUrl  Base URL of the FraudLens backend. Defaults to the public hosted instance.
   */
  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  /**
   * Scan a plain text string for fraud signals.
   * @param text  Raw email body, recruiter message, or any suspicious text.
   */
  async scanText(text: string): Promise<ScanResult> {
    const res = await fetch(`${this.baseUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return parseResponse(res)
  }

  /**
   * Fetch and scan a live URL for fraud indicators.
   * @param url  Full URL of the suspicious job portal or career page.
   */
  async scanUrl(url: string): Promise<ScanResult> {
    const res = await fetch(`${this.baseUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    return parseResponse(res)
  }
}

export default FraudLens
