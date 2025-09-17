# ---------- whisper/app/main.py ----------
import tempfile, subprocess, json, os
from fastapi import FastAPI, HTTPException
from pydub import AudioSegment
import requests
import whisper

app = FastAPI(title="Local‑Whisper‑API")
model = whisper.load_model("base")   # tiny / base / small / medium / large

@app.post("/transcribe")
def transcribe(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url missing")

    # 1. download the media to a temp file
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
            r = requests.get(url, stream=True, timeout=60)
            r.raise_for_status()
            for chunk in r.iter_content(chunk_size=8192):
                tmp.write(chunk)
            tmp.flush()

            # 2. convert to wav (Whisper likes wav/mp3)
            wav_path = tmp.name.replace(".mp4", ".wav")
            AudioSegment.from_file(tmp.name).export(wav_path, format="wav")

            # 3. whisper
            result = model.transcribe(wav_path)
            return { "transcript": result["text"].strip() }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
