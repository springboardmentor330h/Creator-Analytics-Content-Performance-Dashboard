import React, { useEffect, useState } from 'react';
import { getReportSummary } from '../services/api';
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    getReportSummary(8).then(res => setCreator(res.data.creator));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Creator Profile</h2>
        <p className="text-gray-500 text-sm">Account details associated with Creator #8.</p>
      </div>

      {creator && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 rounded-full bg-sky-600 text-white text-2xl font-bold flex items-center justify-center">
              {creator.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                {creator.role || 'Creator'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span><strong>ID:</strong> #{creator.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span><strong>Email:</strong> {creator.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span><strong>Status:</strong> Active CreatorIQ Account</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}