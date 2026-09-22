// Types shared between frontend components

export interface ScanResult {
  scamThreatIndex: number;           // 0–100 overall score
  verdict: 'legitimate' | 'caution' | 'scam';
  signals: Signals;
  funnelStages: FunnelStage[];
  evidence: Evidence[];
  domainInfo: DomainInfo;
}

export interface Signals {
  ffcs: number;           // Fraud Funnel Compression Score (0–100 risk)
  financialAsk: number;   // Financial Ask Fingerprint (0–100 risk)
  domainTrust: number;    // Domain Trust risk (0–100)
  identityMatch: number;  // Identity Match risk (0–100)
  linguistic: number;     // Linguistic Manipulation risk (0–100)
}

export interface FunnelStage {
  id: number;
  name: string;
  status: 'present' | 'skipped' | 'unknown';
  evidence?: string;
}

export interface Evidence {
  text: string;
  signal: keyof Signals;
  reason: string;
}

export interface DomainInfo {
  domain?: string;
  domainAgeDays?: number;
  registrar?: string;
  sslIssuedDaysAgo?: number;
  mxProvider?: string;
  error?: string;
}

export type ScanInput = {
  text?: string;
  url?: string;
}
