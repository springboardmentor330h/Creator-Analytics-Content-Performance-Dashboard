export default function PlatformSelector({ platforms, selected, onChange }) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      <option value="">All Platforms</option>
      {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
    </select>
  );
}