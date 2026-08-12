import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

export default function TranscriptPanel({ transcript, isAnalyzing }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!transcript) {
      setDisplayedText('');
      return;
    }

    // Typewriter effect
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < transcript.length) {
        setDisplayedText(transcript.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [transcript]);

  return (
    <div className="transcript-panel glass-panel">
      <div className="section-label">📝 Live Transcript</div>

      <div className="transcript-content">
        {isAnalyzing ? (
          <div className="transcript-loading">
            <div className="transcript-loading__bar shimmer-loading" />
            <div className="transcript-loading__bar shimmer-loading" style={{ width: '75%' }} />
            <div className="transcript-loading__bar shimmer-loading" style={{ width: '50%' }} />
          </div>
        ) : transcript ? (
          <div className="transcript-text fade-in">
            <Radio size={14} className="transcript-icon" />
            <p>
              "{displayedText}"
              <span className="transcript-cursor">|</span>
            </p>
          </div>
        ) : (
          <div className="transcript-empty">
            <Radio size={20} className="transcript-empty__icon" />
            <p>Radio transcript will appear here after analysis…</p>
          </div>
        )}
      </div>
    </div>
  );
}
