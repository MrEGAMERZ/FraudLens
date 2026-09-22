// Shared types for backend (mirrors frontend types.ts)

export interface ScanResult {
  scamThreatIndex: number
  verdict: 'legitimate' | 'caution' | 'scam'
  signals: Signals
  funnelStages: FunnelStage[]
  evidence: Evidence[]
  domainInfo: DomainInfo
}

export interface Signals {
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
  evidence?: string
}

export interface Evidence {
  text: string
  signal: keyof Signals
  reason: string
}

export interface DomainInfo {
  domain?: string
  domainAgeDays?: number
  registrar?: string
  sslIssuedDaysAgo?: number
  mxProvider?: string
  error?: string
}
