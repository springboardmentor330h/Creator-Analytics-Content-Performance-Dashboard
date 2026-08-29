import React from 'react';
import { getPdfReportUrl, getExcelReportUrl } from '../services/api';
import { FileText, Download, Table } from 'lucide-react';

export default function ReportsPage({ user }) {
  const creatorId = user?.id ?? user?.user_id ?? 1;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Export</h2>
        <p className="text-gray-500 text-sm">Download aggregated performance, revenue, and audience reports directly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <FileText className="w-8 h-8" />
            <h3 className="text-lg font-bold text-gray-900">Executive PDF Report</h3>
          </div>
          <p className="text-sm text-gray-600">
            Includes executive KPI summaries, content performance metrics, and total direct/sponsorship revenue streams.
          </p>
          <a
            href={getPdfReportUrl(creatorId)}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <Table className="w-8 h-8" />
            <h3 className="text-lg font-bold text-gray-900">Multi-Sheet Excel Workbook</h3>
          </div>
          <p className="text-sm text-gray-600">
            Export separate Excel sheets for Content Analytics, Revenue, Audience Demographics, and Growth Trends.
          </p>
          <a
            href={getExcelReportUrl(creatorId)}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Excel (.xlsx)
          </a>
        </div>
      </div>
    </div>
  );
}