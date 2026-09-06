import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../services/api";

function Profile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setSettings({
      name: user.full_name || "",
      email: user.email || "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setError("Unable to identify the current account.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await updateUser(user.id, {
        full_name: settings.name,
        email: settings.email,
      });

      const updatedUser = response?.data || response;

      setSettings((previous) => ({
        ...previous,
        name: updatedUser.full_name || previous.name,
        email: updatedUser.email || previous.email,
      }));
      setSaved(true);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.detail || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
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

        {error && (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

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

          <div className="dashboard-panel">
            <h2 className="text-xl font-semibold text-slate-800">Account</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Dashboard</p>
                <p className="mt-1 font-semibold text-slate-800">{user?.role || "Creator"}</p>
              </div>

              <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">API Status</p>
                <p className="mt-1 font-semibold text-emerald-700">{user ? "Connected" : "Unavailable"}</p>
              </div>

              <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Account Status</p>
                <p className="mt-1 font-semibold text-emerald-700">{user ? "Active" : "Unavailable"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            {saved && <p className="text-sm font-medium text-emerald-600">Settings saved successfully.</p>}
            <button type="submit" disabled={saving || !user} className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
