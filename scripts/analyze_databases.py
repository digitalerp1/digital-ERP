#!/usr/bin/env python3
"""Read-only analyzer for all OpenWA SQLite databases (main.sqlite, openwa.sqlite, schedule.db)
and digital-ERP JSON/report stores. Outputs reports/database_analysis.md and .json.
"""
import json
import os
import sqlite3
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OPENWA_DATA = "/home/ubuntu/OpenWA/data"
OUT_JSON = os.path.join(REPO_ROOT, "reports", "database_analysis.json")
OUT_MD = os.path.join(REPO_ROOT, "reports", "database_analysis.md")
SKIP_TABLE_PATTERNS = ("auth", "session", "key", "token", "secret", "credential")


def inspect_sqlite(db_path):
    info = {"path": db_path, "sizeBytes": os.path.getsize(db_path), "tables": {}}
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    try:
        cur = conn.cursor()
        tables = [
            r[0]
            for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
        ]
        for t in tables:
            if any(p in t.lower() for p in SKIP_TABLE_PATTERNS):
                info["tables"][t] = {"redacted": True}
                continue
            try:
                cnt = cur.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
                info["tables"][t] = {"rows": cnt}
            except Exception as exc:
                info["tables"][t] = {"error": str(exc)}
    finally:
        conn.close()
    return info


def main():
    dbs = {}
    if os.path.isdir(OPENWA_DATA):
        for fname in sorted(os.listdir(OPENWA_DATA)):
            if fname.endswith((".sqlite", ".db")):
                full = os.path.join(OPENWA_DATA, fname)
                if os.path.getsize(full) > 0:
                    dbs[fname] = inspect_sqlite(full)

    report = {
        "generated_at": datetime.now().isoformat(),
        "databases": dbs,
    }
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    lines = [
        "# Database Analysis Report — OpenWA & Digital ERP",
        f"- **Generated:** {report['generated_at']}",
        "",
    ]
    for name, info in dbs.items():
        mb = round(info["sizeBytes"] / (1024 * 1024), 2)
        lines.append(f"## `{name}` ({mb} MB)")
        lines.append("| Table | Rows |")
        lines.append("| :--- | :---: |")
        for t, meta in info["tables"].items():
            val = "*(redacted)*" if meta.get("redacted") else str(meta.get("rows", meta.get("error")))
            lines.append(f"| `{t}` | {val} |")
        lines.append("")

    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Analyzed {len(dbs)} SQLite databases -> reports/database_analysis.md")


if __name__ == "__main__":
    main()
