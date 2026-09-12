const PLATFORMS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
]

export default function PlatformSelector({ value, onChange }) {
  return (
    <select
      className="platform-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {PLATFORMS.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </select>
  )
}
