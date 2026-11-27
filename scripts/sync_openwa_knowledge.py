#!/usr/bin/env python3
"""Sync live SEO audit, backlinks, blogs, and growth status into OpenWA knowledge base."""
import json
import os
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OPENWA_KNOWLEDGE = "/home/ubuntu/OpenWA/data/knowledge/seo_growth_status.md"


def main():
    audit_path = os.path.join(REPO_ROOT, "reports", "daily_seo_audit.json")
    posts_path = os.path.join(REPO_ROOT, "blogs", "posts.json")

    audit = {}
    if os.path.exists(audit_path):
        with open(audit_path, "r", encoding="utf-8") as f:
            audit = json.load(f)

    posts = []
    if os.path.exists(posts_path):
        with open(posts_path, "r", encoding="utf-8") as f:
            posts = json.load(f)

    latest_titles = [p.get("title", "") for p in posts[:5]]

    content = [
        "# My Zini Digital ERP — Live SEO, Backlinks & Growth Status (digitalerp.shop)",
        f"- **Last Synced (IST):** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"- **Pages Audited:** {audit.get('total_pages_audited', 'N/A')} | **Critical Issues:** {audit.get('critical_issues', 'N/A')} | **Sitemap URLs:** {audit.get('sitemap_urls', 'N/A')}",
        f"- **Published Blogs:** {len(posts)} guides at https://digitalerp.shop/blogs/",
        "- **Latest 5 Published Blogs:**",
    ]
    for t in latest_titles:
        content.append(f"  - {t}")
    content.extend([
        "- **Free Interactive Tools (/tools/):** CBSE CGPA & Marks Calculator, Attendance % Calculator, Free School Fee Receipt Generator",
        "- **Authorised Backlinks (14 targets in AUTHORITY_DISTRIBUTION.md):** GitHub (active), GBP (active), GSC (active), Bing, G2, Capterra, SoftwareSuggest, Techjockey, AlternativeTo, Product Hunt, Dev.to, Hashnode, Medium, LinkedIn",
        "- **Daily 10-Strategy Schedule (IST):** 06:00 AM (Backlinks & GBP), 08:00 AM (Tools & Programmatic SEO), 10:00 AM (GSC & Technical SEO), 02:00 PM (Syndication & AI-SEO), 06:00 PM (CRO & WhatsApp Digest), plus Hourly (:18) Hinglish Blog Publisher.",
    ])

    os.makedirs(os.path.dirname(OPENWA_KNOWLEDGE), exist_ok=True)
    with open(OPENWA_KNOWLEDGE, "w", encoding="utf-8") as f:
        f.write("\n".join(content) + "\n")
    print(f"Synced live SEO status to {OPENWA_KNOWLEDGE}")


if __name__ == "__main__":
    main()
