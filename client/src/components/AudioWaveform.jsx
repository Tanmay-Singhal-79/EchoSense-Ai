import React, { useEffect, useState } from 'react';
import { Activity, Radio, Volume2 } from 'lucide-react';

export default function AudioWaveform() {
  const [bars, setBars] = useState([
    24, 45, 68, 92, 40, 75, 50, 85, 30, 60, 95, 42, 70, 88, 35, 62, 78, 48, 90, 55, 32, 65, 80, 44, 72, 85, 38,
  ]);
  const [isLive, setIsLive] = useState(true);

  // Animate waveform bars gently
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((val) => {
          const delta = (Math.random() - 0.5) * 24;
          return Math.max(15, Math.min(100, Math.round(val + delta)));
        })
      );
    }, 180);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="audio-waveform-container">
      <div className="waveform-header">
        <div className="waveform-status">
          <span className="live-indicator-dot"></span>
          <span className="live-indicator-text">Acoustic Emotion Stream</span>
        </div>
        <div className="waveform-metrics">
          <span className="metric-chip">
            <Radio size={12} className="chip-icon" /> 152.1 Hz Pitch
          </span>
          <span className="metric-chip">
            <Activity size={12} className="chip-icon" /> 0.48 Energy
          </span>
          <span className="metric-chip">
            <Volume2 size={12} className="chip-icon" /> 145 wpm
          </span>
        </div>
      </div>

      <div className="waveform-display" onClick={() => setIsLive(!isLive)} title="Click to pause/resume animation">
        {bars.map((height, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${height}%`,
              animationDelay: `${i * 35}ms`,
            }}
          />
        ))}
      </div>

      <div className="waveform-caption">
        <span>CNN-LSTM Acoustic Feature Extraction</span>
        <span className="waveform-badge">Multi-Modal Fusion Ready</span>
      </div>
    </div>
  );
}
