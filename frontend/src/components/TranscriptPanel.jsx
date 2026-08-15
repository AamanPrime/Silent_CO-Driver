import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export default function TranscriptPanel({ transcript, isAnalyzing }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!transcript) {
      setTyped("");
      return;
    }
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      if (i < transcript.length) {
        setTyped(transcript.slice(0, i + 1));
        i++;
      } else {
        clearInterval(id);
      }
    }, 22);
    return () => clearInterval(id);
  }, [transcript]);

  return (
    <div className="hud tx" style={{ "--accent": "var(--sig-calm)" }}>
      <div className="hud-head">
        <span className="hud-head__bar" />
        <span className="hud-head__txt">Radio Transcript</span>
        <span className="hud-head__meta">ASR · WHISPER</span>
      </div>

      <div className="tx__body">
        {isAnalyzing ? (
          <div className="tx__load">
            <div className="tx__load-row shimmer" />
            <div className="tx__load-row shimmer" style={{ width: "78%" }} />
            <div className="tx__load-row shimmer" style={{ width: "52%" }} />
          </div>
        ) : transcript ? (
          <p className="tx__quote">
            {typed}
            <span className="tx__caret">█</span>
          </p>
        ) : (
          <div className="tx__idle">
            <Radio size={22} strokeWidth={1.3} />
            <p>Channel silent</p>
          </div>
        )}
      </div>
    </div>
  );
}
