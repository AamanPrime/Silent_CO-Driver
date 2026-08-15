import { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Battery,
  Zap,
  Activity,
  Brain,
} from "lucide-react";

/* Mapped to FIA timing-screen colour language:
   purple = fastest/critical · green = clean · yellow = caution · red = danger · cyan = live */
const MOOD = {
  Calm: {
    color: "var(--sig-calm)",
    glow: "rgba(157,184,154,.32)",
    icon: ShieldCheck,
    label: "Calm",
    desc: "Driver composed. Vocal stress markers within baseline.",
  },
  Focused: {
    color: "var(--ash)",
    glow: "rgba(255,255,255,.18)",
    icon: Zap,
    label: "Focused",
    desc: "High adrenaline with pace held. Push phase — do not interrupt.",
  },
  Stressed: {
    color: "var(--red)",
    glow: "rgba(225,6,0,.5)",
    icon: ShieldAlert,
    label: "Stressed",
    desc: "Elevated stress in vocal signature. Monitor next three laps.",
  },
  "Critical Stress": {
    color: "var(--sig-crit)",
    glow: "rgba(255,59,33,.45)",
    icon: Activity,
    label: "Critical",
    desc: "Stress compounding with pace loss. Recommend calming radio call.",
  },
  Tired: {
    color: "var(--sig-tired)",
    glow: "rgba(194,149,63,.38)",
    icon: Battery,
    label: "Fatigued",
    desc: "Fatigue signature detected. Evaluate stint length and hydration.",
  },
};

export default function MoodIndicator({
  mood,
  rawEmotion,
  confidence,
  telemetryTrend,
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!mood) return;
    setArmed(false);
    const t = setTimeout(() => setArmed(true), 60);
    return () => clearTimeout(t);
  }, [mood]);

  const cfg = mood ? MOOD[mood] : null;

  if (!cfg) {
    return (
      <div className="hud state" style={{ "--accent": "var(--sig-crit)" }}>
        <div className="hud-head">
          <span className="hud-head__bar" />
          <span className="hud-head__txt">Driver State</span>
          <span className="hud-head__meta">CH 01 · SECURE</span>
        </div>
        <div className="state__body">
          <div className="state__idle">
            <div className="state__idle-ring">
              <Brain size={30} strokeWidth={1.2} />
            </div>
            <p className="state__idle-txt">Awaiting radio intercept</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = cfg.icon;
  const isCrit = mood === "Critical Stress";

  return (
    <div
      className="hud state"
      style={{
        "--accent": cfg.color,
        "--mood": cfg.color,
        "--mood-glow": cfg.glow,
      }}
    >
      <div className="hud-head">
        <span className="hud-head__bar" />
        <span className="hud-head__txt">Driver State</span>
        <span className="hud-head__meta">FUSED VERDICT</span>
      </div>

      <div className="state__body">
        <div
          className="state__core"
          style={{
            animation: armed
              ? "rise .5s cubic-bezier(.2,.8,.2,1) both"
              : "none",
          }}
        >
          <div className="state__orb">
            <Icon size={46} color={cfg.color} strokeWidth={1.4} />
          </div>

          <h2
            className={`state__verdict${isCrit ? " state__verdict--crit" : ""}`}
          >
            {cfg.label}
          </h2>

          <p className="state__desc">{cfg.desc}</p>

          <div className="rpm">
            <div className="rpm__top">
              <span>Confidence</span>
              <span>{confidence ?? 0}%</span>
            </div>
            <div className="rpm__track">
              <div
                className="rpm__fill"
                style={{ width: `${armed ? (confidence ?? 0) : 0}%` }}
              />
            </div>
          </div>

          <div className="chips">
            <div className="chip">
              <span className="chip__k">Voice</span>
              <span className="chip__v">{rawEmotion ?? "—"}</span>
            </div>
            {telemetryTrend && (
              <div className="chip">
                <span className="chip__k">Pace</span>
                <span
                  className={`chip__v${telemetryTrend === "Losing Pace" ? " chip__v--hot" : ""}`}
                >
                  {telemetryTrend}
                </span>
              </div>
            )}
            <div className="chip">
              <span className="chip__k">Source</span>
              <span className="chip__v">Audio × Telemetry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
