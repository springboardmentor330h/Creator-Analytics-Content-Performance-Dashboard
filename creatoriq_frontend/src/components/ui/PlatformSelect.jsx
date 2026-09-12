export default function PlatformSelect({ platforms = [], value, onChange, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-500 block mb-1 dark:text-slate-400">Platform</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 cursor-pointer"
      >
        <option value="All">All Platforms</option>
        {platforms.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  )
}
