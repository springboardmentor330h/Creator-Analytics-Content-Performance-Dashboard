import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'success', message = '' } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#f43f5e" />;
      case 'info':
      default:
        return <Info size={18} color="#2563eb" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#a7f3d0';
      case 'error': return '#fecdd3';
      default: return '#bfdbfe';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return '#ecfdf5';
      case 'error': return '#fff1f2';
      default: return '#eff6ff';
    }
  };

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      animation: 'slideUpToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{
        backgroundColor: getBgColor(),
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
        minWidth: '280px',
        maxWidth: '420px'
      }}>
        {getIcon()}
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', flex: 1 }}>
          {message}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
