import React, { useState } from 'react';
import { DollarSign, Briefcase, Plus, Filter, TrendingUp, Award, CreditCard, Edit2, Trash2, PieChart, BarChart3, Search, Sparkles } from 'lucide-react';
import { FormattedNumber, FormattedCurrency } from '../utils/format';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';
import Pagination from '../components/Pagination';


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
  const [sponsorshipSearchQuery, setSponsorshipSearchQuery] = useState('');
  const [revenueSearchQuery, setRevenueSearchQuery] = useState('');

  // KPI Calculations
  const totalRev = revenueSummary?.total_revenue ?? 0;
  const sponsorshipRev = revenueSummary?.total_sponsorship_revenue ?? 0;
  const subRev = revenueSummary?.total_subscription_revenue ?? 0;

  const activeDeals = (sponsorshipRecords || []).filter(s => (s.status || '').toLowerCase() === 'active');
  const activeDealsValue = activeDeals.reduce((sum, s) => sum + (Number(s.contract_value || s.amount) || 0), 0);

  // Filtered Lists
  const filteredRevenues = (revenueRecords || []).filter(r => {
    const matchesSource = selectedSourceFilter === 'All' || (r.source || '').toLowerCase() === selectedSourceFilter.toLowerCase();
    const matchesSearch = !revenueSearchQuery || (r.description || r.source || '').toLowerCase().includes(revenueSearchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const filteredSponsorships = (sponsorshipRecords || []).filter(s => {
    const matchesStatus = selectedStatusFilter === 'All' || (s.status || '').toLowerCase() === selectedStatusFilter.toLowerCase();
    const matchesPayment = selectedPaymentFilter === 'All' || (s.payment_status || '').toLowerCase() === selectedPaymentFilter.toLowerCase();
    const matchesSearch = !sponsorshipSearchQuery || (s.brand_name || s.campaign_name || '').toLowerCase().includes(sponsorshipSearchQuery.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const [sponsorshipPage, setSponsorshipPage] = useState(1);
  const [sponsorshipPageSize, setSponsorshipPageSize] = useState(5);
  const [revenuePage, setRevenuePage] = useState(1);
  const [revenuePageSize, setRevenuePageSize] = useState(5);

  // Sortable Hooks
  const { items: sortedSponsorships, requestSort: requestSponsorshipSort, sortConfig: sponsorshipSortConfig } = useSortableData(filteredSponsorships, { key: 'contract_value', direction: 'desc' });
  const { items: sortedRevenues, requestSort: requestRevenueSort, sortConfig: revenueSortConfig } = useSortableData(filteredRevenues, { key: 'amount', direction: 'desc' });

  const totalSponsorshipPages = Math.ceil(sortedSponsorships.length / sponsorshipPageSize) || 1;
  const paginatedSponsorships = sortedSponsorships.slice((sponsorshipPage - 1) * sponsorshipPageSize, sponsorshipPage * sponsorshipPageSize);

  const totalRevenuePages = Math.ceil(sortedRevenues.length / revenuePageSize) || 1;
  const paginatedRevenues = sortedRevenues.slice((revenuePage - 1) * revenuePageSize, revenuePage * revenuePageSize);


  const sourceBreakdown = revenueSummary?.revenue_by_source || [];
  const palette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active': return { label: 'Active', bg: '#d1fae5', color: '#047857', border: '#a7f3d0' };
      case 'completed': return { label: 'Completed', bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
      case 'pending': return { label: 'Pending', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'cancelled': return { label: 'Cancelled', bg: '#ffe4e6', color: '#be123c', border: '#fecdd3' };
      default: return { label: status || 'Active', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  const getPaymentBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid': return { label: 'Paid', bg: '#d1fae5', color: '#047857', border: '#a7f3d0' };
      case 'unpaid': return { label: 'Unpaid', bg: '#ffe4e6', color: '#be123c', border: '#fecdd3' };
      case 'pending': return { label: 'Pending', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      default: return { label: status || 'Pending', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* FINANCIAL COMMAND BANNER CARD */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px -5px rgba(6, 78, 59, 0.15)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          color: '#ffffff',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Sparkles size={13} color="#a7f3d0" />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#ecfdf5' }}>
                Financial Intelligence & Revenue Hub
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.6px', color: '#ffffff', lineHeight: 1.2 }}>
              Revenue Analytics & Sponsorship Management
            </h1>
            <p style={{ fontSize: '14px', color: '#a7f3d0', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              Monitor monetization streams, track recurring cash flows, and oversee active brand deal contracts in Indian Rupees (₹).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onAddRevenue}
              style={{
                backgroundColor: '#ffffff',
                color: '#047857',
                fontWeight: 800,
                fontSize: '13px',
                padding: '11px 20px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
            >
              <Plus size={16} color="#047857" /> Record Income
            </button>

            <button
              onClick={onAddSponsorship}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                padding: '11px 20px',
                borderRadius: '9999px',
                border: '1px solid #34d399',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)'; }}
            >
              <Briefcase size={16} color="#ffffff" /> New Brand Deal
            </button>
          </div>
        </div>
      </div>

      {/* 4-METRIC SCORECARD GRID */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981', backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ color: '#475569', fontWeight: 800 }}>TOTAL REVENUE</span>
            <div style={{ backgroundColor: '#d1fae5', padding: '8px', borderRadius: '10px' }}>
              <TrendingUp size={18} color="#047857" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#047857', margin: '10px 0 4px 0', fontSize: '26px', fontWeight: 800 }}>
            <FormattedNumber value={totalRev} prefix="₹" />
          </div>
          <span className="stat-trend up" style={{ fontSize: '11px', fontWeight: 700 }}>
            Combined Recorded Earnings
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6', backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ color: '#475569', fontWeight: 800 }}>SPONSORSHIPS</span>
            <div style={{ backgroundColor: '#dbeafe', padding: '8px', borderRadius: '10px' }}>
              <Briefcase size={18} color="#1d4ed8" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#1d4ed8', margin: '10px 0 4px 0', fontSize: '26px', fontWeight: 800 }}>
            <FormattedNumber value={sponsorshipRev} prefix="₹" />
          </div>
          <span className="stat-trend" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px' }}>
            Brand Deal Revenue
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6', backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ color: '#475569', fontWeight: 800 }}>ACTIVE CONTRACTS</span>
            <div style={{ backgroundColor: '#f3e8ff', padding: '8px', borderRadius: '10px' }}>
              <Award size={18} color="#6d28d9" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#6d28d9', margin: '10px 0 4px 0', fontSize: '26px', fontWeight: 800 }}>
            <FormattedNumber value={activeDealsValue} prefix="₹" />
          </div>
          <span className="stat-trend" style={{ color: '#7c3aed', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px' }}>
            {activeDeals.length} Active Sponsorships
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ec4899', backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ color: '#475569', fontWeight: 800 }}>SUBSCRIPTIONS</span>
            <div style={{ backgroundColor: '#fce7f3', padding: '8px', borderRadius: '10px' }}>
              <CreditCard size={18} color="#be185d" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#be185d', margin: '10px 0 4px 0', fontSize: '26px', fontWeight: 800 }}>
            <FormattedNumber value={subRev} prefix="₹" />
          </div>
          <span className="stat-trend" style={{ color: '#db2777', backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px' }}>
            Recurring Memberships
          </span>
        </div>
      </div>

      {/* CHARTS & BREAKDOWN SECTION */}
      <div className="dashboard-layout">
        {/* Earnings Breakdown by Source */}
        <div className="section-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#d1fae5', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <PieChart size={18} color="#047857" />
                </div>
                <span>Earnings Breakdown by Source</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
                Revenue stream share distribution across all channels
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {sourceBreakdown && sourceBreakdown.length > 0 ? (
              sourceBreakdown.map((item, idx) => {
                const color = palette[idx % palette.length];
                return (
                  <div key={item.source} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, display: 'inline-block', boxShadow: `0 0 6px ${color}66` }}></span>
                        {item.source}
                      </span>
                      <span style={{ color: '#047857' }}>
                        <FormattedNumber value={item.amount} prefix="₹" /> <span style={{ color: '#64748b', fontWeight: 600 }}>({item.percentage}%)</span>
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(item.percentage, 100)}%`, height: '100%', backgroundColor: color, borderRadius: '9999px', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0', fontSize: '13px', fontWeight: 500 }}>
                No revenue breakdown data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue Trajectory Chart */}
        <div className="section-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#dbeafe', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <BarChart3 size={18} color="#1d4ed8" />
                </div>
                <span>Monthly Revenue Trajectory</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
                Historical monthly earnings aggregation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '180px', paddingTop: '20px', borderBottom: '1px solid #e2e8f0' }}>
            {(revenueSummary?.monthly_revenue || []).length > 0 ? (
              (revenueSummary?.monthly_revenue || []).map((mItem) => {
                const maxVal = Math.max(...(revenueSummary?.monthly_revenue || []).map(x => x.amount), 1);
                const heightPct = Math.max(Math.round((mItem.amount / maxVal) * 100), 16);

                return (
                  <div key={`${mItem.month}-${mItem.year}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
                      <FormattedNumber value={mItem.amount} prefix="₹" />
                    </span>
                    <div style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.4s ease',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
                    }} title={`${mItem.month} ${mItem.year}: ₹${mItem.amount}`} />
                    <span style={{ fontSize: '11px', color: '#475569', marginTop: '8px', fontWeight: 700 }}>
                      {mItem.month}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ width: '100%', textAlign: 'center', color: '#64748b', alignSelf: 'center', fontSize: '13px' }}>
                No monthly revenue trend items available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SPONSORSHIP MANAGEMENT TABLE */}
      <div className="section-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ backgroundColor: '#dbeafe', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <Briefcase size={20} color="#1d4ed8" />
              </div>
              <span>Sponsorship Deals Manager ({filteredSponsorships.length})</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
              Track active brand contracts, deal terms, and payment releases
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #cbd5e1' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search deals..."
                value={sponsorshipSearchQuery}
                onChange={(e) => setSponsorshipSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 600, color: '#0f172a', width: '130px' }}
              />
            </div>

            {/* Status Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #cbd5e1' }}>
              <Filter size={14} color="#64748b" />
              <select
                style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
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
                style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              >
                <option value="All">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <button
              onClick={onAddSponsorship}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={14} /> Add Deal
            </button>
          </div>
        </div>

        <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="simple-table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Brand Partner" columnKey="brand_name" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Campaign Title" columnKey="campaign_name" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Contract Value" columnKey="contract_value" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Start Date" columnKey="start_date" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="End Date" columnKey="end_date" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Deal Status" columnKey="status" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <SortHeader label="Payment Status" columnKey="payment_status" sortConfig={sponsorshipSortConfig} onSort={requestSponsorshipSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody key={sponsorshipPage} className="animate-fade-in">
              {paginatedSponsorships && paginatedSponsorships.length > 0 ? (
                paginatedSponsorships.map((sp) => {
                  const sBadge = getStatusBadge(sp.status);
                  const pBadge = getPaymentBadge(sp.payment_status);

                  return (
                    <tr key={sp.id} style={{ transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>#{sp.id}</td>
                      <td style={{ padding: '14px 18px' }}><strong style={{ color: '#0f172a', fontWeight: 800 }}>{sp.brand_name}</strong></td>
                      <td style={{ padding: '14px 18px', color: '#334155' }}>{sp.campaign_name}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                        <FormattedCurrency value={sp.contract_value || sp.amount || 0} />
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>{sp.start_date || 'N/A'}</td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>{sp.end_date || 'Ongoing'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          backgroundColor: sBadge.bg,
                          color: sBadge.color,
                          border: `1px solid ${sBadge.border}`,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-block'
                        }}>
                          {sBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          backgroundColor: pBadge.bg,
                          color: pBadge.color,
                          border: `1px solid ${pBadge.border}`,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-block'
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
                      description="Create contract records to track campaign deliverables and payout milestones."
                      actionLabel="+ Add Sponsorship Deal"
                      onAction={onAddSponsorship}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={sponsorshipPage}
          totalPages={totalSponsorshipPages}
          pageSize={sponsorshipPageSize}
          totalItems={sortedSponsorships.length}
          onPageChange={setSponsorshipPage}
          onPageSizeChange={(newSize) => { setSponsorshipPageSize(newSize); setSponsorshipPage(1); }}
        />
      </div>

      {/* REVENUE TRANSACTIONS LOG TABLE */}
      <div className="section-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ backgroundColor: '#d1fae5', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <DollarSign size={20} color="#047857" />
              </div>
              <span>Revenue Transactions Log ({filteredRevenues.length})</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
              Historical income transactions across all revenue sources
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #cbd5e1' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search income..."
                value={revenueSearchQuery}
                onChange={(e) => setRevenueSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 600, color: '#0f172a', width: '130px' }}
              />
            </div>

            {/* Source Stream Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #cbd5e1' }}>
              <Filter size={14} color="#64748b" />
              <select
                style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
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

            <button
              onClick={onAddRevenue}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={14} /> Add Revenue
            </button>
          </div>
        </div>

        <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="simple-table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <SortHeader label="ID" columnKey="id" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Date" columnKey="date" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Source Stream" columnKey="source" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Description" columnKey="description" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Amount (₹)" columnKey="amount" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <SortHeader label="Currency" columnKey="currency" sortConfig={revenueSortConfig} onSort={requestRevenueSort} />
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody key={revenuePage} className="animate-fade-in">
              {paginatedRevenues && paginatedRevenues.length > 0 ? (
                paginatedRevenues.map((rev) => (
                  <tr key={rev.id} style={{ transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>#{rev.id}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>{rev.date || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {rev.source}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>{rev.description || 'N/A'}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#047857', fontSize: '14px' }}>
                      <FormattedCurrency value={rev.amount} />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        INR
                      </span>
                    </td>
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

        <Pagination
          currentPage={revenuePage}
          totalPages={totalRevenuePages}
          pageSize={revenuePageSize}
          totalItems={sortedRevenues.length}
          onPageChange={setRevenuePage}
          onPageSizeChange={(newSize) => { setRevenuePageSize(newSize); setRevenuePage(1); }}
        />
      </div>
    </div>
  );
}
