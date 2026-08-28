import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Video, Search, Layers, Share2 } from 'lucide-react';
import ContentModal from '../components/ContentModal';
import StatCard from '../components/StatCard';
import YouTubeSyncModal from '../components/YouTubeSyncModal';
import EmptyState from '../components/EmptyState';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from '../components/PlatformIcons';
import { formatNumber, rawNumber } from '../utils/format';
import { useSortableData, SortHeader } from '../utils/useSortableData';

const platforms = ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter/X'];

const platformIconMap = {
  YouTube: { icon: YoutubeIcon, color: '#dc2626', bg: '#fee2e2' },
  Instagram: { icon: InstagramIcon, color: '#be185d', bg: '#fce7f3' },
  TikTok: { icon: TikTokIcon, color: '#0891b2', bg: '#ecfeff' },
  LinkedIn: { icon: LinkedInIcon, color: '#1d4ed8', bg: '#eff6ff' },
  'Twitter/X': { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  Twitter: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  X: { icon: TwitterIcon, color: '#0284c7', bg: '#e0f2fe' },
  Facebook: { icon: Share2, color: '#2563eb', bg: '#eff6ff' },
};

export default function ContentView({ contents, onAdd, onUpdate, onDelete, onSyncYouTube, selectedPlatform, onSelectPlatform }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContents = (contents || []).filter(c => {
    const matchesPlatform = !selectedPlatform || selectedPlatform === 'All' || (c.platform || '').toLowerCase() === selectedPlatform.toLowerCase();
    const matchesSearch = !searchQuery || (c.content_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const { items: sortedContents, requestSort, sortConfig } = useSortableData(filteredContents, { key: 'views', direction: 'desc' });

  const totalViews = filteredContents.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalLikes = filteredContents.reduce((acc, c) => acc + (c.likes || 0), 0);
  const totalReach = filteredContents.reduce((acc, c) => acc + (c.reach || 0), 0);

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
      {/* Top Controls: Platform Filters & Search Bar & YouTube Sync */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginRight: '6px' }}>Filter:</span>
          {platforms.map((p) => {
            const active = (selectedPlatform || 'All').toLowerCase() === p.toLowerCase();
            return (
              <button
                key={p}
                onClick={() => onSelectPlatform && onSelectPlatform(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: active ? 'none' : '1px solid #cbd5e1',
                  backgroundColor: active ? '#2563eb' : '#f8fafc',
                  color: active ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search content library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>

          {onSyncYouTube && (
            <button
              onClick={() => setIsYouTubeModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <YoutubeIcon size={16} color="#ffffff" />
              <span>Sync YouTube Channel</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          label={`${selectedPlatform && selectedPlatform !== 'All' ? selectedPlatform : 'Total'} Views`}
          value={formatNumber(totalViews)}
          trend="Cumulative Views"
        />
        <StatCard
          label="Total Engagements"
          value={formatNumber(totalLikes)}
          trend="Likes & Reactions"
        />
        <StatCard
          label="Filtered Organic Reach"
          value={formatNumber(totalReach)}
          trend="Unique Reach"
        />
      </div>

      {/* Content Performance Table with Interactive Up/Down Arrow Sorting */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#2563eb" />
              <span>Content Performance Library</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                {filteredContents.length} items
              </span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Click column headers to sort by Views, Likes, Comments, Reach, or Date (▲ Ascending / ▼ Descending)
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Create Content Record</span>
          </button>
        </div>

        <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Platform" columnKey="platform" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Content Title" columnKey="content_title" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Views" columnKey="views" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Likes" columnKey="likes" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Comments" columnKey="comments" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Reach" columnKey="reach" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Published Date" columnKey="published_date" sortConfig={sortConfig} onSort={requestSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedContents && sortedContents.length > 0 ? (
                sortedContents.map((item) => {
                  const platMeta = platformIconMap[item.platform] || { icon: Share2, color: '#334155', bg: '#f1f5f9' };
                  const IconComp = platMeta.icon;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>#{item.id}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          backgroundColor: platMeta.bg,
                          color: platMeta.color,
                          fontSize: '12px',
                          fontWeight: 800
                        }}>
                          <IconComp size={14} color={platMeta.color} />
                          <span>{item.platform}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', maxWidth: '320px' }}>
                        {item.content_title}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }} className="has-tooltip">
                        {formatNumber(item.views || 0)}
                        <span className="number-tooltip">Raw: {rawNumber(item.views || 0)}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155' }} className="has-tooltip">
                        {formatNumber(item.likes || 0)}
                        <span className="number-tooltip">Raw: {rawNumber(item.likes || 0)}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155' }} className="has-tooltip">
                        {formatNumber(item.comments || 0)}
                        <span className="number-tooltip">Raw: {rawNumber(item.comments || 0)}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }} className="has-tooltip">
                        {formatNumber(item.reach || 0)}
                        <span className="number-tooltip">Raw: {rawNumber(item.reach || 0)}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '13px' }}>
                        {item.published_date || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Record"
                            className="btn-small btn-edit"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            title="Delete Record"
                            className="btn-small btn-delete"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Video}
                      title="No Content Items Found"
                      description={`No content items recorded for ${selectedPlatform || 'All Platforms'}.`}
                      actionLabel="+ Add First Content Item"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRecord}
      />

      {onSyncYouTube && (
        <YouTubeSyncModal
          isOpen={isYouTubeModalOpen}
          onClose={() => setIsYouTubeModalOpen(false)}
          onSync={onSyncYouTube}
        />
      )}
    </div>
  );
}
