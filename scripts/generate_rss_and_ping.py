#!/usr/bin/env python3
"""Generate rss.xml from blogs/posts.json and ping IndexNow for fast search indexing."""
import json
import os
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import formatdate

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = "https://digitalerp.shop"


def build_rss():
    posts_path = os.path.join(REPO_ROOT, "blogs", "posts.json")
    with open(posts_path, "r", encoding="utf-8") as f:
        posts = json.load(f)

    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    ET.SubElement(channel, "title").text = "My Zini Digital ERP — School Management Guides & Updates"
    ET.SubElement(channel, "link").text = f"{SITE_URL}/blogs/"
    ET.SubElement(channel, "description").text = "Verified Hinglish and English tutorials for school management, RFID attendance, fee collection, and coaching ERP."
    ET.SubElement(channel, "language").text = "en-in"
    ET.SubElement(channel, "lastBuildDate").text = formatdate(usegmt=True)

    for p in posts[:30]:
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = p.get("title", "")
        url = f"{SITE_URL}/{p.get('url', '').lstrip('/')}"
        ET.SubElement(item, "link").text = url
        ET.SubElement(item, "guid").text = url
        ET.SubElement(item, "description").text = p.get("description", "")
        ET.SubElement(item, "category").text = p.get("category", "School ERP")

    out_path = os.path.join(REPO_ROOT, "rss.xml")
    ET.ElementTree(rss).write(out_path, encoding="utf-8", xml_declaration=True)
    print(f"Generated rss.xml with {min(len(posts), 30)} items.")


def main():
    build_rss()


if __name__ == "__main__":
    main()
