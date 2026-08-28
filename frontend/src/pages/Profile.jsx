import { useEffect, useState } from "react";
import api from "../api/axios";

function Profile() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");

        setUser(response.data);
        setName(response.data.full_name || "");
        setEmail(response.data.email || "");
        setRole(response.data.role || "");
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await api.put(`/users/${user.id}`, {
        full_name: name,
        email: email,
      });

      const updatedUser = response.data.data;

      setUser(updatedUser);
      setName(updatedUser.full_name);
      setEmail(updatedUser.email);
      setRole(updatedUser.role);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Profile & Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your creator profile and account settings.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          Profile Information
        </h2>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
            />
          </div>

          {/* Account Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Account Role
            </label>

            <input
              type="text"
              value={role}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {saved && (
            <p className="text-sm font-medium text-green-600">
              Profile changes saved successfully.
            </p>
          )}

        </form>
      </div>
    </div>
  );
}

export default Profile;