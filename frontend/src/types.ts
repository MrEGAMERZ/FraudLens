// Types for FraudLens Enterprise Threat Intelligence Platform

export interface ScanResult {
  scamThreatIndex: number;           // 0–100 overall risk score
  verdict: 'legitimate' | 'caution' | 'scam';
  confidence?: number;               // 0-100% confidence rating
  analysisTimeMs?: number;           // Latency in milliseconds
  archetype?: string;                // Detected threat category (e.g. Advance-Fee Scam)
  funnelCompressionRatio?: number;   // % of canonical stages skipped/collapsed
  signals: Signals;
  funnelStages: FunnelStage[];
  evidence: Evidence[];
  domainInfo: DomainInfo;
  extractedIoCs?: ExtractedIoC[];
}

export interface Signals {
  ffcs: number;           // Fraud Funnel Compression Score (0–100 risk)
  financialAsk: number;   // Financial Ask Fingerprint (0–100 risk)
  domainTrust: number;    // Domain & Infrastructure Trust risk (0–100)
  identityMatch: number;  // Identity & Lookalike Match risk (0–100)
  linguistic: number;     // Linguistic & Psychological Manipulation risk (0–100)
}

export interface FunnelStage {
  id: number;
  name: string;
  status: 'present' | 'skipped' | 'unknown';
  evidence?: string | null;
  stageOrderViolation?: boolean;
}

export interface Evidence {
  text: string;
  signal: keyof Signals;
  reason: string;
  severity?: 'critical' | 'warning' | 'info';
  category?: string;
}

export interface DomainInfo {
  domain?: string;
  domainAgeDays?: number;
  registrar?: string;
  sslIssuedDaysAgo?: number;
  mxProvider?: string;
  error?: string;
}

export interface ExtractedIoC {
  type: 'email' | 'domain' | 'url' | 'payment_rail' | 'phone' | 'identity';
  value: string;
  riskTag: string;
  riskLevel: 'critical' | 'warning' | 'neutral';
  details?: string;
}

export type ScanInput = {
  text?: string;
  url?: string;
}

export interface ThreatLibraryEntry {
  id: string;
  title: string;
  category: 'Employment' | 'Real Estate' | 'Task & Gig' | 'Executive Impersonation' | 'Immigration';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  avgVictimLoss: string;
  summary: string;
  funnelSkipPattern: string;
  primaryIoCs: string[];
  psychologicalTactics: string[];
  canonicalStagesSkipped: number[]; // Stage IDs e.g. [1, 2, 3, 5]
  samplePayload: string;
}
