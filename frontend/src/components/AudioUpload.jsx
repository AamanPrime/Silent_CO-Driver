import { useState, useRef, useCallback } from 'react';
import { Upload, Mic, Loader2, Play, Square } from 'lucide-react';

const ACCEPTED_TYPES = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/flac', 'audio/x-wav', 'audio/mp3', 'audio/webm'];

export default function AudioUpload({ onResult, isAnalyzing, setIsAnalyzing }) {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleFile = useCallback((f) => {
    setError(null);
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(wav|mp3|ogg|flac|webm)$/i)) {
      setError('Unsupported format. Use WAV, MP3, OGG, FLAC, or WebM.');
      return;
    }
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleAnalyze = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/analyze-radio', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze audio.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAudioUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="audio-upload glass-panel">
      <div className="section-label">📡 Radio Comms</div>

      {!file ? (
        <div
          className={`drop-zone ${isDragOver ? 'drop-zone--active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-zone__icon">
            <Upload size={28} strokeWidth={1.5} />
          </div>
          <p className="drop-zone__text">
            Drop audio file here or <span className="drop-zone__link">browse</span>
          </p>
          <p className="drop-zone__hint">WAV, MP3, OGG, FLAC • Max 30s recommended</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.ogg,.flac,.webm,audio/*"
            onChange={(e) => handleFile(e.target.files[0])}
            hidden
          />
        </div>
      ) : (
        <div className="audio-preview fade-in">
          <div className="audio-file-info">
            <Mic size={16} />
            <span className="audio-file-name">{file.name}</span>
            <button className="btn-clear" onClick={clearFile} title="Remove">×</button>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="audio-player"
          />

          <button
            className={`btn-analyze ${isAnalyzing ? 'btn-analyze--loading' : ''}`}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play size={18} />
                Analyze Radio
              </>
            )}
          </button>
        </div>
      )}

      {error && <div className="audio-error fade-in">{error}</div>}
    </div>
  );
}
