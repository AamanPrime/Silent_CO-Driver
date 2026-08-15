import { useState, useRef, useCallback } from "react";
import { Radio, Mic, Play } from "lucide-react";
import WheelSpinner from "./WheelSpinner";

/* Demo pack — synthesised team-radio calls, shipped in public/samples.
   Lets a live demo run without hunting for an audio file. */
const SAMPLES = [
  { id: "radio-01-stress", label: "Angry" },
  { id: "radio-02-calm", label: "Calm" },
  { id: "radio-03-fatigue", label: "Fatigued" },
  { id: "radio-04-focus", label: "Upbeat" },
];

const ACCEPTED_TYPES = [
  "audio/wav",
  "audio/mpeg",
  "audio/ogg",
  "audio/flac",
  "audio/x-wav",
  "audio/mp3",
  "audio/webm",
];

export default function AudioUpload({ onResult, isAnalyzing, setIsAnalyzing }) {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((f) => {
    setError(null);
    if (!f) return;
    if (
      !ACCEPTED_TYPES.includes(f.type) &&
      !f.name.match(/\.(wav|mp3|ogg|flac|webm)$/i)
    ) {
      setError("UNSUPPORTED FORMAT — USE WAV / MP3 / OGG / FLAC / WEBM");
      return;
    }
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
  }, []);

  const loadSample = useCallback(async (id) => {
    setError(null);
    try {
      const res = await fetch(`/samples/${id}.wav`);
      if (!res.ok) throw new Error("SAMPLE NOT FOUND");
      const f = new File([await res.blob()], `${id}.wav`, { type: "audio/wav" });
      setFile(f);
      setAudioUrl(URL.createObjectURL(f));
    } catch {
      setError("COULD NOT LOAD SAMPLE");
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleAnalyze = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/analyze-radio", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`SERVER ERROR ${res.status}`);
      onResult(await res.json());
    } catch (err) {
      setError(err.message || "FAILED TO ANALYSE AUDIO");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAudioUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="hud radio" style={{ "--accent": "var(--ash)" }}>
      <div className="hud-head">
        <span className="hud-head__bar" />
        <span className="hud-head__txt">Radio Comms</span>
        <span className="hud-head__meta">INTAKE</span>
      </div>

      <div className="radio__body">
        {!file ? (
          <div
            className={`drop${isDragOver ? " drop--hot" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop__ring">
              <Radio size={22} strokeWidth={1.5} />
            </div>
            <p className="drop__txt">
              Drop team radio or <b>browse</b>
            </p>
            <p className="drop__hint">WAV · MP3 · OGG · FLAC — 30s max</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.ogg,.flac,.webm,audio/*"
              onChange={(e) => handleFile(e.target.files[0])}
              hidden
            />
          </div>
        ) : (
          <div className="clip">
            <div className="clip__bar">
              <Mic size={14} color="var(--ash)" />
              <span className="clip__name">{file.name}</span>
              <button className="clip__x" onClick={clearFile} title="Eject">
                ×
              </button>
            </div>

            <audio src={audioUrl} controls className="clip__audio" />

            {isAnalyzing ? (
              <WheelSpinner label="Analysing radio" />
            ) : (
              <button className="go" onClick={handleAnalyze}>
                <Play size={16} /> Run Analysis
              </button>
            )}
          </div>
        )}

        {!file && (
          <div className="samples">
            <span className="samples__k">Demo radio</span>
            {SAMPLES.map((sp) => (
              <button
                key={sp.id}
                className="samples__btn"
                onClick={() => loadSample(sp.id)}
              >
                {sp.label}
              </button>
            ))}
          </div>
        )}

        {error && <div className="err">{error}</div>}
      </div>
    </div>
  );
}
