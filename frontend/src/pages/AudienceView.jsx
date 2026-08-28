import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, MapPin, Smartphone, Users } from 'lucide-react';
import AudienceModal from '../components/AudienceModal';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';

export default function AudienceView({ records, report, onAdd, onUpdate, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const { items: sortedRecords, requestSort, sortConfig } = useSortableData(records || [], { key: 'followers', direction: 'desc' });

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="chart-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5' }}>
            <Globe size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top Country</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{report?.top_country || 'United States'}</div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '12px', color: '#059669' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top City</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{report?.top_city || 'Bangalore'}</div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '10px', background: '#ffe4e6', borderRadius: '12px', color: '#f43f5e' }}>
            <Smartphone size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top Device</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{report?.top_device || 'Desktop'}</div>
          </div>
        </div>
      </div>

      {/* Audience Data Table with Interactive Column Sorting */}
      <div className="table-container" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="table-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 className="chart-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Audience Demographic Records</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Click column headers to sort by Followers, Reach, Active Hour, or Demographics (▲ Ascending / ▼ Descending)
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Audience Record</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Gender" columnKey="gender" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Age Group" columnKey="age_group" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Country / City" columnKey="country" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Device" columnKey="device_type" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Active Hour" columnKey="active_hour" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Followers" columnKey="followers" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Reach" columnKey="reach" sortConfig={sortConfig} onSort={requestSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords && sortedRecords.length > 0 ? (
                sortedRecords.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}><strong>#{rec.id}</strong></td>
                    <td style={{ padding: '14px 18px' }}>{rec.gender || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.age_group || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.country}, {rec.city}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.device_type}</td>
                    <td style={{ padding: '14px 18px' }}>{rec.active_hour}:00 HRS</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{rec.followers ? rec.followers.toLocaleString() : 0}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>{rec.reach ? rec.reach.toLocaleString() : 0}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn-small btn-edit" onClick={() => handleOpenEdit(rec)} title="Edit">
                          <Edit2 size={13} /> Edit
                        </button>
                        <button className="btn-small btn-delete" onClick={() => onDelete(rec.id)} title="Delete">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Users}
                      title="No Audience Records Found"
                      description="Create demographic entries to track device usage, age groups, and geographical reach."
                      actionLabel="+ Add First Audience Record"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
