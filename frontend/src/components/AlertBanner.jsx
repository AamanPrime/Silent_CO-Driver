import { AlertTriangle, Siren } from "lucide-react";

const ALERT = {
  Stressed: {
    color: "var(--red)",
    icon: AlertTriangle,
    head: "Stress Detected",
    sub: "Vocal stress markers elevated — consider easing radio traffic.",
  },
  "Critical Stress": {
    color: "var(--sig-crit)",
    icon: Siren,
    head: "Critical — Intervention Advised",
    sub: "Stress rising while lap times drop. Recommend calming call from race engineer.",
  },
};

export default function AlertBanner({ mood, onDismiss }) {
  const cfg = mood ? ALERT[mood] : null;
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <div className="klaxon" style={{ "--kl": cfg.color }} role="alert">
      <div className="klaxon__icon">
        <Icon size={22} strokeWidth={1.7} />
      </div>
      <div className="klaxon__txt">
        <span className="klaxon__hd">{cfg.head}</span>
        <span className="klaxon__sub">{cfg.sub}</span>
      </div>
      <button className="klaxon__x" onClick={onDismiss}>
        DISMISS
      </button>
    </div>
  );
}
