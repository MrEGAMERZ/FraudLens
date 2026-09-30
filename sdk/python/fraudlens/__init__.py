"""
FraudLens Python SDK
Official Python client for the FraudLens Fraud Detection API.

Usage:
    from fraudlens import FraudLens

    client = FraudLens(base_url="https://fraudlens-sqzh.onrender.com")

    result = client.scan_text("Dear Applicant, pay Rs 4999 security deposit via UPI...")
    print(result.verdict)          # "scam"
    print(result.scam_threat_index) # 87
    print(result.ffcs_stage_summary) # {"present": 2, "skipped": 6}
"""

from .client import FraudLens
from .models import ScanResult, FunnelStage, DomainInfo, SignalScores

__all__ = ["FraudLens", "ScanResult", "FunnelStage", "DomainInfo", "SignalScores"]
__version__ = "1.0.0"
