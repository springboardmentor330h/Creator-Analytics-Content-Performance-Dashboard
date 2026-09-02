export default function KpiCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };
  return (
    <div className="p-5 transition bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-md dark:hover:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}