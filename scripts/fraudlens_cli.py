#!/usr/bin/env python3
"""
FraudLens Open-Source CLI Tool
Allows developers and AI agents to scan offer text or URLs from the command line.
"""
import sys
import json
import urllib.request
import argparse

DEFAULT_API_URL = "http://localhost:3001"

def scan_text(text: str, api_url: str):
    url = f"{api_url}/api/scan"
    payload = json.dumps({"text": text}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print(json.dumps(res_data, indent=2))
    except Exception as e:
        print(f"Error executing scan: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="FraudLens CLI — Scam & Phishing Scanner")
    parser.add_argument("text", nargs="?", help="Text of offer letter to scan")
    parser.add_argument("--file", "-f", help="Path to text file containing offer letter")
    parser.add_argument("--api", default=DEFAULT_API_URL, help="FraudLens backend API URL")

    args = parser.parse_args()

    content = ""
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
    elif args.text:
        content = args.text
    else:
        content = sys.stdin.read()

    if not content.strip():
        print("Error: No text provided. Pass text as an argument or via --file.", file=sys.stderr)
        sys.exit(1)

    scan_text(content, args.api)

if __name__ == "__main__":
    main()
