export default function TrustSection() {
  const platforms = [
    { name: 'YouTube', label: 'YouTube Analytics' },
    { name: 'Instagram', label: 'Instagram Graph' },
    { name: 'TikTok', label: 'TikTok Creator API' },
    { name: 'Meta', label: 'Meta Business' },
    { name: 'Google', label: 'Google Cloud API' },
    { name: 'Amazon', label: 'Amazon Affiliates' },
    { name: 'Spotify', label: 'Spotify Podcasts' },
    { name: 'Microsoft', label: 'Microsoft Ecosystem' },
  ]

  return (
    <section className="border-y border-slate-200/70 bg-slate-50/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
          Trusted by creators and teams analyzing multi-platform data from
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8 items-center justify-items-center opacity-75">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center justify-center p-3 text-slate-500 font-extrabold text-sm hover:text-slate-900 transition-colors group cursor-default"
            >
              <span className="tracking-tight text-slate-600 group-hover:text-brand-600 transition-colors">
                {platform.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
