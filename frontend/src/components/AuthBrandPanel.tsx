import { Link } from 'react-router-dom'
import { BarChart3, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'

export default function AuthBrandPanel({
  title = 'Creator Analytics & Content Performance',
  subtitle = 'Track engagement, reach, and growth across YouTube, Instagram, TikTok, and more — with strict role-based access for your team.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="relative hidden min-h-screen overflow-hidden bg-slate-900 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm transition-transform group-hover:scale-105">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="text-white">CreatorIQ</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-lg my-auto py-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
          System Verified
        </div>

        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 text-base leading-relaxed text-slate-300">
          {subtitle}
        </p>

        {/* Live Metrics Showcase */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: 'Total Views', value: '15.8M', change: '+24.5%', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Avg Engagement', value: '8.4%', change: '+3.2%', icon: Zap, color: 'text-indigo-300' },
            { label: 'Total Reach', value: '19.2M', change: '+18.9%', icon: Users, color: 'text-cyan-300' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{item.label}</p>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-white">{item.value}</p>
              <p className={`mt-1 text-[11px] font-bold ${item.color}`}>{item.change} this month</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Strict JWT Authentication & RBAC</span>
        </div>
        <span>System Active</span>
      </div>
    </div>
  )
}
