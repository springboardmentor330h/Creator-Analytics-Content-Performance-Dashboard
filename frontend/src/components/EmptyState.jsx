import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No Records Found",
  description = "Get started by adding your first record to track performance analytics.",
  actionLabel = "+ Add Record",
  onAction
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      backgroundColor: '#f8fafc',
      border: '2px dashed #e2e8f0',
      borderRadius: '16px',
      textAlign: 'center',
      margin: '12px 0'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px'
      }}>
        <Icon size={26} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', marginBottom: '18px' }}>
        {description}
      </p>

      {onAction && (
        <button className="btn-add" onClick={onAction}>
          <Plus size={16} /> {actionLabel}
        </button>
      )}
    </div>
  );
}
