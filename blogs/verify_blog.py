#!/usr/bin/env python3
"""Verify blog post meets Hinglish deep-dive quality gates:
- >= 1000 words
- >= 15000 visible text characters
- 10 to 12 images, all existing on disk
- Valid blogs/posts.json and sitemap.xml
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser


class TextAndImageExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip_depth = 0
        self.in_article = False
        self.article_depth = 0
        self.text_parts = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag in ("script", "style", "noscript"):
            self.skip_depth += 1
        if tag == "article":
            self.in_article = True
            self.article_depth += 1
        elif self.in_article:
            if tag == "img" and "src" in attr_dict:
                self.images.append(attr_dict["src"])

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript") and self.skip_depth > 0:
            self.skip_depth -= 1
        if tag == "article" and self.in_article:
            self.article_depth -= 1
            if self.article_depth == 0:
                self.in_article = False

    def handle_data(self, data):
        if self.in_article and self.skip_depth == 0:
            self.text_parts.append(data)


def main():
    if len(sys.argv) < 2:
        print("Usage: verify_blog.py <path-to-blog-html>")
        sys.exit(1)

    blog_path = os.path.abspath(sys.argv[1])
    blog_dir = os.path.dirname(blog_path)
    repo_root = os.path.dirname(blog_dir)

    with open(blog_path, "r", encoding="utf-8") as f:
        html = f.read()

    parser = TextAndImageExtractor()
    parser.feed(html)

    raw_text = " ".join(parser.text_parts)
    clean_text = re.sub(r"\s+", " ", raw_text).strip()
    words = clean_text.split()
    word_count = len(words)
    char_count = len(clean_text)
    img_count = len(parser.images)

    print(f"File: {blog_path}")
    print(f"Words: {word_count} (min 1000)")
    print(f"Characters: {char_count} (min 15000)")
    print(f"Images in <article>: {img_count} (expected 10-12)")

    errors = []
    if word_count < 1000:
        errors.append(f"Word count {word_count} < 1000")
    if char_count < 15000:
        errors.append(f"Character count {char_count} < 15000")
    if not (10 <= img_count <= 12):
        errors.append(f"Image count {img_count} not between 10 and 12")

    for src in parser.images:
        img_abs = os.path.normpath(os.path.join(blog_dir, src))
        if not os.path.exists(img_abs):
            errors.append(f"Missing image file: {img_abs}")

    with open(os.path.join(repo_root, "blogs", "posts.json"), "r", encoding="utf-8") as f:
        json.load(f)

    ET.parse(os.path.join(repo_root, "sitemap.xml"))

    if errors:
        print("FAILED:", "; ".join(errors))
        sys.exit(1)
    print("ALL QUALITY GATES PASSED!")


if __name__ == "__main__":
    main()
