import React, { useState } from 'react';
import { DollarSign, Briefcase, Plus, Filter, TrendingUp, Award, Layers, CreditCard, Edit2, Trash2 } from 'lucide-react';
import { formatNumber } from '../utils/format';

export default function RevenueView({
  revenueSummary,
  revenueRecords,
  sponsorshipRecords,
  onAddRevenue,
  onUpdateRevenue,
  onDeleteRevenue,
  onAddSponsorship,
  onUpdateSponsorship,
  onDeleteSponsorship
}) {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('All');

  // KPI Calculations
  const totalRev = revenueSummary?.total_revenue ?? 0;
  const sponsorshipRev = revenueSummary?.total_sponsorship_revenue ?? 0;
  const adRev = revenueSummary?.total_ad_revenue ?? 0;
  const affiliateRev = revenueSummary?.total_affiliate_revenue ?? 0;
  const collabRev = revenueSummary?.total_collaboration_revenue ?? 0;
  const subRev = revenueSummary?.total_subscription_revenue ?? 0;

  const activeDeals = (sponsorshipRecords || []).filter(s => (s.status || '').toLowerCase() === 'active');
  const activeDealsValue = activeDeals.reduce((sum, s) => sum + (Number(s.contract_value) || 0), 0);

  // Filtered Revenue List
  const filteredRevenues = (revenueRecords || []).filter(r => {
    if (selectedSourceFilter !== 'All' && (r.source || '').toLowerCase() !== selectedSourceFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Filtered Sponsorship List
  const filteredSponsorships = (sponsorshipRecords || []).filter(s => {
    if (selectedStatusFilter !== 'All' && (s.status || '').toLowerCase() !== selectedStatusFilter.toLowerCase()) {
      return false;
    }
    if (selectedPaymentFilter !== 'All' && (s.payment_status || '').toLowerCase() !== selectedPaymentFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Data for Doughnut Chart
  const sourceBreakdown = revenueSummary?.revenue_by_source || [];
  const palette = ['#10b981', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Status Badge Styling Helper
  const getStatusBadge = (statusStr) => {
    const st = (statusStr || '').toLowerCase();
    if (st === 'active') return { bg: '#dbeafe', color: '#1e40af', label: 'Active' };
    if (st === 'completed') return { bg: '#dcfce7', color: '#15803d', label: 'Completed' };
    if (st === 'pending') return { bg: '#fef3c7', color: '#b45309', label: 'Pending' };
    return { bg: '#fee2e2', color: '#b91c1c', label: statusStr || 'Cancelled' };
  };

  const getPaymentBadge = (payStr) => {
    const pst = (payStr || '').toLowerCase();
    if (pst === 'paid') return { bg: '#dcfce7', color: '#15803d', label: 'Paid' };
    if (pst === 'unpaid') return { bg: '#fee2e2', color: '#b91c1c', label: 'Unpaid' };
    if (pst === 'processing') return { bg: '#e0e7ff', color: '#4338ca', label: 'Processing' };
    return { bg: '#fef3c7', color: '#b45309', label: payStr || 'Pending' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* SECTION HEADER & TOP EXECUTIVE STAT CARDS */}
      <div className="section-card">
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={24} color="#10b981" />
              <span>Revenue Analytics & Sponsorship Hub (Milestone 3)</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Track all creator revenue streams, brand sponsorship deals, monthly earnings, and financial analytics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-add" onClick={onAddSponsorship} style={{ backgroundColor: '#2563eb' }}>
              + Add Sponsorship Deal
            </button>
            <button className="btn-add" onClick={onAddRevenue} style={{ backgroundColor: '#10b981' }}>
              + Record Revenue
            </button>
          </div>
        </div>

        {/* 5 Financial KPI Cards */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Total Earnings</span>
              <TrendingUp size={18} color="#10b981" />
            </div>
            <div className="stat-value" style={{ color: '#047857' }}>${formatNumber(totalRev)}</div>
            <span className="stat-trend" style={{ color: '#059669' }}>All Revenue Streams</span>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Sponsorships Revenue</span>
              <Briefcase size={18} color="#2563eb" />
            </div>
            <div className="stat-value" style={{ color: '#1d4ed8' }}>${formatNumber(sponsorshipRev)}</div>
            <span className="stat-trend" style={{ color: '#2563eb' }}>Brand Integrations</span>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Ad Revenue</span>
              <Award size={18} color="#f59e0b" />
            </div>
            <div className="stat-value" style={{ color: '#b45309' }}>${formatNumber(adRev)}</div>
            <span className="stat-trend" style={{ color: '#d97706' }}>AdSense & Creator Fund</span>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Active Deals Value</span>
              <Layers size={18} color="#8b5cf6" />
            </div>
            <div className="stat-value" style={{ color: '#6d28d9' }}>${formatNumber(activeDealsValue)}</div>
            <span className="stat-trend" style={{ color: '#7c3aed' }}>{activeDeals.length} Active Contracts</span>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #ec4899' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Subscriptions & MRR</span>
              <CreditCard size={18} color="#ec4899" />
            </div>
            <div className="stat-value" style={{ color: '#be185d' }}>${formatNumber(subRev)}</div>
            <span className="stat-trend" style={{ color: '#db2777' }}>Recurring Memberships</span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID: SOURCE BREAKDOWN & MONTHLY TRENDS */}
      <div className="dashboard-layout">
        {/* Revenue by Source Pie / Legend Card */}
        <div className="chart-card">
          <h3 className="chart-title">Earnings Breakdown by Source</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
            Percentage distribution across all revenue streams
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {sourceBreakdown && sourceBreakdown.length > 0 ? (
              sourceBreakdown.map((item, idx) => {
                const color = palette[idx % palette.length];
                return (
                  <div key={item.source} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
                        {item.source}
                      </span>
                      <span>${formatNumber(item.amount)} ({item.percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(item.percentage, 100)}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>
                No revenue breakdown data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue Bar / Trend Visualizer */}
        <div className="chart-card">
          <h3 className="chart-title">Monthly Revenue Aggregation</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
            Historical earnings trends calculated from recorded transactions
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '180px', paddingTop: '20px', borderBottom: '1px solid #e2e8f0' }}>
            {(revenueSummary?.monthly_revenue || []).length > 0 ? (
              (revenueSummary?.monthly_revenue || []).map((mItem) => {
                const maxVal = Math.max(...(revenueSummary?.monthly_revenue || []).map(x => x.amount), 1);
                const heightPct = Math.max(Math.round((mItem.amount / maxVal) * 100), 12);

                return (
                  <div key={`${mItem.month}-${mItem.year}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                      ${formatNumber(mItem.amount)}
                    </span>
                    <div style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }} title={`${mItem.month} ${mItem.year}: $${mItem.amount}`} />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                      {mItem.month}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ width: '100%', textAlign: 'center', color: '#64748b', alignSelf: 'center' }}>
                No monthly revenue trend items available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: SPONSORSHIP MANAGEMENT TABLE */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#2563eb" />
              <span>Sponsorship Deals Manager ({filteredSponsorships.length})</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Manage brand partnerships, contract values, campaign dates, and payment statuses
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Filter size={14} color="#64748b" />
              <select
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="All">All Deal Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              >
                <option value="All">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>
            </div>

            <button className="btn-add" onClick={onAddSponsorship} style={{ padding: '6px 14px', fontSize: '13px' }}>
              + Add Deal
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Brand Name</th>
                <th>Campaign</th>
                <th>Contract Value</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Deal Status</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSponsorships && filteredSponsorships.length > 0 ? (
                filteredSponsorships.map((sp) => {
                  const sBadge = getStatusBadge(sp.status);
                  const pBadge = getPaymentBadge(sp.payment_status);

                  return (
                    <tr key={sp.id}>
                      <td>#{sp.id}</td>
                      <td><strong style={{ color: '#1e293b' }}>{sp.brand_name}</strong></td>
                      <td>{sp.campaign_name}</td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        ${formatNumber(sp.contract_value)}
                      </td>
                      <td>{sp.start_date || 'N/A'}</td>
                      <td>{sp.end_date || 'Ongoing'}</td>
                      <td>
                        <span style={{
                          backgroundColor: sBadge.bg,
                          color: sBadge.color,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {sBadge.label}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: pBadge.bg,
                          color: pBadge.color,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {pBadge.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-small btn-edit" onClick={() => onUpdateSponsorship(sp)}>
                            <Edit2 size={12} /> Edit
                          </button>
                          <button className="btn-small btn-delete" onClick={() => onDeleteSponsorship(sp.id)}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                    No sponsorship records found matching selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: REVENUE TRANSACTIONS LOG TABLE */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="#10b981" />
              <span>Revenue Transactions Log ({filteredRevenues.length})</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Detailed ledger of earnings across sponsorships, ads, affiliates, and subscriptions
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Filter size={14} color="#64748b" />
              <select
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                value={selectedSourceFilter}
                onChange={(e) => setSelectedSourceFilter(e.target.value)}
              >
                <option value="All">All Sources</option>
                <option value="Sponsorships">Sponsorships</option>
                <option value="Ad Revenue">Ad Revenue</option>
                <option value="Affiliate Marketing">Affiliate Marketing</option>
                <option value="Brand Collaborations">Brand Collaborations</option>
                <option value="Subscription Revenue">Subscription Revenue</option>
              </select>
            </div>

            <button className="btn-add" onClick={onAddRevenue} style={{ padding: '6px 14px', fontSize: '13px', backgroundColor: '#10b981' }}>
              + Add Revenue
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Source Stream</th>
                <th>Description</th>
                <th>Amount ($)</th>
                <th>Currency</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRevenues && filteredRevenues.length > 0 ? (
                filteredRevenues.map((rev) => (
                  <tr key={rev.id}>
                    <td>#{rev.id}</td>
                    <td>{rev.date || 'N/A'}</td>
                    <td>
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {rev.source}
                      </span>
                    </td>
                    <td>{rev.description || 'N/A'}</td>
                    <td style={{ fontWeight: 800, color: '#047857' }}>
                      ${formatNumber(rev.amount)}
                    </td>
                    <td>{rev.currency || 'USD'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-small btn-edit" onClick={() => onUpdateRevenue(rev)}>
                          <Edit2 size={12} /> Edit
                        </button>
                        <button className="btn-small btn-delete" onClick={() => onDeleteRevenue(rev.id)}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                    No revenue transactions found matching selected filter.
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
