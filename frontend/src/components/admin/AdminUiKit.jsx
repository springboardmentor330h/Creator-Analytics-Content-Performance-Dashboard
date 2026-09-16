import { useState } from "react";
import { AlertTriangle, Crown, Medal, Award } from "lucide-react";

export const formatNumber = (value) => Number(value || 0).toLocaleString();

export const ROLE_STYLES = {
  Administrator: "bg-amber-50 text-amber-700 border-amber-200",
  Creator: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Agency: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Marketing Team": "bg-sky-50 text-sky-700 border-sky-200",
};

export const ROLE_CHART_COLORS = {
  Administrator: "#f59e0b",
  Creator: "#6366f1",
  Agency: "#10b981",
  "Marketing Team": "#0ea5e9",
};

export const ALL_ROLES = ["Creator", "Agency", "Marketing Team", "Administrator"];

const PLATFORM_COLORS = {
  YouTube: "#FF0000",
  Instagram: "#E1306C",
  TikTok: "#111827",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  X: "#000000",
};
export const platformColor = (p) => PLATFORM_COLORS[p] || "#4f46e5";

export function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        ROLE_STYLES[role] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {role}
    </span>
  );
}

export function RankBadge({ rank }) {
  const configs = [
    { icon: Crown, bg: "bg-amber-100", text: "text-amber-600" },
    { icon: Medal, bg: "bg-slate-200", text: "text-slate-600" },
    { icon: Award, bg: "bg-orange-100", text: "text-orange-600" },
  ];
  const cfg = configs[rank] || { icon: null, bg: "bg-slate-50", text: "text-slate-400" };
  const Icon = cfg.icon;

  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${cfg.bg} ${cfg.text}`}>
      {Icon ? <Icon size={16} /> : rank + 1}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${danger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastBanner({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg transition-all ${
        toast.type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {toast.message}
    </div>
  );
}

/** Shared toast state so every admin page shows feedback the same way. */
export function useAdminToast() {
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };
  return [toast, showToast];
}
