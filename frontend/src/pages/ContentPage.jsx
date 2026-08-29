import React, { useEffect, useState } from 'react';
import { getReportSummary } from '../services/api';
import { Video, ThumbsUp, MessageSquare, Share2, Eye } from 'lucide-react';

export default function ContentPage({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const creatorId = user?.id ?? user?.user_id ?? 1;

  useEffect(() => {
    getReportSummary(creatorId).then(res => {
      setData(res.data.content_summary);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [creatorId]);

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading content metrics...</div>;

  const metrics = [
    { label: 'Published Posts', value: data?.total_posts || 0, icon: Video, color: 'text-indigo-600' },
    { label: 'Total Views', value: data?.total_views?.toLocaleString() || 0, icon: Eye, color: 'text-blue-600' },
    { label: 'Total Likes', value: data?.total_likes?.toLocaleString() || 0, icon: ThumbsUp, color: 'text-emerald-600' },
    { label: 'Total Comments', value: data?.total_comments?.toLocaleString() || 0, icon: MessageSquare, color: 'text-amber-600' },
    { label: 'Total Shares', value: data?.total_shares?.toLocaleString() || 0, icon: Share2, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Performance</h2>
        <p className="text-gray-500 text-sm">Real-time aggregate analytics for your published content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">{m.label}</span>
                <Icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}