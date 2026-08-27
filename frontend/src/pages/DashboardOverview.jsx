import React, { useEffect, useState } from 'react';
import { getReportSummary } from '../services/api';
import { Eye, ThumbsUp, DollarSign, Award, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReportSummary(8)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch dashboard metrics. Verify backend server is running on port 8000.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500 gap-2 font-medium">
      <Loader2 className="w-6 h-6 animate-spin text-sky-600" /> Loading live creator analytics...
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 font-medium">
      <AlertCircle className="w-5 h-5 shrink-0" /> {error}
    </div>
  );

  // Safely extract content metrics with fallbacks to avoid NaN errors
  const totalViews = data?.content_performance?.total_views ?? 0;
  const totalLikes = data?.content_performance?.total_likes ?? 0;
  const totalComments = data?.content_performance?.total_comments ?? 0;
  const totalPosts = data?.content_performance?.total_posts ?? 0;
  
  const directRevenue = data?.revenue_summary?.total_direct_revenue ?? 0;
  const sponsorshipValue = data?.revenue_summary?.total_sponsorship_value ?? 0;
  const combinedTotal = data?.revenue_summary?.combined_total ?? (directRevenue + sponsorshipValue);
  
  const totalEngagements = totalLikes + totalComments;

  const kpis = [
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Direct Revenue', value: `$${directRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sponsorship Value', value: `$${sponsorshipValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const chartData = [
    { name: 'Direct Revenue', amount: directRevenue },
    { name: 'Sponsorships', amount: sponsorshipValue },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {data?.creator?.name || 'Creator'}!</h2>
        <p className="text-gray-500 text-sm mt-0.5">{data?.creator?.email || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Stream Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Combined Financial Summary</h3>
            <p className="text-sm text-gray-500 mb-6">Aggregate totals across all tracked revenue channels.</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg">
              <span className="text-sm font-semibold text-sky-800">Combined Total Revenue</span>
              <p className="text-3xl font-extrabold text-sky-950 mt-1">
                ${combinedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-sm text-gray-600 space-y-2 pt-2">
              <p>• Total Content Items: <strong className="text-gray-900">{totalPosts}</strong></p>
              <p>• Total Engagements: <strong className="text-gray-900">{totalEngagements.toLocaleString()}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}