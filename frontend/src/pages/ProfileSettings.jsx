import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  User,
  Mail,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Settings,
} from "lucide-react";

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setStatus({
      type: "",
      message: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setStatus({
      type: "",
      message: "",
    });

    try {
      const response = await api.put(`/users/${user.id}`, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        bio: form.bio.trim() || null,
      });

      updateUser(response.data);

      setStatus({
        type: "success",
        message: "Profile updated successfully.",
      });
    } catch (error) {
      const detail = error.response?.data?.detail;

      setStatus({
        type: "error",
        message: Array.isArray(detail)
          ? detail.map((item) => item.msg).join(" ")
          : detail || "Unable to update your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = (user.full_name || user.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page Header */}
      <div>
        <p className="text-sm font-medium text-brand-600">
          Account
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
          Profile & Settings
        </h1>

        <p className="text-slate-500 mt-1">
          Manage your CreatorIQ profile and account information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Summary */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-fit">

          <div className="flex items-center gap-4">

            <div className="h-16 w-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold shadow-sm">
              {initials}
            </div>

            <div className="min-w-0">

              <h2 className="font-semibold text-slate-900 truncate">
                {user.full_name || "Creator"}
              </h2>

              <p className="text-sm text-slate-500 truncate">
                {user.email}
              </p>

            </div>
          </div>

          <div className="mt-6 space-y-3">

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

              <span className="text-sm text-slate-500 flex items-center gap-2">
                <ShieldCheck size={16} />
                Role
              </span>

              <span className="text-sm font-semibold text-slate-800 capitalize">
                {String(user.role || "creator")
                  .toLowerCase()
                  .replaceAll("_", " ")}
              </span>

            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

              <span className="text-sm text-slate-500 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Account
              </span>

              <span className="text-sm font-semibold text-emerald-600">
                {user.is_active ? "Active" : "Inactive"}
              </span>

            </div>

          </div>
        </section>

        {/* Account Form */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Settings size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Account information
              </h2>

              <p className="text-sm text-slate-500">
                Keep your creator details up to date.
              </p>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >

            {/* Status */}
            {status.message && (
              <div
                className={`rounded-xl border px-4 py-3 flex items-start gap-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >

                {status.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}

                <span>{status.message}</span>

              </div>
            )}

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <label className="block">

                <span className="text-sm font-medium text-slate-700">
                  Full name
                </span>

                <div className="relative mt-2">

                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />

                </div>

              </label>

              <label className="block">

                <span className="text-sm font-medium text-slate-700">
                  Email address
                </span>

                <div className="relative mt-2">

                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />

                </div>

              </label>

            </div>

            {/* Bio */}
            <label className="block">

              <span className="text-sm font-medium text-slate-700">
                Bio
              </span>

              <div className="relative mt-2">

                <FileText
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  placeholder="Tell your audience a little about yourself..."
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />

              </div>

              <span className="text-xs text-slate-400 mt-1 block text-right">
                {form.bio.length}/500
              </span>

            </label>

            {/* Save */}
            <div className="flex justify-end pt-2">

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >

                <Save size={17} />

                {saving ? "Saving..." : "Save changes"}

              </button>

            </div>

          </form>

        </section>

      </div>
    </div>
  );
}