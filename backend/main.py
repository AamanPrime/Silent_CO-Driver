import os
import json
import io

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import librosa

app = FastAPI(title="The Silent Co-Driver", version="1.0.0")

# CORS — allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load Hugging Face models once at startup
# ---------------------------------------------------------------------------
print("⏳ Loading AI models (this may take a minute on first run)...")

transcriber = pipeline(
    "automatic-speech-recognition",
    model="distil-whisper/distil-small.en",
    device="cpu",
    chunk_length_s=30,
)

emotion_classifier = pipeline(
    "audio-classification",
    model="superb/hubert-large-superb-er",
    device="cpu",
)

print("✅ Models loaded and ready!")

# ---------------------------------------------------------------------------
# Load mock lap data
# ---------------------------------------------------------------------------
LAP_DATA_PATH = os.path.join(os.path.dirname(__file__), "lap_data.json")
with open(LAP_DATA_PATH, "r") as f:
    LAP_DATA = json.load(f)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
import re

def text_based_emotion_override(transcript: str, raw_label: str) -> str:
    """Fallback multimodal fusion: if acoustic model misses stress due to engine noise, check transcript."""
    # Strip punctuation so "no, no, no" becomes "no no no"
    t_clean = re.sub(r'[^\w\s]', '', transcript.lower())
    
    stress_keywords = [
        "pressure", "idiot", "stupid", "joke", "ridiculous",
        "fuck", "shit", "damn", "hell",
        "stop", "come on", "what the", "are you serious",
        "no no", "crash", "hit me", "forced me", "dangerous",
        "penalty", "unfair", "pushing me",
    ]
    tired_keywords = [
        "tired", "no grip", "sliding", "cant", "cannot",
        "no energy", "struggling", "heavy", "exhausted",
    ]
    
    if any(kw in t_clean for kw in stress_keywords):
        return "ang"
    if any(kw in t_clean for kw in tired_keywords) and raw_label not in ("ang",):
        return "sad"
        
    return raw_label

def map_emotion(raw_label: str) -> str:
    """Map raw SER labels to hackathon categories: Calm / Stressed / Tired."""
    label = raw_label.lower()
    if label == "ang":
        return "Stressed"
    elif label == "sad":
        return "Tired"
    else:  # neu, hap
        return "Calm"

def analyze_telemetry_trend(lap_data: list) -> str:
    """Analyze recent laps to determine if pace is dropping."""
    if len(lap_data) < 4:
        return "Maintaining Pace"
    
    # Get last 4 laps before the pit stop or end (in our mock data, radio is lap 42-43)
    # Actually, we can just look at the radio event lap. 
    # Let's find the lap with the radio event:
    radio_lap_idx = next((i for i, lap in enumerate(lap_data) if 'Radio' in lap.get('event', '')), -1)
    
    if radio_lap_idx != -1 and radio_lap_idx + 2 < len(lap_data):
        # We have laps after the radio event. Let's compare them.
        before_radio_avg = sum(l['time'] for l in lap_data[radio_lap_idx-3:radio_lap_idx]) / 3
        after_radio_avg = sum(l['time'] for l in lap_data[radio_lap_idx:radio_lap_idx+3]) / 3
        
        if after_radio_avg > before_radio_avg + 0.5:
            return "Losing Pace"
        elif after_radio_avg < before_radio_avg - 0.5:
            return "Gaining Pace"
            
    return "Maintaining Pace"

def fuse_audio_and_telemetry(audio_mood: str, telemetry_trend: str) -> str:
    """Combine audio mood and telemetry trend into a final contextual state."""
    if audio_mood == "Calm" and telemetry_trend == "Losing Pace":
        return "Tired" # Sound calm, but dropping pace = fatigue
    elif audio_mood == "Stressed" and telemetry_trend == "Losing Pace":
        return "Critical Stress" # Stressed and losing time = bad situation
    elif audio_mood == "Stressed" and telemetry_trend in ("Maintaining Pace", "Gaining Pace"):
        return "Focused" # Yelling, but lap times are fast = adrenaline/focus
    return audio_mood


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "message": "The Silent Co-Driver API is running."}


@app.post("/analyze-radio")
async def analyze_radio(file: UploadFile = File(...)):
    """
    Accept an audio file, run ASR + SER, and return the transcript,
    raw emotion label, mapped mood, and confidence score.
    """
    audio_bytes = await file.read()

    # Resample to 16 kHz (required by both HF models)
    audio_array, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)

    # 1. Speech-to-Text (full audio, handled by chunk_length_s)
    transcript_result = transcriber(
        {"sampling_rate": sr, "raw": audio_array},
        return_timestamps=True,
    )
    transcript_text = transcript_result["text"].strip()

    # 2. Speech Emotion Recognition (Extract loudest 10s window to catch shouting)
    window_length = 10 * sr
    if len(audio_array) > window_length:
        # Calculate RMS energy in 1-second frames
        rms = librosa.feature.rms(y=audio_array, frame_length=sr, hop_length=sr//2)[0]
        max_idx = rms.argmax()
        start_sample = max_idx * (sr // 2)
        end_sample = min(len(audio_array), start_sample + window_length)
        ser_audio = audio_array[start_sample:end_sample]
    else:
        ser_audio = audio_array

    emotion_results = emotion_classifier(
        {"sampling_rate": sr, "raw": ser_audio}
    )
    top = emotion_results[0]
    raw_emotion = top["label"]
    confidence = round(top["score"] * 100, 1)

    # Multimodal Text + Audio Fusion
    fused_raw_emotion = text_based_emotion_override(transcript_text, raw_emotion)
    if fused_raw_emotion != raw_emotion:
        raw_emotion = fused_raw_emotion
        confidence = 85.5 # Boost confidence since text explicitly contains stress keywords

    audio_mood = map_emotion(raw_emotion)

    # 3. Contextual Fusion (Multimodal)
    telemetry_trend = analyze_telemetry_trend(LAP_DATA)
    final_mood = fuse_audio_and_telemetry(audio_mood, telemetry_trend)

    return {
        "transcript": transcript_text,
        "raw_emotion": raw_emotion,
        "detected_mood": final_mood,
        "audio_mood": audio_mood,
        "telemetry_trend": telemetry_trend,
        "confidence": confidence,
    }


@app.get("/lap-data")
async def get_lap_data():
    """Return mock lap timing data."""
    return LAP_DATA
