import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Battery, Zap, Activity } from 'lucide-react';

const MOOD_CONFIG = {
  Calm: {
    color: 'var(--accent-green)',
    bg: 'var(--accent-green-dim)',
    animation: 'pulse-green',
    icon: ShieldCheck,
    label: 'CALM',
    description: 'Driver is composed and focused',
  },
  Focused: {
    color: 'var(--accent-blue)',
    bg: 'var(--accent-blue-dim)',
    animation: 'pulse-blue',
    icon: Zap,
    label: 'FOCUSED',
    description: 'High adrenaline, maintaining pace',
  },
  Stressed: {
    color: 'var(--accent-red)',
    bg: 'var(--accent-red-dim)',
    animation: 'pulse-red',
    icon: ShieldAlert,
    label: 'STRESSED',
    description: 'Elevated stress detected in voice',
  },
  'Critical Stress': {
    color: '#ff0000',
    bg: 'rgba(255,0,0,0.2)',
    animation: 'pulse-critical',
    icon: Activity,
    label: 'CRITICAL',
    description: 'Stress combined with losing pace',
  },
  Tired: {
    color: 'var(--accent-amber)',
    bg: 'var(--accent-amber-dim)',
    animation: 'pulse-amber',
    icon: Battery,
    label: 'TIRED',
    description: 'Signs of fatigue in voice pattern',
  },
};

export default function MoodIndicator({ mood, rawEmotion, confidence, telemetryTrend }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (mood) {
      setShow(false);
      const t = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(t);
    }
  }, [mood]);

  const config = mood ? MOOD_CONFIG[mood] : null;

  if (!mood || !config) {
    return (
      <div className="mood-indicator glass-panel">
        <div className="section-label">🧠 Driver State</div>
        <div className="mood-empty">
          <div className="mood-empty__ring" />
          <p className="mood-empty__text">Awaiting radio analysis…</p>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="mood-indicator glass-panel" style={{ '--mood-color': config.color, '--mood-bg': config.bg }}>
      <div className="section-label">🧠 Driver State</div>

      <div className={`mood-display ${show ? 'fade-in' : ''}`}>
        <div
          className="mood-ring"
          style={{ animation: `${config.animation} 2s ease-in-out infinite` }}
        >
          <Icon size={36} color={config.color} strokeWidth={1.5} />
        </div>

        <div className="mood-info">
          <span className="mood-label" style={{ color: config.color }}>
            {config.label}
          </span>
          <span className="mood-confidence">{confidence}% confidence</span>
          <span className="mood-raw">Voice: {rawEmotion}</span>
          {telemetryTrend && (
            <span className="mood-trend">Context: {telemetryTrend}</span>
          )}
          <span className="mood-desc">{config.description}</span>
        </div>
      </div>
    </div>
  );
}
