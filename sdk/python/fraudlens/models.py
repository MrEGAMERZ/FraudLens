"""
Data models for the FraudLens SDK.
"""
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class SignalScores:
    ffcs: float = 0.0
    financial_ask: float = 0.0
    domain_trust: float = 0.0
    identity_match: float = 0.0
    linguistic: float = 0.0

    @classmethod
    def from_dict(cls, d: dict) -> "SignalScores":
        return cls(
            ffcs=d.get("ffcs", 0.0),
            financial_ask=d.get("financialAsk", 0.0),
            domain_trust=d.get("domainTrust", 0.0),
            identity_match=d.get("identityMatch", 0.0),
            linguistic=d.get("linguistic", 0.0),
        )


@dataclass
class FunnelStage:
    id: int
    name: str
    status: str  # "present" | "skipped" | "unknown"
    evidence: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "FunnelStage":
        return cls(
            id=d["id"],
            name=d["name"],
            status=d["status"],
            evidence=d.get("evidence"),
        )


@dataclass
class DomainInfo:
    domain: Optional[str] = None
    domain_age_days: Optional[int] = None
    registrar: Optional[str] = None
    ssl_issued_days_ago: Optional[int] = None
    mx_provider: Optional[str] = None
    error: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "DomainInfo":
        return cls(
            domain=d.get("domain"),
            domain_age_days=d.get("domainAgeDays"),
            registrar=d.get("registrar"),
            ssl_issued_days_ago=d.get("sslIssuedDaysAgo"),
            mx_provider=d.get("mxProvider"),
            error=d.get("error"),
        )


@dataclass
class ScanResult:
    scam_threat_index: int
    verdict: str  # "safe" | "caution" | "scam"
    confidence: float
    archetype: Optional[str]
    funnel_compression_ratio: float
    signals: SignalScores
    funnel_stages: List[FunnelStage]
    domain_info: Optional[DomainInfo]
    processing_time_ms: int
    evidence: List[dict] = field(default_factory=list)

    @property
    def is_scam(self) -> bool:
        return self.verdict == "scam"

    @property
    def is_safe(self) -> bool:
        return self.verdict == "safe"

    @property
    def ffcs_stage_summary(self) -> dict:
        """Quick summary of how many stages were present vs skipped."""
        present = sum(1 for s in self.funnel_stages if s.status == "present")
        skipped = sum(1 for s in self.funnel_stages if s.status == "skipped")
        return {"present": present, "skipped": skipped, "total": len(self.funnel_stages)}

    @classmethod
    def from_dict(cls, d: dict) -> "ScanResult":
        return cls(
            scam_threat_index=d.get("scamThreatIndex", 0),
            verdict=d.get("verdict", "unknown"),
            confidence=d.get("confidence", 0.0),
            archetype=d.get("archetype"),
            funnel_compression_ratio=d.get("funnelCompressionRatio", 0.0),
            signals=SignalScores.from_dict(d.get("signals", {})),
            funnel_stages=[FunnelStage.from_dict(s) for s in d.get("funnelStages", [])],
            domain_info=DomainInfo.from_dict(d["domainInfo"]) if d.get("domainInfo") else None,
            processing_time_ms=d.get("processingTimeMs", 0),
            evidence=d.get("evidence", []),
        )
