"""
FraudLens Judge — Gemini Flash powered signal extractor.
Single structured LLM call returns: funnel stages, financial ask, linguistic markers,
extracted company name, and domain. Per spec: detect *process*, not keywords.
"""
import os
import json
import re
from typing import Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

SYSTEM_PROMPT = """
You are a fraud detection specialist. Analyze the provided message and return ONLY valid JSON.

Analyze whether this message follows a legitimate hiring/rental process or skips stages to rush toward a payment demand.

Canonical hiring stages (in order):
0 = Application Acknowledged
1 = Screening/Phone Call
2 = Interview(s)
3 = Salary Negotiation
4 = Written Offer
5 = Background/Reference Check
6 = Signed Offer
7 = Payroll/IT Onboarding (NOT candidate-paid equipment)

Return this exact JSON structure:
{
  "funnel_stages": [
    {"id": 0, "name": "Application Acknowledged", "status": "present|skipped|unknown", "evidence": "quote from text or null"},
    {"id": 1, "name": "Screening Call", "status": "present|skipped|unknown", "evidence": null},
    {"id": 2, "name": "Interview(s)", "status": "present|skipped|unknown", "evidence": null},
    {"id": 3, "name": "Salary Negotiation", "status": "present|skipped|unknown", "evidence": null},
    {"id": 4, "name": "Written Offer", "status": "present|skipped|unknown", "evidence": null},
    {"id": 5, "name": "Background Check", "status": "present|skipped|unknown", "evidence": null},
    {"id": 6, "name": "Signed Offer", "status": "present|skipped|unknown", "evidence": null},
    {"id": 7, "name": "Payroll Onboarding", "status": "present|skipped|unknown", "evidence": null}
  ],
  "ffcs_risk": 0-100,
  "financial_ask": {
    "detected": true|false,
    "type": "processing_fee|security_deposit|equipment|visa_fee|none",
    "channel": "upi|bank_transfer|gift_card|crypto|payroll|none",
    "urgency_coupled": true|false,
    "quote": "exact quote or null"
  },
  "financial_ask_risk": 0-100,
  "linguistic_markers": [
    {"technique": "name of technique", "quote": "exact quote"}
  ],
  "linguistic_risk": 0-100,
  "extracted_company": "company name or null",
  "extracted_domain": "domain.com or null",
  "identity_match_risk": 0-100,
  "evidence": [
    {"text": "exact quote", "signal": "ffcs|financialAsk|domainTrust|identityMatch|linguistic", "reason": "explanation"}
  ]
}

Scoring guidelines:
- ffcs_risk: 0 if all stages present in order; 90+ if payment asked with 5+ stages skipped
- financial_ask_risk: 0 if no financial ask; 90+ if non-refundable fee + UPI/gift card + urgency
- linguistic_risk: based on named manipulation techniques detected (isolation, authority mimicry, artificial scarcity, generic salutation on personalized-sounding offer)
- identity_match_risk: 80+ if domain looks like a lookalike of a famous company; 0 if no domain or matches company

Return ONLY the JSON object. No markdown, no explanation.
"""


async def run_judge(text: str) -> dict[str, Any]:
    """Call Gemini Flash and return parsed structured analysis."""
    prompt = f"{SYSTEM_PROMPT}\n\nMESSAGE TO ANALYZE:\n{text[:3000]}"

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,          # low temp for consistent structured output
                max_output_tokens=2048,
            )
        )
        raw = response.text.strip()

        # Strip markdown code fences if model adds them
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)

        data = json.loads(raw)
        return data

    except json.JSONDecodeError as e:
        # Fallback: return a neutral score if parsing fails
        return _fallback_response(f"JSON parse error: {str(e)}")
    except Exception as e:
        return _fallback_response(str(e))


def _fallback_response(error: str) -> dict[str, Any]:
    """Returns a safe neutral response if Gemini call fails."""
    return {
        "funnel_stages": [
            {"id": i, "name": n, "status": "unknown", "evidence": None}
            for i, n in enumerate([
                "Application Acknowledged", "Screening Call", "Interview(s)",
                "Salary Negotiation", "Written Offer", "Background Check",
                "Signed Offer", "Payroll Onboarding"
            ])
        ],
        "ffcs_risk": 0,
        "financial_ask": {"detected": False, "type": "none", "channel": "none", "urgency_coupled": False, "quote": None},
        "financial_ask_risk": 0,
        "linguistic_markers": [],
        "linguistic_risk": 0,
        "extracted_company": None,
        "extracted_domain": None,
        "identity_match_risk": 0,
        "evidence": [{"text": "ML service error", "signal": "ffcs", "reason": f"Gemini call failed: {error}"}],
    }
