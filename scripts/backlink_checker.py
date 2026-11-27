#!/usr/bin/env python3
"""Verify live backlinks & citations listed in AUTHORITY_DISTRIBUTION.md.
Checks HTTP status and whether digitalerp.shop / myzini.digitalerp.shop is linked.
Outputs reports/backlinks_status.md.
"""
import os
import re
import urllib.request
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTH_MD = os.path.join(REPO_ROOT, "AUTHORITY_DISTRIBUTION.md")
OUT_MD = os.path.join(REPO_ROOT, "reports", "backlinks_status.md")


def extract_live_urls(md_text):
    urls = []
    for line in md_text.splitlines():
        if not line.startswith("|"):
            continue
        for match in re.findall(r"https?://[^\s|`)]+", line):
            if "digitalerp.shop" not in match:
                urls.append(match)
    return sorted(set(urls))


def check_url(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; MyZiniBacklinkChecker/1.0)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read(200000).decode("utf-8", errors="replace")
            has_link = "digitalerp.shop" in html.lower()
            return resp.status, "YES" if has_link else "NO"
    except Exception as exc:
        return f"ERR ({type(exc).__name__})", "UNKNOWN"


def main():
    with open(AUTH_MD, "r", encoding="utf-8") as f:
        md = f.read()

    urls = extract_live_urls(md)
    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)

    lines = [
        "# Authorised Backlinks & Citations Status Report",
        f"- **Checked At:** {datetime.now().isoformat()}",
        f"- **External URLs Checked:** {len(urls)}",
        "",
        "| External URL | HTTP Status | Links to `digitalerp.shop` |",
        "| :--- | :---: | :---: |",
    ]
    for url in urls:
        status, linked = check_url(url)
        lines.append(f"| {url} | {status} | {linked} |")

    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Checked {len(urls)} external backlink/citation URLs -> reports/backlinks_status.md")


if __name__ == "__main__":
    main()
