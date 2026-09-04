/**
 * StatCard - accepts `icon` as a Lucide React element (ReactNode).
 * Example: <StatCard label="Views" value={1200} icon={<Eye size={22} />} color="blue" />
 */
export default function StatCard({ label, value, icon, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
  };

  const formatValue = (v) => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "string") return v; // already formatted (e.g. "3.20%")
    if (typeof v === "number") {
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
      return v.toLocaleString();
    }
    return String(v);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      {icon && (
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            colorMap[color] || colorMap.indigo
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{formatValue(value)}</p>
      </div>
    </div>
  );
}
