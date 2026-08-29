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

    // Frontend-only for now.
    // Connect this to the existing user/profile API
    // when authentication/profile integration is completed.
    setSaved(true);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Profile & Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your CreatorIQ profile and dashboard preferences.
        </p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Profile Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your account information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                value={settings.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Notification Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose which notifications you want to receive.
            </p>
          </div>

          <div className="space-y-5">
            {/* Notifications */}
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">
                  Notifications
                </p>

                <p className="text-sm text-slate-500">
                  Enable CreatorIQ notifications.
                </p>
              </div>

              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className="h-5 w-5"
              />
            </label>

            {/* Email Alerts */}
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">
                  Email Alerts
                </p>

                <p className="text-sm text-slate-500">
                  Receive important alerts through email.
                </p>
              </div>

              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleChange}
                className="h-5 w-5"
              />
            </label>

            {/* Performance Alerts */}
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">
                  Performance Alerts
                </p>

                <p className="text-sm text-slate-500">
                  Receive alerts when content performance changes.
                </p>
              </div>

              <input
                type="checkbox"
                name="performanceAlerts"
                checked={settings.performanceAlerts}
                onChange={handleChange}
                className="h-5 w-5"
              />
            </label>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Account
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Dashboard
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                CreatorIQ
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                API Status
              </p>

              <p className="mt-1 font-semibold text-green-600">
                Connected
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Account Status
              </p>

              <p className="mt-1 font-semibold text-green-600">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <p className="text-sm font-medium text-green-600">
              Settings saved successfully.
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;

