export default function Card({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {Icon && <Icon size={18} className="text-brand-500" />}
      </div>
      <p className="text-2xl font-semibold text-slate-800 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
