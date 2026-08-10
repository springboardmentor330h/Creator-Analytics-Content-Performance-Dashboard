import { Globe, ShieldCheck, CheckCircle2 } from 'lucide-react'

const platforms = [
  {
    name: 'YouTube',
    category: 'Video & Shorts',
    color: 'bg-red-50 border-red-200 text-red-700',
    description: 'Track long-form video metrics, Shorts velocity, subscriber growth, and watch time.',
  },
  {
    name: 'Instagram',
    category: 'Reels & Posts',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    description: 'Monitor Reels reach, story interactions, profile visits, and follower engagement.',
  },
  {
    name: 'TikTok',
    category: 'Short-Form Video',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    description: 'Analyze view trends, completion rates, sound usage, and viral post velocity.',
  },
  {
    name: 'Facebook',
    category: 'Page Analytics',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    description: 'Track page reach, video impressions, link clicks, and audience demographic breakdown.',
  },
  {
    name: 'X (Twitter)',
    category: 'Posts & Threads',
    color: 'bg-slate-100 border-slate-200 text-slate-800',
    description: 'Measure impression counts, quote retweets, thread engagement, and link clicks.',
  },
  {
    name: 'LinkedIn',
    category: 'Professional Content',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    description: 'Monitor B2B post impressions, reaction rates, article reads, and industry reach.',
  },
]

export default function PlatformSection() {
  return (
    <section id="platforms" className="border-t border-slate-200/80 bg-slate-50/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            Multi-Platform Integration
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            One dashboard. Multiple platforms.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Unify your content metrics across all major social networks without switching tabs.
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-200 hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${platform.color}`}>
                  {platform.name}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {platform.category}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                {platform.name} Analytics
              </h3>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {platform.description}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Synchronized
                </span>
                <span>Real-Time Ingestion</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
