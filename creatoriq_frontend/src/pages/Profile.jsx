import { useState } from "react";

function Profile() {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    name: "Creator",
    email: "creator@example.com",
    notifications: true,
    emailAlerts: true,
    performanceAlerts: true,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Account</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Profile & Settings</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Manage your CreatorIQ profile and dashboard preferences.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Active account
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="dashboard-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Profile Information</h2>
              <p className="mt-1 text-sm text-slate-500">Your account information.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input id="name" name="name" value={settings.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100" />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" value={settings.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100" />
              </div>
            </div>
          </div>

          <div className="dashboard-panel dashboard-panel-violet">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Notification Preferences</h2>
              <p className="mt-1 text-sm text-slate-500">Choose which notifications you want to receive.</p>
            </div>

            <div className="space-y-5">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div>
                  <p className="font-medium text-slate-800">Notifications</p>
                  <p className="text-sm text-slate-500">Enable CreatorIQ notifications.</p>
                </div>
                <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} className="h-5 w-5 accent-violet-600" />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div>
                  <p className="font-medium text-slate-800">Email Alerts</p>
                  <p className="text-sm text-slate-500">Receive important alerts through email.</p>
                </div>
                <input type="checkbox" name="emailAlerts" checked={settings.emailAlerts} onChange={handleChange} className="h-5 w-5 accent-violet-600" />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div>
                  <p className="font-medium text-slate-800">Performance Alerts</p>
                  <p className="text-sm text-slate-500">Receive alerts when content performance changes.</p>
                </div>
                <input type="checkbox" name="performanceAlerts" checked={settings.performanceAlerts} onChange={handleChange} className="h-5 w-5 accent-violet-600" />
              </label>
            </div>
          </div>

          <div className="dashboard-panel">
            <h2 className="text-xl font-semibold text-slate-800">Account</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Dashboard</p>
                <p className="mt-1 font-semibold text-slate-800">CreatorIQ</p>
              </div>

              <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">API Status</p>
                <p className="mt-1 font-semibold text-emerald-700">Connected</p>
              </div>

              <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Account Status</p>
                <p className="mt-1 font-semibold text-emerald-700">Active</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            {saved && <p className="text-sm font-medium text-emerald-600">Settings saved successfully.</p>}
            <button type="submit" className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
