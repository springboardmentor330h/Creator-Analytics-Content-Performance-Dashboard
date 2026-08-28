import React, { useState } from 'react';
import { DollarSign, Briefcase, Plus, Filter, TrendingUp, Award, Layers, CreditCard, Edit2, Trash2 } from 'lucide-react';
import { formatNumber } from '../utils/format';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';

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

  // Filtered Lists
  const filteredRevenues = (revenueRecords || []).filter(r => {
    if (selectedSourceFilter !== 'All' && (r.source || '').toLowerCase() !== selectedSourceFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const filteredSponsorships = (sponsorshipRecords || []).filter(s => {
    if (selectedStatusFilter !== 'All' && (s.status || '').toLowerCase() !== selectedStatusFilter.toLowerCase()) {
      return false;
    }
    if (selectedPaymentFilter !== 'All' && (s.payment_status || '').toLowerCase() !== selectedPaymentFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Sortable Hooks
  const { items: sortedSponsorships, requestSort: requestSponsorshipSort, sortConfig: sponsorshipSortConfig } = useSortableData(filteredSponsorships, { key: 'contract_value', direction: 'desc' });
  const { items: sortedRevenues, requestSort: requestRevenueSort, sortConfig: revenueSortConfig } = useSortableData(filteredRevenues, { key: 'amount', direction: 'desc' });

  const sourceBreakdown = revenueSummary?.revenue_by_source || [];
  const palette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active': return { label: 'Active', bg: '#d1fae5', color: '#047857' };
      case 'completed': return { label: 'Completed', bg: '#dbeafe', color: '#1d4ed8' };
      case 'pending': return { label: 'Pending', bg: '#fef3c7', color: '#b45309' };
      case 'cancelled': return { label: 'Cancelled', bg: '#ffe4e6', color: '#be123c' };
      default: return { label: status, bg: '#f1f5f9', color: '#475569' };
    }
  };

  const getPaymentBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid': return { label: 'Paid', bg: '#d1fae5', color: '#047857' };
      case 'unpaid': return { label: 'Unpaid', bg: '#ffe4e6', color: '#be123c' };
      case 'pending': return { label: 'Pending', bg: '#fef3c7', color: '#b45309' };
      default: return { label: status, bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* EXECUTIVE REVENUE SUMMARY CARDS */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={22} color="#10b981" />
              <span>Revenue Analytics & Financial Summary</span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Real-time aggregated revenue streams from GET /revenue/analytics/summary
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-add" onClick={onAddRevenue} style={{ backgroundColor: '#10b981' }}>
              + Record Revenue
            </button>
            <button className="btn-add" onClick={onAddSponsorship} style={{ backgroundColor: '#4f46e5' }}>
              + New Sponsorship
            </button>
          </div>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Total Revenue</span>
              <TrendingUp size={18} color="#10b981" />
            </div>
            <div className="stat-value" style={{ color: '#047857' }}>${formatNumber(totalRev)}</div>
            <span className="stat-trend up">Live Realtime Total</span>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Sponsorship Deals</span>
              <Briefcase size={18} color="#3b82f6" />
            </div>
            <div className="stat-value" style={{ color: '#1d4ed8' }}>${formatNumber(sponsorshipRev)}</div>
            <span className="stat-trend" style={{ color: '#1d4ed8' }}>Brand Partnerships</span>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Active Contracts Value</span>
              <Award size={18} color="#8b5cf6" />
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

      {/* SECTION: SPONSORSHIP MANAGEMENT TABLE WITH INTERACTIVE COLUMN SORTING */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#2563eb" />
              <span>Sponsorship Deals Manager ({filteredSponsorships.length})</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Click headers to sort by Contract Value, Dates, or Statuses (▲ Ascending / ▼ Descending)
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
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Brand Name" columnKey="brand_name" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Campaign" columnKey="campaign_name" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Contract Value" columnKey="contract_value" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Start Date" columnKey="start_date" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="End Date" columnKey="end_date" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Deal Status" columnKey="status" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Payment Status" columnKey="payment_status" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSponsorships && sortedSponsorships.length > 0 ? (
                sortedSponsorships.map((sp) => {
                  const sBadge = getStatusBadge(sp.status);
                  const pBadge = getPaymentBadge(sp.payment_status);

                  return (
                    <tr key={sp.id}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>#{sp.id}</td>
                      <td style={{ padding: '14px 18px' }}><strong style={{ color: '#1e293b' }}>{sp.brand_name}</strong></td>
                      <td style={{ padding: '14px 18px' }}>{sp.campaign_name}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669' }}>
                        ${formatNumber(sp.contract_value)}
                      </td>
                      <td style={{ padding: '14px 18px' }}>{sp.start_date || 'N/A'}</td>
                      <td style={{ padding: '14px 18px' }}>{sp.end_date || 'Ongoing'}</td>
                      <td style={{ padding: '14px 18px' }}>
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
                      <td style={{ padding: '14px 18px' }}>
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
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Briefcase}
                      title="No Sponsorship Deals Found"
                      description="Track your active brand deals, contract values, and payment status."
                      actionLabel="+ Log First Sponsorship Deal"
                      onAction={onAddSponsorship}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: REVENUE TRANSACTIONS LOG TABLE WITH INTERACTIVE COLUMN SORTING */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="#10b981" />
              <span>Revenue Transactions Log ({filteredRevenues.length})</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Click headers to sort by Amount, Date, or Source Stream (▲ Ascending / ▼ Descending)
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
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Date" columnKey="date" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Source Stream" columnKey="source" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Description" columnKey="description" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Amount ($)" columnKey="amount" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Currency" columnKey="currency" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRevenues && sortedRevenues.length > 0 ? (
                sortedRevenues.map((rev) => (
                  <tr key={rev.id}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>#{rev.id}</td>
                    <td style={{ padding: '14px 18px' }}>{rev.date || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>
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
                    <td style={{ padding: '14px 18px' }}>{rev.description || 'N/A'}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#047857' }}>
                      ${formatNumber(rev.amount)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>{rev.currency || 'USD'}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={DollarSign}
                      title="No Revenue Records Found"
                      description="Record your income transactions across sponsorship deals, ad revenue, and affiliate marketing."
                      actionLabel="+ Record First Revenue Entry"
                      onAction={onAddRevenue}
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
