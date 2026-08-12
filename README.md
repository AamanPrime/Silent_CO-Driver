# The Silent Co-Driver 🏎️

**AI-Powered Driver Stress Analysis from Radio Comms**

Built for the **Grand Prix Hackathon 2026**, The Silent Co-Driver is an AI system that acts as an extra engineer on the pit wall. 

During a high-speed race, engineers are flooded with numbers (tire wear, sector times, aero loads). The driver’s voice over the radio is one of the most critical indicators of their mental state and fatigue, but engineers are too busy watching telemetry to actively listen to the subtle tone of the driver's voice.

**The Solution:** This system listens to live F1 driver radio communications, transcribes the speech, and analyzes the driver's emotional state (Stress, Fatigue, Calm). It then uses Sensor Fusion to combine this acoustic emotion with live lap time telemetry to generate contextual AI strategy alerts (e.g. *Critical Stress: Driver sounds stressed and lap times are dropping*).

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Recharts, Lucide-React
* **Backend:** FastAPI, Python, Librosa
* **AI Models:** 
  * `distil-whisper/distil-small.en` (Robust, fast Automatic Speech Recognition)
  * `superb/hubert-large-superb-er` (Speech Emotion Recognition)

---

## 🚀 Quick Start

### 1. Backend (FastAPI & AI Models)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*(Note: The first run will automatically download ~1.5GB of Hugging Face models).*

### 2. Frontend (React Dashboard)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser to view the Pit Wall dashboard.

---

## 🧠 How it Works

1. **RMS Acoustic Targeting:** For long radio clips, the backend calculates the RMS energy across the entire file and automatically isolates the loudest 10 seconds to ensure the Emotion AI captures the exact moment the driver is yelling or speaking loudest.
2. **Multimodal Fallback:** Since F1 engine noise can confuse acoustic emotion models, the system cross-references the Whisper transcript. If it spots high-stress vocabulary, it instantly overrides the acoustic model to guarantee accuracy.
3. **Contextual Fusion:** The system analyzes the trajectory of the last 6 laps. If the driver sounds Stressed *and* their pace is dropping, it upgrades the alert to **Critical Stress**.

---

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.
