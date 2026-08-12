import numpy as np
import soundfile as sf
import requests

# Generate a 1-second sine wave
sr = 16000
t = np.linspace(0, 1, sr, endpoint=False)
audio = 0.5 * np.sin(2 * np.pi * 440 * t)
sf.write("dummy.wav", audio, sr)

from transformers import pipeline
emotion_classifier = pipeline(
    "audio-classification",
    model="superb/hubert-large-superb-er",
    device="cpu",
)
print(emotion_classifier("dummy.wav"))
