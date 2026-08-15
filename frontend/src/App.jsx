import { useState, useEffect } from "react";
import AudioUpload from "./components/AudioUpload";
import MoodIndicator from "./components/MoodIndicator";
import TranscriptPanel from "./components/TranscriptPanel";
import LapChart from "./components/LapChart";
import AlertBanner from "./components/AlertBanner";
import BootSequence from "./components/BootSequence";
import "./App.css";

const API_BASE = "http://localhost:8000";

const STATUS = {
  idle: { label: "Standby", color: "var(--slate)" },
  live: { label: "Analysing", color: "var(--sig-tired)" },
  complete: { label: "Telemetry Locked", color: "var(--sig-calm)" },
};

const RACE_CONTROL = [
  "AI RACE MONTH — GRAND PRIX HACKATHON 2026",
  "SENSOR FUSION ACTIVE — ACOUSTIC EMOTION × LAP DELTA",
  "ASR MODEL: DISTIL-WHISPER / SMALL.EN",
  "SER MODEL: HUBERT-LARGE-SUPERB-ER",
  "RMS ACOUSTIC TARGETING ENABLED — LOUDEST 10S WINDOW",
  "MULTIMODAL FALLBACK ARMED — TRANSCRIPT OVERRIDE READY",
  "PIT WALL TELEMETRY LINK — NOMINAL",
];

/* F1 start-light rig: out on idle, sequences while analysing, green on lock */
function StartLights({ phase }) {
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (phase !== "live") {
      setLit(0);
      return;
    }
    const t = setInterval(() => setLit((n) => (n >= 5 ? 0 : n + 1)), 320);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="lights" title="Race start lights">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={
            "lights__bulb" +
            (phase === "complete"
              ? " lights__bulb--go"
              : phase === "live" && i < lit
                ? " lights__bulb--on"
                : "")
          }
        />
      ))}
    </div>
  );
}

function SessionClock() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return (
    <div className="hdr__clock">
      <span>Session</span>
      {mm}:{ss}
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lapData, setLapData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/lap-data`)
      .then((res) => res.json())
      .then(setLapData)
      .catch((err) => console.warn("Could not fetch lap data:", err));
  }, []);

  const handleResult = (data) => {
    setAnalysisResult(data);
    if (
      data.detected_mood === "Critical Stress" ||
      data.detected_mood === "Stressed"
    ) {
      setShowAlert(true);
    }
  };

  const phase = isAnalyzing ? "live" : analysisResult ? "complete" : "idle";
  const status = STATUS[phase];
  const radioEventLap = lapData.find(
    (d) => d.event && d.event.includes("Radio"),
  )?.lap;

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />;

  return (
    <div className="pitwall">
      <div className="backdrop" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <AlertBanner
        mood={
          showAlert
            ? analysisResult?.detected_mood === "Critical Stress"
              ? "Critical Stress"
              : "Stressed"
            : null
        }
        onDismiss={() => setShowAlert(false)}
      />

      <header className="hdr">
        <div className="hdr__mark">
          <StartLights phase={phase} />
          <div>
            <h1 className="hdr__title">The Silent Co-Driver</h1>
            <p className="hdr__sub">AI Driver Stress Analysis · Pit Wall</p>
          </div>
        </div>

        <div className="hdr__right">
          <SessionClock />
          <div className="hdr__state" style={{ "--st": status.color }}>
            <span className="hdr__state-dot" />
            <span className="hdr__state-txt">{status.label}</span>
          </div>
          <div className="hdr__badge">AI Race Month</div>
        </div>
      </header>

      <main className="deck">
        <div className="cell--radio">
          <AudioUpload
            onResult={handleResult}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        </div>

        <div className="cell--state">
          <MoodIndicator
            mood={analysisResult?.detected_mood}
            rawEmotion={
              analysisResult?.audio_mood || analysisResult?.raw_emotion
            }
            confidence={analysisResult?.confidence}
            telemetryTrend={analysisResult?.telemetry_trend}
          />
        </div>

        <div className="cell--transcript">
          <TranscriptPanel
            transcript={analysisResult?.transcript}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="cell--chart">
          <LapChart lapData={lapData} radioEventLap={radioEventLap} />
        </div>
      </main>

      <div className="ticker">
        <div className="ticker__tag">Race Control</div>
        <div className="ticker__rail">
          <div className="ticker__run">
            {[...RACE_CONTROL, ...RACE_CONTROL].map((msg, i) => (
              <span className="ticker__item" key={i}>
                <i />
                {msg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
