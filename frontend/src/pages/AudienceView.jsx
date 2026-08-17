import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, MapPin, Smartphone } from 'lucide-react';
import AudienceModal from '../components/AudienceModal';
import StatCard from '../components/StatCard';

export default function AudienceView({ records, report, onAdd, onUpdate, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingRecord) {
      onUpdate(editingRecord.id, data);
    } else {
      onAdd(data);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Report Cards */}
      <div className="metrics-row">
        <StatCard
          label="Total Audience Followers"
          value={report?.total_followers ? report.total_followers.toLocaleString() : '125,000'}
          trend="+3.4% active"
        />
        <StatCard
          label="Total Reach"
          value={report?.total_reach ? report.total_reach.toLocaleString() : '450,000'}
          trend="+5.1% global"
        />
        <StatCard
          label="Total Impressions"
          value={report?.total_impressions ? report.total_impressions.toLocaleString() : '720,000'}
          trend="+2.8% views"
        />
      </div>

      {/* Demographic Highlights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="chart-card" style={{ padding: '16px 20px', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5' }}>
            <Globe size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top Country</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{report?.top_country || 'United States'}</div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: '16px 20px', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '12px', color: '#059669' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top City</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{report?.top_city || 'Bangalore'}</div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: '16px 20px', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: '#ffe4e6', borderRadius: '12px', color: '#f43f5e' }}>
            <Smartphone size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top Device</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{report?.top_device || 'Desktop'}</div>
          </div>
        </div>
      </div>

      {/* Audience Data Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="chart-title">Audience Demographic Records</h3>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Audience Record</span>
          </button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Gender</th>
              <th>Age Group</th>
              <th>Country / City</th>
              <th>Device</th>
              <th>Active Hour</th>
              <th>Followers</th>
              <th>Reach</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records && records.length > 0 ? (
              records.map((rec) => (
                <tr key={rec.id}>
                  <td><strong>#{rec.id}</strong></td>
                  <td>{rec.gender || 'N/A'}</td>
                  <td>{rec.age_group || 'N/A'}</td>
                  <td>{rec.country}, {rec.city}</td>
                  <td>{rec.device_type}</td>
                  <td>{rec.active_hour}:00 HRS</td>
                  <td>{rec.followers ? rec.followers.toLocaleString() : 0}</td>
                  <td>{rec.reach ? rec.reach.toLocaleString() : 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="action-btn" onClick={() => handleOpenEdit(rec)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => onDelete(rec.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  No audience records found. Click "Add Audience Record" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AudienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRecord}
      />
    </div>
  );
}
