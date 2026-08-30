export default function PlatformSelect({ platforms = [], value, onChange, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs text-slate-400 block mb-1">Platform</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm min-w-[160px]"
      >
        <option value="All">All Platforms</option>
        {platforms.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  )
}
