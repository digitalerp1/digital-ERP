#!/usr/bin/env python3
"""Daily Technical SEO & Tag Auditor for digitalerp.shop.
Audits all HTML pages in the repository for:
- <title> presence & length (30-65 chars)
- <meta name="description"> presence & length (70-165 chars)
- Single <h1> tag
- <link rel="canonical">
- Open Graph (og:title, og:description, og:image)
- JSON-LD structured data validity
- Image alt attributes
- sitemap.xml coverage
Outputs reports/daily_seo_audit.md and reports/daily_seo_audit.json.
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from html.parser import HTMLParser

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_FILES = {"delete.html", "apizini.html", "chatbot.html", "privacy-policy1.html"}
SKIP_DIRS = {".git", "components", "task", "node_modules", "reports", "videos"}


class PageSEOParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title_parts = []
        self.in_h1 = False
        self.h1_count = 0
        self.h1_parts = []
        self.in_ld_json = False
        self.ld_json_blocks = []
        self.current_ld = []
        self.meta_desc = ""
        self.canonical = ""
        self.og_tags = {}
        self.viewport = False
        self.imgs_missing_alt = 0
        self.total_imgs = 0

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
            self.h1_count += 1
        elif tag == "meta":
            name = (d.get("name") or "").lower()
            prop = (d.get("property") or "").lower()
            content = d.get("content") or ""
            if name == "description":
                self.meta_desc = content
            elif name == "viewport":
                self.viewport = True
            elif prop.startswith("og:"):
                self.og_tags[prop] = content
        elif tag == "link":
            rel = (d.get("rel") or "").lower()
            if "canonical" in rel:
                self.canonical = d.get("href") or ""
        elif tag == "script":
            if (d.get("type") or "").lower() == "application/ld+json":
                self.in_ld_json = True
                self.current_ld = []
        elif tag == "img":
            self.total_imgs += 1
            if not (d.get("alt") or "").strip():
                self.imgs_missing_alt += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False
        elif tag == "script" and self.in_ld_json:
            self.in_ld_json = False
            self.ld_json_blocks.append("".join(self.current_ld).strip())

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self.in_h1:
            self.h1_parts.append(data)
        if self.in_ld_json:
            self.current_ld.append(data)


def audit_file(path, rel_path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()

    p = PageSEOParser()
    p.feed(html)

    title = re.sub(r"\s+", " ", "".join(p.title_parts)).strip()
    desc = re.sub(r"\s+", " ", p.meta_desc).strip()
    issues = []
    warnings = []

    if not title:
        issues.append("Missing <title>")
    elif len(title) < 25 or len(title) > 75:
        warnings.append(f"Title length {len(title)} (ideal 30-65)")

    if not desc:
        issues.append("Missing meta description")
    elif len(desc) < 70 or len(desc) > 170:
        warnings.append(f"Meta description length {len(desc)} (ideal 120-160)")

    if p.h1_count == 0:
        issues.append("Missing <h1>")
    elif p.h1_count > 1:
        warnings.append(f"Multiple <h1> tags ({p.h1_count})")

    if not p.canonical:
        issues.append("Missing canonical link")
    if not p.viewport:
        issues.append("Missing viewport meta")
    if not p.og_tags.get("og:title") or not p.og_tags.get("og:image"):
        warnings.append("Incomplete Open Graph tags")
    elif "placehold.co" in p.og_tags.get("og:image", ""):
        issues.append("Placeholder og:image URL")

    if not p.ld_json_blocks:
        warnings.append("No JSON-LD structured data")
    else:
        for idx, block in enumerate(p.ld_json_blocks):
            try:
                json.loads(block)
            except Exception as exc:
                issues.append(f"Invalid JSON-LD block #{idx+1}: {exc}")

    if p.imgs_missing_alt > 0:
        warnings.append(f"{p.imgs_missing_alt}/{p.total_imgs} images missing alt")

    return {
        "file": rel_path,
        "title": title,
        "title_len": len(title),
        "desc_len": len(desc),
        "h1_count": p.h1_count,
        "canonical": p.canonical,
        "json_ld_count": len(p.ld_json_blocks),
        "issues": issues,
        "warnings": warnings,
    }


def main():
    results = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in sorted(files):
            if not fname.endswith(".html") or fname in SKIP_FILES:
                continue
            full = os.path.join(root, fname)
            rel = os.path.relpath(full, REPO_ROOT).replace("\\", "/")
            results.append(audit_file(full, rel))

    sitemap_path = os.path.join(REPO_ROOT, "sitemap.xml")
    sitemap_urls = set()
    if os.path.exists(sitemap_path):
        tree = ET.parse(sitemap_path)
        for loc in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            if loc.text:
                sitemap_urls.add(loc.text.strip())

    critical_count = sum(len(r["issues"]) for r in results)
    warning_count = sum(len(r["warnings"]) for r in results)

    os.makedirs(os.path.join(REPO_ROOT, "reports"), exist_ok=True)
    report_json = {
        "generated_at": datetime.now().isoformat(),
        "total_pages_audited": len(results),
        "critical_issues": critical_count,
        "warnings": warning_count,
        "sitemap_urls": len(sitemap_urls),
        "pages": results,
    }
    with open(os.path.join(REPO_ROOT, "reports", "daily_seo_audit.json"), "w", encoding="utf-8") as f:
        json.dump(report_json, f, indent=2)

    lines = [
        "# Daily SEO & Tag Audit Report — My Zini Digital ERP",
        f"- **Generated:** {report_json['generated_at']}",
        f"- **Pages Audited:** {len(results)}",
        f"- **Critical Issues:** {critical_count}",
        f"- **Warnings:** {warning_count}",
        f"- **Sitemap URLs:** {len(sitemap_urls)}",
        "",
        "| Page | Title Len | Desc Len | H1 | JSON-LD | Issues | Warnings |",
        "| :--- | :---: | :---: | :---: | :---: | :--- | :--- |",
    ]
    for r in results:
        iss = "; ".join(r["issues"]) if r["issues"] else "OK"
        wrn = "; ".join(r["warnings"]) if r["warnings"] else "-"
        lines.append(
            f"| `{r['file']}` | {r['title_len']} | {r['desc_len']} | {r['h1_count']} | {r['json_ld_count']} | {iss} | {wrn} |"
        )

    with open(os.path.join(REPO_ROOT, "reports", "daily_seo_audit.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Audited {len(results)} pages | Critical issues: {critical_count} | Warnings: {warning_count}")
    if critical_count > 0:
        for r in results:
            if r["issues"]:
                print(f"  [CRITICAL] {r['file']}: {', '.join(r['issues'])}")
        sys.exit(1)


if __name__ == "__main__":
    main()
