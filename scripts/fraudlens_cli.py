#!/usr/bin/env python3
"""
FraudLens Open-Source CLI Tool
Allows developers, security teams, and AI agents to scan offer letters, URLs,
or uploaded documents (PDF, DOCX, TXT) directly from the command line.
"""
import sys
import json
import urllib.request
import urllib.error
import argparse
import os
import mimetypes
import uuid

DEFAULT_API_URL = os.environ.get("FRAUDLENS_API_URL", "http://localhost:3001")


def scan_payload(payload: dict, api_url: str):
    """Sends JSON scan payload (text or URL) to FraudLens API."""
    url = f"{api_url.rstrip('/')}/api/scan"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json', 'User-Agent': 'FraudLens-CLI/1.2'}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"API Error ({e.code}): {err_msg}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Network error connecting to {url}: {e}", file=sys.stderr)
        sys.exit(1)


def upload_document(file_path: str, api_url: str):
    """Uploads a PDF, DOCX, or TXT document using multipart/form-data."""
    url = f"{api_url.rstrip('/')}/api/scan/upload"
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    filename = os.path.basename(file_path)
    mime_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'

    with open(file_path, 'rb') as f:
        file_bytes = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {mime_type}\r\n\r\n"
    ).encode('utf-8') + file_bytes + f"\r\n--{boundary}--\r\n".encode('utf-8')

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
            'User-Agent': 'FraudLens-CLI/1.2'
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=35) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"Upload Error ({e.code}): {err_msg}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error uploading file to {url}: {e}", file=sys.stderr)
        sys.exit(1)


def format_terminal_output(res: dict):
    """Prints an explainable, colorized security audit report to terminal."""
    score = res.get("scamThreatIndex", 0)
    verdict = res.get("verdict", "unknown").upper()
    archetype = res.get("archetype", "Standard Verification")
    confidence = res.get("confidence", 95)
    signals = res.get("signals", {})
    domain_info = res.get("domainInfo", {})
    stages = res.get("funnelStages", [])

    # ANSI terminal colors
    RED = "\033[91m"
    YELLOW = "\033[93m"
    GREEN = "\033[92m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

    color = RED if verdict == "SCAM" else (YELLOW if verdict == "CAUTION" else GREEN)

    print(f"\n{BOLD}══════════════════════════════════════════════════════════════════{RESET}")
    print(f"  🛡️  {BOLD}FRAUDLENS THREAT INTELLIGENCE AUDIT DOSSIER{RESET}")
    print(f"{BOLD}══════════════════════════════════════════════════════════════════{RESET}\n")

    print(f"  {BOLD}Threat Verdict:{RESET}       {color}{BOLD}{verdict}{RESET} (Confidence: {confidence}%)")
    print(f"  {BOLD}Scam Threat Index:{RESET}    {color}{score} / 100{RESET}")
    print(f"  {BOLD}Threat Archetype:{RESET}     {CYAN}{archetype}{RESET}")

    if domain_info.get("domain"):
        print(f"  {BOLD}Target Domain:{RESET}        {domain_info.get('domain')} (Age: {domain_info.get('domainAgeDays', 'Unknown')} days, MX: {domain_info.get('mxProvider', 'N/A')})")

    print(f"\n  {BOLD}Multi-Modal Signal Risk Scores:{RESET}")
    print(f"    • FFCS Process Compression:   {signals.get('ffcs', 0)}/100")
    print(f"    • Financial Ask Fingerprint:  {signals.get('financialAsk', 0)}/100")
    print(f"    • Domain & Infra Trust:       {signals.get('domainTrust', 0)}/100")
    print(f"    • Identity & Lookalike Match: {signals.get('identityMatch', 0)}/100")
    print(f"    • Linguistic Manipulation:    {signals.get('linguistic', 0)}/100")

    skipped = [s["name"] for s in stages if s.get("status") == "skipped"]
    if skipped:
        print(f"\n  {BOLD}🚨 Skipped Process Stages ({len(skipped)}/8):{RESET}")
        for s in skipped:
            print(f"    {RED}✕ {s}{RESET}")

    evidence = res.get("evidence", [])
    if evidence:
        print(f"\n  {BOLD}Key Evidence Detected:{RESET}")
        for ev in evidence[:4]:
            print(f"    - {ev.get('reason')} ({CYAN}{ev.get('signal')}{RESET})")

    print(f"\n{BOLD}══════════════════════════════════════════════════════════════════{RESET}\n")


def main():
    parser = argparse.ArgumentParser(
        description="FraudLens CLI — Explainable Scam Offer & Phishing Inspector"
    )
    parser.add_argument("text", nargs="?", help="Raw text of offer letter or message to scan")
    parser.add_argument("--url", "-u", help="URL of job posting or web offer to scrape and scan")
    parser.add_argument("--file", "-f", help="Path to document file (PDF, DOCX, TXT) to upload and scan")
    parser.add_argument("--api", default=DEFAULT_API_URL, help="FraudLens API base URL")
    parser.add_argument("--json", action="store_true", help="Output raw JSON response")

    args = parser.parse_args()

    result = None

    if args.file:
        if not os.path.exists(args.file):
            print(f"Error: File not found '{args.file}'", file=sys.stderr)
            sys.exit(1)
        ext = os.path.splitext(args.file)[1].lower()
        if ext in [".pdf", ".docx"]:
            result = upload_document(args.file, args.api)
        else:
            with open(args.file, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            result = scan_payload({"text": content}, args.api)
    elif args.url:
        result = scan_payload({"url": args.url}, args.api)
    elif args.text:
        result = scan_payload({"text": args.text}, args.api)
    elif not sys.stdin.isatty():
        piped_input = sys.stdin.read()
        if piped_input.strip():
            result = scan_payload({"text": piped_input.strip()}, args.api)
        else:
            print("Error: Empty standard input received.", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        format_terminal_output(result)


if __name__ == "__main__":
    main()
