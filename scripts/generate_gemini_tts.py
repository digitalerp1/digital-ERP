#!/usr/bin/env python3
"""Generate multi-speaker Hinglish voiceover for the 3-minute My Zini Digital ERP
Stickman demo video using Google AI Studio's Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`)
and align all 6 acts into videos/myzini-demo/audio.wav (24 kHz mono 16-bit PCM).
"""
import base64
import io
import json
import os
import urllib.request
import wave

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = "/home/ubuntu/OpenWA/.env"
OUT_WAV = os.path.join(REPO_ROOT, "videos", "myzini-demo", "audio.wav")

SAMPLE_RATE = 24000
TOTAL_SECONDS = 180

ACTS = [
    {
        "start_sec": 0.5,
        "lines": [
            {
                "speaker": "Principal",
                "style": "stressed and tired",
                "text": "Arre yaar, subah se shaam ho gayi! Ye attendance registers, fee slips, aur pending dues check karte karte dimaag thak gaya hai.",
            },
            {
                "speaker": "Advisor",
                "style": "calm and helpful",
                "text": "Sir, aaj ke zamane mein bhi aap manual registers par school chala rahe hain? <short pause> Ek minute rukiye, mere paas iska smart solution hai.",
            },
        ],
    },
    {
        "start_sec": 25.5,
        "lines": [
            {
                "speaker": "Advisor",
                "style": "warm and enthusiastic",
                "text": "Yeh dekhiye My Zini Digital ERP! Ek all-in-one cloud school management software jismein pachas se zyada smart modules milte hain, sirf sau rupaye registration fee par.",
            },
            {
                "speaker": "Principal",
                "style": "curious and hopeful",
                "text": "Pachas se zyada modules? Kya ismein attendance, fees, aur exam results sab kuch ek hi jagah manage ho jayega?",
            },
        ],
    },
    {
        "start_sec": 55.5,
        "lines": [
            {
                "speaker": "Advisor",
                "style": "clear and confident",
                "text": "Bilkul Sir! Sabse pehle Smart Attendance aur RFID Card system dekhiye. Jaise hi bachha school gate par RFID card tap karta hai, attendance auto-mark hoti hai aur parents ke WhatsApp par turant alert chala jata hai.",
            },
            {
                "speaker": "Principal",
                "style": "impressed and happy",
                "text": "Waah! Matlab ab subah ki attendance aur chhutti ke alerts dono bilkul automatic ho jayenge!",
            },
        ],
    },
    {
        "start_sec": 90.5,
        "lines": [
            {
                "speaker": "Advisor",
                "style": "energetic and clear",
                "text": "Ab dekhiye Fee Collection aur Pending Dues Radar. Ek click mein QR fee receipt print hoti hai, sibling concession auto-calculate hota hai, aur pending fees ke liye automated WhatsApp reminder seedha parents ko jata hai.",
            },
            {
                "speaker": "Principal",
                "style": "relieved and cheerful",
                "text": "Zabardast! Isse toh hamari fee recovery aur school accounting dono super fast ho jayegi!",
            },
        ],
    },
    {
        "start_sec": 125.5,
        "lines": [
            {
                "speaker": "Advisor",
                "style": "enthusiastic and clear",
                "text": "Aur sirf itna hi nahi—Generator Tools Hub se aap satrah alag styles mein admit cards, student ID cards, transfer certificates, aur online exam marksheets kuch hi seconds mein bana sakte hain.",
            },
            {
                "speaker": "Principal",
                "style": "excited and happy",
                "text": "Kamal hai! Teachers, students aur parents sabke liye alag login portals bhi mil rahe hain!",
            },
        ],
    },
    {
        "start_sec": 155.5,
        "lines": [
            {
                "speaker": "Advisor",
                "style": "warm and inspiring",
                "text": "Toh aaj hi apne school ya coaching ko digital banayein! Abhi visit karein myzini.digitalerp.shop ya digitalerp.shop, aur free demo ke liye WhatsApp karein 9241981083 par!",
            },
        ],
    },
]


def load_gemini_key():
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"].strip()
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("GEMINI_API_KEY not found")


def synthesize_act(api_key, act):
    content = []
    for line in act["lines"]:
        content.append({
            "type": "text",
            "text": line["text"],
            "annotations": [{
                "type": "speech_metadata",
                "speaker": line["speaker"],
                "style": line["style"],
            }],
        })
    payload = {
        "model": "gemini-3.8-flash-tts",
        "input": [{"type": "user_input", "content": content}],
        "response_format": {"type": "audio"},
        "generation_config": {
            "speech_config": {
                "speakers": [
                    {"speaker": "Principal", "voice": "Puck"},
                    {"speaker": "Advisor", "voice": "Kore"},
                ]
            }
        },
    }
    req = urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = json.load(resp)

    audio_b64 = None
    if isinstance(res.get("output_audio"), dict):
        audio_b64 = res["output_audio"].get("data")
    if not audio_b64:
        for step in res.get("steps", []):
            for item in step.get("content", []):
                if item.get("type") == "audio" and item.get("data"):
                    audio_b64 = item["data"]
                    break
            if audio_b64:
                break
    if not audio_b64:
        for out in res.get("outputs", []):
            if out.get("type") == "audio" and out.get("data"):
                audio_b64 = out["data"]
                break
    if not audio_b64:
        raise RuntimeError(f"No audio returned: {json.dumps(res)[:300]}")

    wav_bytes = base64.b64decode(audio_b64)
    with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
        return wf.getframerate(), wf.getsampwidth(), wf.getnchannels(), wf.readframes(wf.getnframes())


def main():
    api_key = load_gemini_key()
    total_frames = TOTAL_SECONDS * SAMPLE_RATE
    # 16-bit mono PCM silence buffer
    buf = bytearray(total_frames * 2)

    for idx, act in enumerate(ACTS, start=1):
        sr, sw, ch, frames = synthesize_act(api_key, act)
        print(f"Act {idx}: {len(frames)//(sr*sw*ch):.2f}s @ {sr}Hz ch={ch}")
        offset_bytes = int(act["start_sec"] * sr) * 2
        max_len = len(buf) - offset_bytes
        copy_len = min(len(frames), max_len)
        if copy_len > 0:
            buf[offset_bytes : offset_bytes + copy_len] = frames[:copy_len]

    os.makedirs(os.path.dirname(OUT_WAV), exist_ok=True)
    with wave.open(OUT_WAV, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(SAMPLE_RATE)
        out.writeframes(bytes(buf))

    print(f"Generated {OUT_WAV} ({TOTAL_SECONDS}s, {os.path.getsize(OUT_WAV)//1024} KB)")


if __name__ == "__main__":
    main()
