import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { makeCtx, createEngine } from "../lib/audio";

export default function WheelSpinner({ label = "Analysing radio" }) {
  const [muted, setMuted] = useState(false);
  const engineRef = useRef(null);

  useEffect(() => {
    if (muted) return undefined;
    let cancelled = false;

    // only mounts as a result of a click, so the autoplay gesture rule is satisfied
    const ctx = makeCtx();
    if (!ctx) return undefined;

    const go = () => {
      if (cancelled) return;
      engineRef.current = createEngine(ctx);
    };
    if (ctx.state === "suspended")
      ctx
        .resume()
        .then(go)
        .catch(() => {});
    else go();

    return () => {
      cancelled = true;
      engineRef.current?.stop();
      setTimeout(() => ctx.close().catch(() => {}), 400);
    };
  }, [muted]);

  return (
    <div className="wheel">
      <div className="wheel__stage">
        <svg className="wheel__svg" viewBox="0 0 120 120" aria-hidden="true">
          {/* tyre */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#141416"
            strokeWidth="14"
          />
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#242428"
            strokeWidth="14"
            strokeDasharray="6 10"
            opacity="0.9"
          />
          {/* sidewall marking */}
          <circle
            cx="60"
            cy="60"
            r="47"
            fill="none"
            stroke="var(--red)"
            strokeWidth="1.4"
            strokeDasharray="14 8"
            opacity="0.75"
          />
          {/* rim */}
          <circle
            cx="60"
            cy="60"
            r="41"
            fill="none"
            stroke="#3a3a3f"
            strokeWidth="3"
          />
          {/* spokes */}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i * 36 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * 15}
                y1={60 + Math.sin(a) * 15}
                x2={60 + Math.cos(a) * 39}
                y2={60 + Math.sin(a) * 39}
                stroke="#55555c"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            );
          })}
          {/* brake disc + centre nut */}
          <circle
            cx="60"
            cy="60"
            r="15"
            fill="#0d0d0f"
            stroke="#4a4a50"
            strokeWidth="2"
          />
          <circle cx="60" cy="60" r="5" fill="var(--red)" />
        </svg>

        {/* speed arcs, counter-spinning */}
        <svg className="wheel__blur" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="var(--red)"
            strokeWidth="2"
            strokeDasharray="30 250"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#fff"
            strokeWidth="1.2"
            strokeDasharray="14 300"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="wheel__meta">
        <span className="wheel__label">{label}</span>
        <span className="wheel__dots">
          <i />
          <i />
          <i />
        </span>
      </div>

      <button
        className="wheel__mute"
        onClick={() => setMuted((m) => !m)}
        title={muted ? "Engine audio off" : "Engine audio on"}
      >
        {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        {muted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );
}
