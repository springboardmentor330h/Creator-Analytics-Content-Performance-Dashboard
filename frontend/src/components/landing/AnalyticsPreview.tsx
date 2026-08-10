import { CheckCircle2, TrendingUp, BarChart2, Eye, ThumbsUp, MessageSquare, Share2, Layers } from 'lucide-react'

export default function AnalyticsPreview() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Heading, Description, Bullets */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-100">
              Dashboard Showcase
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight leading-[1.15]">
              Know exactly what content works.
            </h2>

            <p className="text-base sm:text-lg leading-relaxed text-slate-600">
              Identify your top-performing content and understand which metrics drive engagement.
            </p>

            <ul className="space-y-3.5 pt-2">
              {[
                { title: 'Performance tracking', desc: 'Real-time velocity & view counters' },
                { title: 'Engagement analysis', desc: 'Deep dive into comment, like, and share ratios' },
                { title: 'Content comparison', desc: 'Side-by-side benchmark of up to 5 posts' },
                { title: 'Top-performing content', desc: 'Automated ranking algorithms' },
              ].map((bullet) => (
                <li key={bullet.title} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{bullet.title}</h4>
                    <p className="text-xs text-slate-500">{bullet.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Detailed Flat Analytics UI Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 sm:p-6 shadow-xl shadow-slate-900/5">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-100">
                      Content Analytics
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">• 8 Metrics Tracked</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">Channel Performance Dashboard</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                    <Layers className="h-3.5 w-3.5 text-brand-600" />
                    All Platforms
                  </span>
                </div>
              </div>

              {/* 6 Key Metrics Grid (Views, Likes, Comments, Shares, Reach, Engagement Rate) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Views</span>
                  <p className="mt-1 text-base font-extrabold text-slate-900">4,280,100</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Likes</span>
                  <p className="mt-1 text-base font-extrabold text-slate-900">312,450</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Comments</span>
                  <p className="mt-1 text-base font-extrabold text-slate-900">38,120</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Shares</span>
                  <p className="mt-1 text-base font-extrabold text-slate-900">24,800</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reach</span>
                  <p className="mt-1 text-base font-extrabold text-slate-900">8,190,000</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Engagement Rate</span>
                  <p className="mt-1 text-base font-extrabold text-emerald-600">8.82%</p>
                </div>
              </div>

              {/* Performance Chart & Content Table */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Engagement Velocity Breakdown</span>
                  <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-[10px]">Real-Time Data</span>
                </div>

                {/* Simplified Bar Chart */}
                <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 border-b border-slate-100 pb-2">
                  {[45, 65, 80, 50, 95, 70, 88].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-brand-600 to-indigo-500 transition-all duration-300 group-hover:from-brand-500 group-hover:to-purple-500"
                      />
                      <span className="text-[9px] font-semibold text-slate-400">Day {i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Content Table Snippet */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                        <th className="py-2">Content Title</th>
                        <th className="py-2">Platform</th>
                        <th className="py-2 text-right">Views</th>
                        <th className="py-2 text-right">Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      <tr>
                        <td className="py-2 font-bold text-slate-900 truncate max-w-[160px]">SaaS UI/UX Design System 2026</td>
                        <td className="py-2 text-red-600 font-bold text-[10px]">YouTube</td>
                        <td className="py-2 text-right">1,240,000</td>
                        <td className="py-2 text-right text-emerald-600 font-bold">10.2%</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-slate-900 truncate max-w-[160px]">10 Productivity Hacks</td>
                        <td className="py-2 text-cyan-600 font-bold text-[10px]">TikTok</td>
                        <td className="py-2 text-right">2,890,000</td>
                        <td className="py-2 text-right text-emerald-600 font-bold">13.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
