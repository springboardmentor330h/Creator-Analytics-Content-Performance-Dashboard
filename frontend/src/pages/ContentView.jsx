import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Video, Eye, ThumbsUp, Share2 } from 'lucide-react';
import ContentModal from '../components/ContentModal';
import StatCard from '../components/StatCard';

export default function ContentView({ contents, onAdd, onUpdate, onDelete }) {
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

  const totalViews = contents.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalLikes = contents.reduce((acc, c) => acc + (c.likes || 0), 0);
  const totalReach = contents.reduce((acc, c) => acc + (c.reach || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Metric Row */}
      <div className="metrics-row">
        <StatCard
          label="Total Content Views"
          value={totalViews > 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : totalViews.toLocaleString()}
          trend="+12.4% vs last month"
        />
        <StatCard
          label="Total Likes & Engagements"
          value={totalLikes.toLocaleString()}
          trend="+8.7% likes"
        />
        <StatCard
          label="Total Organic Reach"
          value={totalReach > 1000000 ? `${(totalReach / 1000000).toFixed(1)}M` : totalReach.toLocaleString()}
          trend="+15.2% impressions"
        />
      </div>

      {/* Content Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="chart-title">Creator Content Performance Library</h3>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Create Content Record</span>
          </button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Platform</th>
              <th>Content Title</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Reach</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents && contents.length > 0 ? (
              contents.map((item) => (
                <tr key={item.id}>
                  <td><strong>#{item.id}</strong></td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: item.platform === 'YouTube' ? '#fee2e2' : item.platform === 'Instagram' ? '#fce7f3' : '#e0e7ff',
                      color: item.platform === 'YouTube' ? '#dc2626' : item.platform === 'Instagram' ? '#be185d' : '#4338ca'
                    }}>
                      {item.platform}
                    </span>
                  </td>
                  <td><strong>{item.content_title}</strong></td>
                  <td>{item.views ? item.views.toLocaleString() : 0}</td>
                  <td>{item.likes ? item.likes.toLocaleString() : 0}</td>
                  <td>{item.comments ? item.comments.toLocaleString() : 0}</td>
                  <td>{item.reach ? item.reach.toLocaleString() : 0}</td>
                  <td>{item.published_date || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="action-btn" onClick={() => handleOpenEdit(item)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => onDelete(item.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  No content records found. Click "Create Content Record" to add item.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRecord}
      />
    </div>
  );
}
