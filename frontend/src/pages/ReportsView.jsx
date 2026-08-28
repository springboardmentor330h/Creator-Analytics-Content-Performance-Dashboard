import React, { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, BarChart2, DollarSign, Users, TrendingUp, Layers, CheckCircle, Trash2 } from 'lucide-react';
import { api } from '../api';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';

export default function ReportsView() {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('executive_summary');
  const [selectedRange, setSelectedRange] = useState('all_time');
  const [currentReport, setCurrentReport] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [typesRes, savedRes] = await Promise.all([
        api.getReportTypes().catch(() => []),
        api.getSavedReports().catch(() => [])
      ]);
      setReportTypes(Array.isArray(typesRes) ? typesRes : []);
      setSavedReports(Array.isArray(savedRes) ? savedRes : []);

      // Generate default executive report on load
      handleGenerateReport('executive_summary', 'all_time', false);
    } catch (e) {
      console.error('Failed to initialize report center:', e);
    }
  };

  const { items: sortedSavedReports, requestSort, sortConfig } = useSortableData(savedReports, { key: 'created_at', direction: 'desc' });

  const handleGenerateReport = async (type = selectedType, range = selectedRange, save = true) => {
    setGenerating(true);
    try {
      const data = await api.generateReport(type, range, save);
      setCurrentReport(data);
      if (save) {
        const updatedSaved = await api.getSavedReports();
        setSavedReports(Array.isArray(updatedSaved) ? updatedSaved : []);
      }
    } catch (err) {
      alert(`Report Generation Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await api.downloadReportPdf(selectedType, selectedRange);
    } catch (err) {
      alert(`PDF Export Error: ${err.message}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      await api.downloadReportExcel(selectedType, selectedRange);
    } catch (err) {
      alert(`Excel Export Error: ${err.message}`);
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDeleteSavedReport = async (id) => {
    if (!window.confirm('Delete this saved report record?')) return;
    try {
      await api.deleteReport(id);
      const updatedSaved = await api.getSavedReports();
      setSavedReports(Array.isArray(updatedSaved) ? updatedSaved : []);
    } catch (err) {
      alert(`Error deleting report: ${err.message}`);
    }
  };

  const reportData = currentReport?.report_data || {};
  const kpis = reportData.summary_kpis || {};
  const tables = reportData.detailed_tables || {};
  const insights = reportData.strategic_insights || [];
  const recommendations = reportData.recommendations || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER BAR */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={22} color="#2563eb" />
              <span>CreatorIQ Reporting & Multi-Format Export Center</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Generate comprehensive analytics reports across Content, Audience, Revenue, and Growth metrics. Export directly to formatted PDF & multi-tab Excel files.
            </p>
          </div>
        </div>

        {/* REPORT TYPE SELECTOR GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {[
            { id: 'executive_summary', name: 'Executive Overview', desc: 'Holistic KPI summary across all modules', icon: BarChart2, color: '#2563eb' },
            { id: 'content_performance', name: 'Content Analytics', desc: 'Top videos, engagement rates & views', icon: Layers, color: '#ec4899' },
            { id: 'audience_analytics', name: 'Audience Demographics', desc: 'Age, gender, top location & device data', icon: Users, color: '#8b5cf6' },
            { id: 'revenue_analytics', name: 'Revenue & Sponsorships', desc: 'Earnings by source, brand deal breakdown', icon: DollarSign, color: '#10b981' },
            { id: 'growth_trends', name: 'Growth Trends', desc: 'Follower gain & impressions trajectory', icon: TrendingUp, color: '#f59e0b' }
          ].map((item) => {
            const isSelected = selectedType === item.id;
            const IconComp = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedType(item.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <IconComp size={18} color={item.color} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{item.name}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CONTROLS BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Horizon:</span>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="7_days">Last 7 Days</option>
                <option value="30_days">Last 30 Days</option>
                <option value="90_days">Last 90 Days</option>
                <option value="all_time">All Time Horizon</option>
              </select>
            </div>

            <button
              onClick={() => handleGenerateReport(selectedType, selectedRange, true)}
              disabled={generating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <RefreshCw size={14} className={generating ? 'spin' : ''} />
              {generating ? 'Compiling Metrics...' : 'Generate & Save Report'}
            </button>
          </div>

          {/* EXPORT BUTTONS */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
              }}
            >
              <Download size={16} />
              {downloadingPdf ? 'Exporting PDF...' : 'Download PDF Report'}
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
              }}
            >
              <Download size={16} />
              {downloadingExcel ? 'Exporting Excel...' : 'Download Excel (.xlsx)'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Report Preview */}
      {currentReport && (
        <div className="section-card" style={{ border: '2px solid #3b82f6' }}>
          {/* Report Banner Header */}
          <div style={{
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#3b82f6', padding: '3px 8px', borderRadius: '4px' }}>
                  {currentReport.report_type_name || currentReport.report_type}
                </span>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px 0' }}>
                  {currentReport.title}
                </h1>
                <p style={{ fontSize: '13px', color: '#bfdbfe', margin: 0 }}>
                  Prepared for <strong>{currentReport.creator?.name}</strong> ({currentReport.creator?.email}) • Generated: {currentReport.generated_at}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#93c5fd', display: 'block' }}>Date Range Horizon</span>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>
                  {currentReport.date_range?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '14px' }}>
            Executive KPI Summary
          </h3>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-label">TOTAL VIEWS</div>
              <div className="stat-value">{(kpis.total_views || 0).toLocaleString()}</div>
              <div className="stat-trend">Portfolio Views</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">TOTAL REVENUE</div>
              <div className="stat-value" style={{ color: '#059669' }}>${(kpis.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="stat-trend">Combined Earnings</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">AVG ENGAGEMENT</div>
              <div className="stat-value" style={{ color: '#2563eb' }}>{(kpis.average_engagement_rate || 0).toFixed(2)}%</div>
              <div className="stat-trend">Engagement Rate</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">TOTAL FOLLOWERS</div>
              <div className="stat-value">{(kpis.total_followers || 0).toLocaleString()}</div>
              <div className="stat-trend">Community Size</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">ORGANIC REACH</div>
              <div className="stat-value">{(kpis.combined_total_reach || 0).toLocaleString()}</div>
              <div className="stat-trend">Cross-Platform Reach</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">SPONSORSHIP REV</div>
              <div className="stat-value" style={{ color: '#d97706' }}>${(kpis.total_sponsorship_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="stat-trend">Brand Deals</div>
            </div>
          </div>

          {/* Strategic Insights & Recommendations */}
          {(insights.length > 0 || recommendations.length > 0) && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#065f46', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="#059669" /> Strategic Insights & Recommendations
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#047857', fontSize: '13px', lineHeight: 1.6 }}>
                {insights.map((ins, idx) => (
                  <li key={`ins-${idx}`}><strong>Insight:</strong> {ins}</li>
                ))}
                {recommendations.map((rec, idx) => (
                  <li key={`rec-${idx}`}><strong>Action:</strong> {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tables Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Content Table */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                Content Performance Breakdown
              </h4>
              <div className="table-responsive">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Platform</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Shares</th>
                      <th>Engagement Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tables.content_performance || []).slice(0, 6).map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700 }}>{c.title}</td>
                        <td>{c.platform}</td>
                        <td>{(c.views || 0).toLocaleString()}</td>
                        <td>{(c.likes || 0).toLocaleString()}</td>
                        <td>{(c.shares || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: '#2563eb' }}>{(c.engagement_rate || 0).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue & Sponsorship Table */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                Revenue Streams & Sponsorship Deals
              </h4>
              <div className="table-responsive">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Source / Brand Partner</th>
                      <th>Category</th>
                      <th>Amount (USD)</th>
                      <th>Status / Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tables.revenue_by_source || []).map((r, i) => (
                      <tr key={`rev-${i}`}>
                        <td style={{ fontWeight: 700 }}>{r.source}</td>
                        <td>Revenue Stream</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>${(r.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>{(r.percentage || 0).toFixed(1)}% Share</td>
                      </tr>
                    ))}
                    {(tables.sponsorships || []).map((s) => (
                      <tr key={`sp-${s.id}`}>
                        <td style={{ fontWeight: 700 }}>{s.brand_name} ({s.campaign_name})</td>
                        <td>Sponsorship Campaign</td>
                        <td style={{ color: '#d97706', fontWeight: 700 }}>${(s.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>{s.status} / {s.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports Log with Up/Down Arrow Column Sorting */}
      <div className="section-card">
        <h3 className="section-title" style={{ marginBottom: '14px' }}>
          Saved Analytics Reports Log
        </h3>
        <div className="table-responsive">
          <table className="simple-table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="Report ID" columnKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Title" columnKey="title" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Type" columnKey="report_type" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Horizon" columnKey="date_range" sortConfig={sortConfig} onSort={requestSort} />
                <SortHeader label="Generated At" columnKey="created_at" sortConfig={sortConfig} onSort={requestSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSavedReports.length > 0 ? (
                sortedSavedReports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>#{r.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{r.title}</td>
                    <td style={{ padding: '14px 18px' }}>{r.report_type}</td>
                    <td style={{ padding: '14px 18px' }}>{r.date_range?.replace('_', ' ')}</td>
                    <td style={{ padding: '14px 18px' }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <button
                        className="btn-small btn-edit"
                        onClick={() => api.downloadSavedReportPdf(r.id)}
                        style={{ marginRight: '6px' }}
                      >
                        PDF
                      </button>
                      <button
                        className="btn-small btn-edit"
                        onClick={() => api.downloadSavedReportExcel(r.id)}
                        style={{ marginRight: '6px', backgroundColor: '#059669' }}
                      >
                        Excel
                      </button>
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleDeleteSavedReport(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={FileText}
                      title="No Saved Reports"
                      description="Generate PDF and Excel reports to save analytics snapshots."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
