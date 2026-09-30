"""
FraudLens Python SDK — HTTP Client
"""
import httpx
from pathlib import Path
from typing import Optional
from .models import ScanResult

DEFAULT_BASE_URL = "https://fraudlens-sqzh.onrender.com"
DEFAULT_TIMEOUT = 30.0


class FraudLensError(Exception):
    """Raised when the FraudLens API returns an error."""
    pass


class FraudLens:
    """
    FraudLens API Client.

    Args:
        base_url: The base URL of the FraudLens backend API.
                  Defaults to the public hosted instance.
        timeout:  Request timeout in seconds. Default is 30.

    Example:
        client = FraudLens()

        # Scan raw text
        result = client.scan_text("Congratulations! Pay Rs 4999 to get your laptop...")
        if result.is_scam:
            print(f"SCAM DETECTED — Threat Index: {result.scam_threat_index}/100")
            print(f"Skipped stages: {result.ffcs_stage_summary['skipped']}/8")

        # Scan a URL
        result = client.scan_url("https://careers-techglobal-india.net/apply")

        # Scan a document file
        result = client.scan_file("path/to/offer_letter.pdf")
    """

    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ):
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(base_url=self.base_url, timeout=timeout)

    def _parse(self, response: httpx.Response) -> ScanResult:
        if response.status_code != 200:
            try:
                detail = response.json().get("error", response.text)
            except Exception:
                detail = response.text
            raise FraudLensError(f"API error {response.status_code}: {detail}")
        return ScanResult.from_dict(response.json())

    def scan_text(self, text: str) -> ScanResult:
        """Scan a plain text string (email body, recruiter message, etc.)."""
        response = self._client.post("/api/scan", json={"text": text})
        return self._parse(response)

    def scan_url(self, url: str) -> ScanResult:
        """Scan a live URL — FraudLens will fetch and analyze the page content."""
        response = self._client.post("/api/scan", json={"url": url})
        return self._parse(response)

    def scan_file(self, file_path: str) -> ScanResult:
        """
        Scan a document file (PDF, DOCX, or TXT).
        The file is uploaded in-memory; nothing is stored on the server.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        mime_types = {
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt": "text/plain",
        }
        mime = mime_types.get(path.suffix.lower(), "application/octet-stream")

        with open(path, "rb") as f:
            response = self._client.post(
                "/api/scan",
                files={"file": (path.name, f, mime)},
            )
        return self._parse(response)

    def close(self):
        """Close the underlying HTTP session."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
