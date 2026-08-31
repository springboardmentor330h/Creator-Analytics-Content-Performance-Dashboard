import { useMemo, useState } from 'react';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

const PLATFORM_OPTIONS = ['YouTube', 'Instagram', 'TikTok', 'LinkedIn'];

const createVideoRow = () => ({
  title: '',
  views: '',
  likes: '',
  comments: '',
  shares: '',
  reach: '',
});

export default function DashboardOverview() {
  const [channelName, setChannelName] = useState('Creator Corner');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('YouTube');
  const [videos, setVideos] = useState([
    { title: 'Intro video', views: '125000', likes: '15000', comments: '1100', shares: '900', reach: '220000' },
    { title: 'Growth tips', views: '95000', likes: '12000', comments: '800', shares: '700', reach: '180000' },
  ]);
  const [summary, setSummary] = useState({
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_reach: 0,
    total_followers: 0,
    average_engagement_rate: 0,
    top_video: '',
  });
  const [comparison, setComparison] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const comparisonRows = useMemo(() => Object.entries(comparison), [comparison]);
  const maxViews = Math.max(...comparisonRows.map(([, values]) => values.views || 0), 1);

  const handleVideoChange = (index, field, value) => {
    setVideos((currentVideos) => currentVideos.map((video, videoIndex) => (
      videoIndex === index ? { ...video, [field]: value } : video
    )));
  };

  const handleAddVideo = () => {
    setVideos((currentVideos) => [...currentVideos, createVideoRow()]);
  };

  const handleRemoveVideo = (index) => {
    setVideos((currentVideos) => currentVideos.filter((_, videoIndex) => videoIndex !== index));
  };

  const handlePlatformChange = (nextPlatform) => {
    setSelectedPlatform(nextPlatform);
    if (nextPlatform === 'Instagram') {
      setVideos([
        { title: 'Launch reel', views: '42000', likes: '5400', comments: '210', shares: '180', reach: '61000' },
        { title: 'Product teaser', views: '31000', likes: '3800', comments: '140', shares: '120', reach: '47000' },
      ]);
    }
  };

  const handleCalculateStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedPlatform === 'YouTube') {
        const enteredChannelName = channelName.trim();
        const enteredApiKey = youtubeApiKey.trim();

        if (!enteredApiKey) {
          setError('Enter your YouTube Data API key to fetch live channel stats.');
          return;
        }

        if (!enteredChannelName) {
          setError('Enter the YouTube channel name to fetch the latest stats.');
          return;
        }

        const youtubeData = await api.get(`/social/youtube/channel?channel_name=${encodeURIComponent(enteredChannelName)}&api_key=${encodeURIComponent(enteredApiKey)}`);
        if (!youtubeData || !youtubeData.channel) {
          setError('No YouTube channel matched that name. Try a different channel name or check the API key.');
          return;
        }

        const channel = youtubeData.channel;
        const totalViews = Number(channel.views || 0);
        const totalLikes = Number(channel.likes || 0);
        const totalComments = Number(channel.comments || 0);
        const totalShares = Number(channel.shares || 0);
        const totalReach = Number(channel.reach || 0);
        const averageEngagement = totalReach > 0
          ? Math.round(((totalLikes + totalComments + totalShares) / totalReach) * 10000) / 100
          : 0;

        const data = {
          channel_name: enteredChannelName,
          platform: 'YouTube',
          total_views: totalViews,
          total_likes: totalLikes,
          total_comments: totalComments,
          total_shares: totalShares,
          total_reach: totalReach,
          total_followers: Number(channel.subscribers || 0),
          average_engagement_rate: averageEngagement,
          top_video: channel.top_video || channel.title || enteredChannelName,
        };

        setSummary(data);
        setComparison({
          YouTube: {
            views: data.total_views,
            reach: data.total_reach,
            engagement_rate: data.average_engagement_rate,
          },
        });
        return;
      }

      const sanitizedVideos = videos
        .map((video) => ({
          title: (video.title || '').trim(),
          views: Number(video.views || 0),
          likes: Number(video.likes || 0),
          comments: Number(video.comments || 0),
          shares: Number(video.shares || 0),
          reach: Number(video.reach || 0),
        }))
        .filter((video) => video.title || video.views || video.likes || video.comments || video.shares || video.reach);

      if (!sanitizedVideos.length) {
        setError('Add at least one video with a title or metric value to calculate stats.');
        return;
      }

      const data = await api.post('/analytics/dynamic', {
        channel_name: channelName.trim() || 'My Channel',
        platform: selectedPlatform,
        videos: sanitizedVideos,
      });

      setSummary(data);
      setComparison({
        [selectedPlatform]: {
          views: data.total_views,
          reach: data.total_reach,
          engagement_rate: data.average_engagement_rate,
        },
      });
    } catch (fetchError) {
      console.error('Dynamic analytics fetch failed:', fetchError);
      setError(fetchError.message || 'Unable to calculate the channel statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportDownload = async () => {
    const filename = `creatoriq_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    await api.downloadFile('/reports/export/pdf/1', filename);
  };

  const handleExcelDownload = async () => {
    const filename = `creatoriq_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    await api.downloadFile('/reports/export/excel/1', filename);
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>CreatorIQ Overview</p>
          <h1 style={styles.title}>Dynamic channel dashboard</h1>
        </div>

        <div style={styles.topActions}>
          <button onClick={handleReportDownload} style={styles.exportButtonPrimary}>
            <FileText size={15} />
            Download Report
          </button>
          <button onClick={handleExcelDownload} style={styles.exportButtonSecondary}>
            <Download size={15} />
            Download Excel
          </button>
        </div>
      </div>

      <div style={styles.inputPanel}>
        <div style={styles.formRow}>
          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Channel name</span>
            <input
              value={channelName}
              onChange={(event) => setChannelName(event.target.value)}
              placeholder="Enter content channel name"
              style={styles.input}
            />
          </label>

          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Platform</span>
            <select
              value={selectedPlatform}
              onChange={(event) => handlePlatformChange(event.target.value)}
              style={styles.select}
            >
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </label>

          <button onClick={handleCalculateStats} style={styles.calculateButton}>
            {loading ? 'Calculating...' : 'Get stats'}
          </button>
        </div>

        {selectedPlatform === 'YouTube' ? (
          <div style={{ ...styles.videoEditor, gap: '0.75rem' }}>
            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>YouTube API key</span>
              <input
                value={youtubeApiKey}
                onChange={(event) => setYoutubeApiKey(event.target.value)}
                placeholder="Paste your YouTube Data API key"
                style={styles.input}
                type="password"
              />
            </label>
          </div>
        ) : (
          <div style={styles.videoEditor}>
            <div style={styles.mockDataNote}>
              {selectedPlatform === 'Instagram' ? 'Sample Instagram post data' : 'Enter sample data for this platform'}
            </div>
            {videos.map((video, index) => (
              <div key={`${video.title || 'video'}-${index}`} style={styles.videoRow}>
                <input
                  value={video.title}
                  onChange={(event) => handleVideoChange(index, 'title', event.target.value)}
                  placeholder="Post title"
                  style={{ ...styles.input, flex: '1.6' }}
                />
                <input
                  type="number"
                  min="0"
                  value={video.views}
                  onChange={(event) => handleVideoChange(index, 'views', event.target.value)}
                  placeholder="Views"
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="number"
                  min="0"
                  value={video.likes}
                  onChange={(event) => handleVideoChange(index, 'likes', event.target.value)}
                  placeholder="Likes"
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="number"
                  min="0"
                  value={video.comments}
                  onChange={(event) => handleVideoChange(index, 'comments', event.target.value)}
                  placeholder="Comments"
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="number"
                  min="0"
                  value={video.shares}
                  onChange={(event) => handleVideoChange(index, 'shares', event.target.value)}
                  placeholder="Shares"
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="number"
                  min="0"
                  value={video.reach}
                  onChange={(event) => handleVideoChange(index, 'reach', event.target.value)}
                  placeholder="Reach"
                  style={{ ...styles.input, flex: 1 }}
                />
                <button onClick={() => handleRemoveVideo(index)} style={styles.iconButton} aria-label="Remove video">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button onClick={handleAddVideo} style={styles.addButton}>
              <Plus size={15} />
              Add video
            </button>
          </div>
        )}
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}

      <div style={styles.kpiGrid}>
        <KpiCard label="Channel" value={channelName || 'My Channel'} accent="#2563eb" />
        <KpiCard label="Total Views" value={summary.total_views?.toLocaleString?.() ?? '0'} accent="#2563eb" />
        <KpiCard label="Total Likes" value={summary.total_likes?.toLocaleString?.() ?? '0'} accent="#10b981" />
        <KpiCard label="Comments" value={summary.total_comments?.toLocaleString?.() ?? '0'} accent="#f59e0b" />
        <KpiCard label="Reach" value={summary.total_reach?.toLocaleString?.() ?? '0'} accent="#8b5cf6" />
        <KpiCard label="Top Video" value={summary.top_video || '—'} accent="#14b8a6" />
        <KpiCard label="Engagement" value={`${summary.average_engagement_rate ?? 0}%`} accent="#ef4444" />
      </div>

      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Performance snapshot</h2>
          <span style={styles.badge}>{selectedPlatform}</span>
        </div>

        <div style={styles.comparisonList}>
          {comparisonRows.length ? comparisonRows.map(([platform, data]) => (
            <div key={platform} style={styles.platformRow}>
              <div style={styles.platformMeta}>
                <strong>{platform}</strong>
                <span>{data.engagement_rate ?? 0}% engagement</span>
              </div>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${((data.views || 0) / maxViews) * 100}%`,
                    background: '#2563eb',
                  }}
                />
              </div>
              <span style={styles.valueText}>{(data.views || 0).toLocaleString()} views</span>
            </div>
          )) : (
            <p style={styles.emptyState}>No data yet. Add a few video entries and click “Get stats”.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <div style={{ ...styles.kpiCard, borderTop: `4px solid ${accent}` }}>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '0.5rem 0'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  topActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginLeft: 'auto'
  },
  exportButtonPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: '10px',
    background: '#2563eb',
    color: '#fff',
    padding: '0.75rem 1rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  exportButtonSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    background: '#fff',
    color: '#0f172a',
    padding: '0.75rem 1rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  eyebrow: {
    margin: 0,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    color: '#64748b',
    letterSpacing: '0.08em'
  },
  title: {
    margin: '0.25rem 0 0',
    fontSize: '2rem',
    color: '#0f172a'
  },
  inputPanel: {
    background: '#fff',
    borderRadius: '18px',
    padding: '1.25rem',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px, 1.4fr) minmax(180px, 0.7fr) auto',
    gap: '0.9rem',
    alignItems: 'end'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontWeight: 600,
    color: '#334155'
  },
  fieldLabel: {
    fontSize: '0.8rem'
  },
  input: {
    border: '1px solid #dbe3f0',
    background: '#fff',
    borderRadius: '10px',
    padding: '0.75rem 0.9rem',
    fontSize: '0.95rem',
    color: '#0f172a'
  },
  select: {
    border: '1px solid #dbe3f0',
    background: '#fff',
    borderRadius: '10px',
    padding: '0.75rem 0.9rem',
    fontSize: '0.95rem',
    color: '#0f172a'
  },
  calculateButton: {
    border: 'none',
    borderRadius: '10px',
    background: '#2563eb',
    color: '#fff',
    padding: '0.8rem 1.1rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  videoEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
  },
  mockDataNote: {
    color: '#2563eb',
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  videoRow: {
    display: 'flex',
    gap: '0.7rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  iconButton: {
    border: '1px solid #fecaca',
    background: '#fff1f2',
    color: '#e11d48',
    borderRadius: '10px',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  addButton: {
    alignSelf: 'flex-start',
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '10px',
    padding: '0.6rem 0.9rem',
    fontWeight: 600,
    display: 'inline-flex',
    gap: '0.45rem',
    alignItems: 'center',
    cursor: 'pointer'
  },
  loading: {
    color: '#475569',
    fontSize: '1rem'
  },
  errorBox: {
    borderRadius: '10px',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '0.8rem 1rem',
    fontWeight: 600
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  kpiCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
    minHeight: '120px'
  },
  kpiLabel: {
    color: '#64748b',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  kpiValue: {
    marginTop: '0.9rem',
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  panel: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  panelTitle: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#0f172a'
  },
  badge: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '999px',
    padding: '0.38rem 0.72rem',
    fontSize: '0.78rem',
    fontWeight: 700
  },
  comparisonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  platformRow: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr 110px',
    alignItems: 'center',
    gap: '0.75rem'
  },
  platformMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    color: '#334155'
  },
  barTrack: {
    height: '12px',
    background: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '999px'
  },
  valueText: {
    fontSize: '0.8rem',
    color: '#475569',
    textAlign: 'right'
  }
};
