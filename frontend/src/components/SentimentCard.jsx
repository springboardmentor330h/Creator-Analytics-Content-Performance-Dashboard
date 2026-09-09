import React from 'react';
import { Smile, MessageSquare, ThumbsUp, Tag, Activity } from 'lucide-react';

export default function SentimentCard({ sentimentData, className = '' }) {
  const data = sentimentData || {
    sentiment_score: 8.5,
    sentiment_label: 'Very Positive',
    positive_pct: 76.5,
    neutral_pct: 17.5,
    negative_pct: 6.0,
    total_comments_analyzed: 1250,
    topics: [
      { keyword: 'High Quality', count: 340, sentiment: 'positive' },
      { keyword: 'Tutorial Request', count: 210, sentiment: 'neutral' },
      { keyword: 'Valuable Insights', count: 185, sentiment: 'positive' },
      { keyword: 'Pricing Query', count: 95, sentiment: 'neutral' }
    ]
  };

  const getScoreColor = (score) => {
    if (score >= 8.0) return '#10b981';
    if (score >= 6.5) return '#2563eb';
    if (score >= 5.0) return '#f59e0b';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(data.sentiment_score);

  return (
    <div className={`section-card ${className}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: `${scoreColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: scoreColor
          }}>
            <Smile size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Audience Sentiment & Comment Analyzer
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time comment mood & topic breakdown across channels
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: `${scoreColor}15`,
          border: `1px solid ${scoreColor}40`,
          padding: '5px 12px',
          borderRadius: '9999px',
          color: scoreColor,
          fontWeight: 800,
          fontSize: '13px'
        }}>
          <Activity size={14} />
          <span>{data.sentiment_score} / 10 • {data.sentiment_label}</span>
        </div>
      </div>

      {/* Sentiment Breakdown Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ThumbsUp size={13} /> Positive ({data.positive_pct}%)
          </span>
          <span style={{ color: '#64748b' }}>
            Neutral ({data.neutral_pct}%)
          </span>
          <span style={{ color: '#ef4444' }}>
            Negative ({data.negative_pct}%)
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div style={{
          height: '10px',
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{ width: `${data.positive_pct}%`, backgroundColor: '#10b981', transition: 'width 0.4s ease' }} title={`Positive: ${data.positive_pct}%`} />
          <div style={{ width: `${data.neutral_pct}%`, backgroundColor: '#94a3b8', transition: 'width 0.4s ease' }} title={`Neutral: ${data.neutral_pct}%`} />
          <div style={{ width: `${data.negative_pct}%`, backgroundColor: '#ef4444', transition: 'width 0.4s ease' }} title={`Negative: ${data.negative_pct}%`} />
        </div>
      </div>

      {/* Keywords & Topic Distribution */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Tag size={13} />
          <span>Trending Comment Keywords & Topics ({data.total_comments_analyzed.toLocaleString()} Comments Analyzed)</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {data.topics && data.topics.map((t, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: t.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                border: `1px solid ${t.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.25)'}`,
                color: t.sentiment === 'positive' ? '#047857' : '#475569',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <MessageSquare size={13} />
              <span>{t.keyword}</span>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 800
              }}>
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
