import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);

  const loadNotifs = () => {
    getNotifications(8).then(res => setNotifs(res.data));
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleRead = (id) => {
    markNotificationRead(id).then(() => loadNotifs());
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifications & Performance Alerts</h2>
        <p className="text-gray-500 text-sm">System updates, milestone triggers, and revenue alerts.</p>
      </div>

      <div className="space-y-4">
        {notifs.length > 0 ? (
          notifs.map((n) => (
            <div 
              key={n.id} 
              className={`p-5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.is_read ? 'bg-white border-gray-200 opacity-75' : 'bg-sky-50/60 border-sky-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg mt-0.5 ${n.is_read ? 'bg-gray-100 text-gray-500' : 'bg-sky-600 text-white'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-semibold capitalize">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleRead(n.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Read
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-xl text-gray-400">
            No notifications logged for Creator #8.
          </div>
        )}
      </div>
    </div>
  );
}