import SpotlightCard from "./SpotlightCard";

export default function Card({ title, value, subtitle, icon: Icon }) {
  return (
    <SpotlightCard className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-brand-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {Icon && (
          <span className="rounded-lg bg-brand-50 p-1.5 text-brand-500 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-slate-800 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </SpotlightCard>
  );
}
