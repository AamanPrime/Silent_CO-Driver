import { useState, useEffect } from 'react';
import AudioUpload from './components/AudioUpload';
import MoodIndicator from './components/MoodIndicator';
import TranscriptPanel from './components/TranscriptPanel';
import LapChart from './components/LapChart';
import AlertBanner from './components/AlertBanner';
import './App.css';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lapData, setLapData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  // Fetch lap data on mount
  useEffect(() => {
    fetch(`${API_BASE}/lap-data`)
      .then((res) => res.json())
      .then(setLapData)
      .catch((err) => console.warn('Could not fetch lap data:', err));
  }, []);

  const handleResult = (data) => {
    setAnalysisResult(data);
    if (data.detected_mood === 'Critical Stress' || data.detected_mood === 'Stressed') {
      setShowAlert(true);
    }
  };

  const radioEventLap = lapData.find((d) => d.event && d.event.includes('Radio'))?.lap;

  return (
    <div className="app">
      <AlertBanner
        mood={showAlert ? (analysisResult?.detected_mood === 'Critical Stress' ? 'Critical Stress' : 'Stressed') : null}
        onDismiss={() => setShowAlert(false)}
      />

      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">
            <span className="header-logo__icon">🏎️</span>
            <div>
              <h1 className="header-title">THE SILENT CO-DRIVER</h1>
              <p className="header-subtitle">AI-Powered Driver Stress Analysis</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-status">
            <span className={`status-dot ${analysisResult ? 'status-dot--active' : ''}`} />
            <span className="status-text">
              {isAnalyzing ? 'Processing…' : analysisResult ? 'Analysis Complete' : 'Standby'}
            </span>
          </div>
          <div className="header-badge">PIT WALL v1.0</div>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-grid">
          <div className="grid-cell grid-cell--audio">
            <AudioUpload
              onResult={handleResult}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          </div>

          <div className="grid-cell grid-cell--mood">
            <MoodIndicator
              mood={analysisResult?.detected_mood}
              rawEmotion={analysisResult?.audio_mood || analysisResult?.raw_emotion}
              confidence={analysisResult?.confidence}
              telemetryTrend={analysisResult?.telemetry_trend}
            />
          </div>

          <div className="grid-cell grid-cell--transcript">
            <TranscriptPanel
              transcript={analysisResult?.transcript}
              isAnalyzing={isAnalyzing}
            />
          </div>

          <div className="grid-cell grid-cell--chart">
            <LapChart
              lapData={lapData}
              radioEventLap={radioEventLap}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <span>Powered by Hugging Face 🤗 — distil-whisper + wav2vec2</span>
        <span className="footer-dot">•</span>
        <span>Built for Grand Prix Hackathon 2026</span>
      </footer>
    </div>
  );
}
