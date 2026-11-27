#!/usr/bin/env python3
"""Wait for inbound calls from owner (9241981083 / 6696340586678@lid) on OpenWA.
- Polls local OpenWA calls/history every 2s.
- Auto-accepts ringing inbound calls from the owner via /calls/{callId}/accept.
- Waits until the call ends (+3s for transcript/summary flush), prints details, and exits.
"""
import json
import os
import time
import urllib.request

OPENWA_URL = "http://127.0.0.1:2785"
SESSION_ID = "b3861df7-7b25-4f3d-95ba-895d059f8ea1"
API_KEY_PATH = "/home/ubuntu/OpenWA/data/.api-key"
STATE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "reports",
    "last_seen_owner_call.txt",
)
TASK_QUEUE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "reports",
    "live_voice_tasks.jsonl",
)
DONE_TASKS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "reports",
    "live_voice_tasks_done.txt",
)
DELEGATED_CALLS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "reports",
    "delegated_calls.jsonl",
)
DONE_DELEGATED_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "reports",
    "delegated_calls_done.txt",
)
OWNER_MARKERS = ("9241981083", "6696340586678")


def api_request(api_key, path, method="GET", body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"X-Api-Key": api_key}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(f"{OPENWA_URL}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.load(resp)


def fetch_history(api_key):
    data = api_request(api_key, f"/api/sessions/{SESSION_ID}/calls/history")
    return data if isinstance(data, list) else data.get("records", data.get("items", []))


def is_owner_inbound(rec):
    if rec.get("direction") != "inbound":
        return False
    phone = str(rec.get("phoneNumber") or "")
    jid = str(rec.get("peerJid") or "")
    return any(m in phone or m in jid for m in OWNER_MARKERS)


def main():
    with open(API_KEY_PATH, "r", encoding="utf-8") as f:
        api_key = f.read().strip()

    seen = set()
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            seen = {line.strip() for line in f if line.strip()}

    accepted_calls = set()

    done_tasks = set()
    if os.path.exists(DONE_TASKS_FILE):
        with open(DONE_TASKS_FILE, "r", encoding="utf-8") as f:
            done_tasks = {line.strip() for line in f if line.strip()}

    done_delegated = set()
    if os.path.exists(DONE_DELEGATED_FILE):
        with open(DONE_DELEGATED_FILE, "r", encoding="utf-8") as f:
            done_delegated = {line.strip() for line in f if line.strip()}

    while True:
        try:
            if os.path.exists(TASK_QUEUE_FILE):
                with open(TASK_QUEUE_FILE, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                        item = json.loads(line)
                        tid = item.get("id")
                        if tid and tid not in done_tasks:
                            os.makedirs(os.path.dirname(DONE_TASKS_FILE), exist_ok=True)
                            with open(DONE_TASKS_FILE, "a", encoding="utf-8") as df:
                                df.write(tid + "\n")
                            print(json.dumps({"event": "LIVE_VOICE_TASK", **item}, indent=2, ensure_ascii=False))
                            return
        except Exception:
            pass

        try:
            history = fetch_history(api_key)
            if os.path.exists(DELEGATED_CALLS_FILE):
                with open(DELEGATED_CALLS_FILE, "r", encoding="utf-8") as df:
                    for line in df:
                        line = line.strip()
                        if not line:
                            continue
                        ditem = json.loads(line)
                        did = ditem.get("id")
                        if not did or did in done_delegated:
                            continue
                        for r in history:
                            if (ditem.get("recordId") and r.get("id") == ditem.get("recordId")) or (
                                ditem.get("callId") and r.get("callId") == ditem.get("callId")
                            ):
                                if str(r.get("status") or "").lower() == "ended":
                                    time.sleep(3)
                                    for upd in fetch_history(api_key):
                                        if upd.get("id") == r.get("id"):
                                            r = upd
                                            break
                                    os.makedirs(os.path.dirname(DONE_DELEGATED_FILE), exist_ok=True)
                                    with open(DONE_DELEGATED_FILE, "a", encoding="utf-8") as ddf:
                                        ddf.write(did + "\n")
                                    print(json.dumps({
                                        "event": "DELEGATED_CALL_COMPLETED",
                                        "delegatedId": did,
                                        "targetPhone": ditem.get("targetPhone"),
                                        "postCallAction": ditem.get("postCallAction"),
                                        "durationSec": r.get("durationSec"),
                                        "callSummary": r.get("callSummary"),
                                        "transcript": r.get("transcript"),
                                    }, indent=2, ensure_ascii=False))
                                    return

            for r in history:
                rid = r.get("id")
                cid = r.get("callId")
                if not rid or rid in seen or not is_owner_inbound(r):
                    continue

                status = str(r.get("status") or "").lower()
                if status == "ended":
                    time.sleep(3)
                    # Re-fetch once to get flushed transcript/summary
                    for updated in fetch_history(api_key):
                        if updated.get("id") == rid:
                            r = updated
                            break
                    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
                    with open(STATE_FILE, "a", encoding="utf-8") as f:
                        f.write(rid + "\n")
                    print(json.dumps({
                        "event": "NEW_OWNER_INBOUND_CALL",
                        "id": rid,
                        "callId": cid,
                        "phoneNumber": r.get("phoneNumber"),
                        "mode": r.get("mode"),
                        "answeredAt": r.get("answeredAt"),
                        "durationSec": r.get("durationSec"),
                        "endReason": r.get("endReason"),
                        "callSummary": r.get("callSummary"),
                        "transcript": r.get("transcript"),
                    }, indent=2, ensure_ascii=False))
                    return
        except Exception:
            pass
        time.sleep(2)


if __name__ == "__main__":
    main()
