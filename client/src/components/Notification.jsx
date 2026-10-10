import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function Notification({ type = 'info', message, onClose }) {
  if (!message) return null;

  const icons = {
    error: <AlertCircle className="notif-icon notif-error" size={20} />,
    success: <CheckCircle2 className="notif-icon notif-success" size={20} />,
    warning: <AlertTriangle className="notif-icon notif-warning" size={20} />,
    info: <Info className="notif-icon notif-info" size={20} />,
  };

  return (
    <div className={`notification-card notification-${type} animate-fade-in`}>
      <div className="notif-content">
        {icons[type] || icons.info}
        <span className="notif-text">{message}</span>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="notif-close-btn" aria-label="Close notification">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
