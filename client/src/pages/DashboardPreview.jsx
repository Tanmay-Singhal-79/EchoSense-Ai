import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Camera,
  CheckCircle,
  Eye,
  Mic,
  Radio,
  Sparkles,
  TrendingUp,
  User,
  Volume2,
  Zap,
  ArrowLeft,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import AudioWaveform from '../components/AudioWaveform';
import { useAuth } from '../hooks/useAuth';

// Mock data strictly reflecting Project Synopsis figures (Page 9-11)
const EMOTION_DISTRIBUTION = [
  { name: 'Happy', value: 45, color: '#10B981' },
  { name: 'Neutral', value: 25, color: '#06B6D4' },
  { name: 'Sad', value: 15, color: '#6366F1' },
  { name: 'Angry', value: 10, color: '#EF4444' },
  { name: 'Fear', value: 5, color: '#F59E0B' },
];

const VALENCE_TREND_DATA = [
  { time: '10:00', valence: 0.42, arousal: 0.36 },
  { time: '10:05', valence: 0.55, arousal: 0.41 },
  { time: '10:10', valence: 0.68, arousal: 0.48 },
  { time: '10:15', valence: 0.35, arousal: 0.62 },
  { time: '10:20', valence: -0.12, arousal: 0.75 },
  { time: '10:25', valence: 0.28, arousal: 0.50 },
  { time: '10:30', valence: 0.65, arousal: 0.38 },
  { time: '10:35', valence: 0.74, arousal: 0.32 },
];

