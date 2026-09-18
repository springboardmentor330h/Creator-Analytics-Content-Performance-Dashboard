function KPICard({ title, value, change, icon }) {
  const isPositive = change?.startsWith("+");

  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-purple-500/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {title}
        </p>

        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            {icon}
          </div>
        )}
      </div>

      <h3 className="mt-3 text-2xl font-semibold text-white">
        {value}
      </h3>

      {change && (
        <p
          className={`mt-2 text-xs font-medium ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}

export default KPICard;