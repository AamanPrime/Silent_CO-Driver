import { useEffect, useState } from 'react';
import { AlertTriangle, AlertOctagon, X } from 'lucide-react';

export default function AlertBanner({ mood, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (mood === 'Stressed' || mood === 'Critical Stress') {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 12000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [mood]);

  if (!visible) return null;

  const isCritical = mood === 'Critical Stress';
  const bannerStyle = isCritical ? {
    background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.1))',
    borderColor: 'rgba(255, 0, 0, 0.5)',
    animation: 'border-glow-red 1s ease-in-out infinite'
  } : {
    background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.15), rgba(255, 184, 0, 0.08))',
    borderColor: 'rgba(255, 184, 0, 0.3)',
  };

  const Icon = isCritical ? AlertOctagon : AlertTriangle;
  const iconColor = isCritical ? '#ff0000' : 'var(--accent-amber)';

  return (
    <div className="alert-banner" style={{ ...bannerStyle, animation: 'slide-down 0.4s ease-out' }}>
      <div className="alert-banner__content">
        <Icon size={20} className="alert-banner__icon" style={{ color: iconColor }} />
        <div className="alert-banner__text">
          <strong style={{ color: iconColor }}>
            {isCritical ? 'CRITICAL AI STRATEGY ALERT' : 'AI STRATEGY ALERT'}
          </strong>
          <span>
            {isCritical 
              ? 'Driver stress detected combined with losing pace. Recommend immediate calming radio check or pit stop window to prevent further time loss.'
              : 'Driver stress detected. Monitor lap times closely for performance degradation.'}
          </span>
        </div>
        <button
          className="alert-banner__close"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
