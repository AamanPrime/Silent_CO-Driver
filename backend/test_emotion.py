import numpy as np
import soundfile as sf
import requests

# Generate a 1-second sine wave
sr = 16000
t = np.linspace(0, 1, sr, endpoint=False)
audio = 0.5 * np.sin(2 * np.pi * 440 * t)
sf.write("dummy.wav", audio, sr)

# Send to endpoint
with open("dummy.wav", "rb") as f:
    response = requests.post("http://127.0.0.1:8000/analyze-radio", files={"file": f})
print(response.json())