export default function DashboardPreview({ onNavigate }) {
  const { user } = useAuth();
  const [liveEmotion, setLiveEmotion] = useState({
    state: 'Calm',
    confidence: 84,
    valence: '+0.68',
    arousal: '0.36',
  });

  // Minor simulated real-time fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      const states = ['Calm', 'Engaged', 'Focused', 'Content'];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setLiveEmotion({
        state: randomState,
        confidence: Math.floor(80 + Math.random() * 15),
        valence: '+' + (0.55 + Math.random() * 0.25).toFixed(2),
        arousal: (0.3 + Math.random() * 0.15).toFixed(2),
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-top-bar">
        <div className="dash-title-wrap">
          <button
            type="button"
            onClick={() => onNavigate('welcome')}
            className="btn-ghost btn-sm"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Account
          </button>
          <div>
            <h1 className="dash-heading">
              Live Multi-Modal Analytics <span className="dash-tag">Preview Engine</span>
            </h1>
            <p className="dash-subheading">
              EchoSense AI • Speech and Facial Emotion Recognition Dashboard
            </p>
          </div>
        </div>

        <div className="dash-actions">
          <div className="live-status-badge">
            <span className="status-dot-pulse"></span>
            <span>Real-Time Ingestion Active</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row (from synopsis Figure 10.2) */}
      <div className="stats-kpi-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrap bg-cyan-subtle">
            <Radio size={20} className="text-cyan" />
          </div>
          <div className="kpi-text">
            <span className="kpi-label">Active Audio/Video Streams</span>
            <span className="kpi-value">12</span>
            <span className="kpi-trend text-emerald">+3 in last 10m</span>
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrap bg-emerald-subtle">
            <Sparkles size={20} className="text-emerald" />
          </div>
          <div className="kpi-text">
            <span className="kpi-label">Avg. Emotion Valence</span>
            <span className="kpi-value text-emerald">{liveEmotion.valence}</span>
            <span className="kpi-trend text-emerald">Positive State</span>
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrap bg-red-subtle">
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <div className="kpi-text">
            <span className="kpi-label">High Distress Alerts</span>
            <span className="kpi-value text-danger">3</span>
            <span className="kpi-trend text-danger">Threshold &gt; 0.70</span>
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrap bg-purple-subtle">
            <Activity size={20} className="text-purple" />
          </div>
          <div className="kpi-text">
            <span className="kpi-label">Total Analyzed Sessions</span>
            <span className="kpi-value">128</span>
            <span className="kpi-trend text-muted">All-Time Database</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Feed & Donut Charts */}
      <div className="dashboard-main-grid">
        {/* Left Column: Live Stream & Audio Analysis */}
        <div className="glass-card stream-panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <Camera size={18} className="text-cyan" />
              <h3>Live Multimodal Session Feed</h3>
            </div>
            <span className="panel-badge">Attention Fusion Active</span>
          </div>

          <div className="live-camera-mockup">
            <div className="mock-video-box">
              <div className="face-bounding-tracker">
                <div className="bounding-tag">Subject #01: {liveEmotion.state}</div>
                <div className="bounding-corners"></div>
              </div>
              <div className="stream-overlay-metrics">
                <span className="metric-tag">Valence: {liveEmotion.valence}</span>
                <span className="metric-tag">Arousal: {liveEmotion.arousal}</span>
                <span className="metric-tag">Confidence: {liveEmotion.confidence}%</span>
              </div>
            </div>

            <div className="live-emotion-pills">
              <div className="emotion-pill-item pill-happy">
                <span>Happiness</span>
                <strong>68%</strong>
              </div>
              <div className="emotion-pill-item pill-neutral">
                <span>Neutrality</span>
                <strong>22%</strong>
              </div>
              <div className="emotion-pill-item pill-sad">
                <span>Sadness</span>
                <strong>10%</strong>
              </div>
            </div>
          </div>

          {/* Integrated Speech Emotion Waveform */}
          <div className="stream-audio-section mt-4">
            <h4 className="audio-section-title">
              <Mic size={16} className="text-cyan" />
              <span>Real-Time Speech Emotion Spectrum</span>
            </h4>
            <AudioWaveform />
          </div>
        </div>

        {/* Right Column: Emotion Distribution & Alerts */}
        <div className="dashboard-right-charts">
          {/* Donut Chart: Emotion Distribution */}
          <div className="glass-card chart-card">
            <div className="panel-header">
              <div className="panel-title-group">
                <Smile size={18} className="text-purple" />
                <h3>Emotion Distribution (Today)</h3>
              </div>
            </div>

            <div className="donut-chart-wrap" style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EMOTION_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {EMOTION_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1738',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend-grid">
              {EMOTION_DISTRIBUTION.map((item) => (
                <div key={item.name} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-percent">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Emotion Alerts (from synopsis Figure 10.2) */}
          <div className="glass-card chart-card">
            <div className="panel-header">
              <div className="panel-title-group">
                <AlertTriangle size={18} className="text-danger" />
                <h3>Recent High-Frustration Alerts</h3>
              </div>
            </div>

            <div className="alert-event-list">
              <div className="alert-event-item">
                <div className="alert-event-left">
                  <span className="alert-dot-danger"></span>
                  <div>
                    <strong>High Frustration Detected</strong>
                    <p>Agent #04 • Call Session #1178</p>
                  </div>
                </div>
                <span className="alert-time">2m ago</span>
              </div>

              <div className="alert-event-item">
                <div className="alert-event-left">
                  <span className="alert-dot-warning"></span>
                  <div>
                    <strong>Acoustic Agitation Spike (320 Hz)</strong>
                    <p>Agent #02 • Call Session #1172</p>
                  </div>
                </div>
                <span className="alert-time">14m ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valence-Arousal Over Time (from synopsis Figure 10.4) */}
      <div className="glass-card timeline-chart-card mt-4">
        <div className="panel-header">
          <div className="panel-title-group">
            <TrendingUp size={18} className="text-cyan" />
            <h3>Valence & Arousal Dynamics Over Time</h3>
          </div>
          <span className="panel-badge">Continuous Multi-Task Output</span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={VALENCE_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#64748B" />
              <YAxis domain={[-0.5, 1]} stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1738',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="valence"
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{ fill: '#06B6D4', r: 4 }}
                activeDot={{ r: 6 }}
                name="Valence (Pleasantness)"
              />
              <Line
                type="monotone"
                dataKey="arousal"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ fill: '#A855F7', r: 3 }}
                name="Arousal (Intensity)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
