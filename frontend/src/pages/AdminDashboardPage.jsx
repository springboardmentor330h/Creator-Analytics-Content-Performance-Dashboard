import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/api';
import { Users, ShieldCheck, Briefcase, BarChart3, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setUsers(list);
      })
      .catch((err) => {
        console.error('Failed to fetch users for admin dashboard:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = users.length;
  const creatorCount = users.filter((person) => String(person.role || '').toLowerCase().includes('creator')).length;
  const agencyCount = users.filter((person) => String(person.role || '').toLowerCase().includes('agency')).length;
  const marketingCount = users.filter((person) => String(person.role || '').toLowerCase().includes('marketing')).length;
  const adminCount = users.filter((person) => String(person.role || '').toLowerCase().includes('admin')).length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Creators', value: creatorCount, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Agencies', value: agencyCount, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Admins', value: adminCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.full_name || user?.name || 'Administrator'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Workspace Users</h3>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" /> Live roster
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500 font-medium">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{person.full_name || person.name || 'Unnamed User'}</td>
                      <td className="px-6 py-4">{person.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800 uppercase">
                          {person.role || 'User'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
