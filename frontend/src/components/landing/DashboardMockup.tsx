import { useEffect, useState, useRef } from 'react'
import {
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Activity,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react'

// Custom counter hook for animated number count up
function useCounter(endValue: number, duration: number = 1500, trigger: boolean = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCount(endValue)
      return
    }

    let startTime: number | null = null
    let animationFrameId: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOutProgress * endValue))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount)
      } else {
        setCount(endValue)
      }
    }

    animationFrameId = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrameId)
  }, [endValue, duration, trigger])

  return count
}

export default function DashboardMockup() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // KPI count targets
  const views = useCounter(5842910, 1400, isVisible)
  const likes = useCounter(418250, 1400, isVisible)
  const comments = useCounter(42890, 1400, isVisible)
  const shares = useCounter(31400, 1400, isVisible)

  return (
    <div
      ref={containerRef}
      className={`relative w-full transition-all duration-700 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-5'
      }`}
    >
      {/* Outer Glow Backdrop */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/20 via-purple-500/15 to-indigo-500/20 blur-xl opacity-70" />

      {/* Main Container Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10">
        {/* Mockup Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              CreatorIQ Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live API Sync
            </span>
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Last 30 Days</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-5 space-y-4 bg-white">
          {/* Top Banner KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* KPI 1: Views */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/20 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Views</span>
                <div className="rounded-lg bg-indigo-50 p-1 text-brand-600">
                  <Eye className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {views.toLocaleString()}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="h-3 w-3" /> +18.4%
              </span>
            </div>

            {/* KPI 2: Likes */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/20 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Likes</span>
                <div className="rounded-lg bg-pink-50 p-1 text-pink-600">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {likes.toLocaleString()}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="h-3 w-3" /> +12.1%
              </span>
            </div>

            {/* KPI 3: Comments */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/20 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Comments</span>
                <div className="rounded-lg bg-cyan-50 p-1 text-cyan-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {comments.toLocaleString()}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="h-3 w-3" /> +9.5%
              </span>
            </div>

            {/* KPI 4: Shares */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/20 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Shares</span>
                <div className="rounded-lg bg-amber-50 p-1 text-amber-600">
                  <Share2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {shares.toLocaleString()}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="h-3 w-3" /> +14.2%
              </span>
            </div>

            {/* KPI 5: Engagement Rate */}
            <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/20 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Engagement</span>
                <div className="rounded-lg bg-emerald-50 p-1 text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                8.45%
              </p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="h-3 w-3" /> +2.1%
              </span>
            </div>
          </div>

          {/* Performance Chart Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Multi-Channel Growth Trend</h4>
                <p className="text-[11px] text-slate-500">Real-time daily view velocity across social platforms</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  YouTube
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                  Instagram
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  TikTok
                </span>
              </div>
            </div>

            {/* SVG Interactive Chart Representation */}
            <div className="relative h-28 sm:h-32 w-full pt-4">
              <svg viewBox="0 0 500 180" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="170" x2="500" y2="170" stroke="#e2e8f0" />

                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Under YouTube Curve */}
                <path
                  d="M0,140 Q75,100 150,110 T300,50 T450,30 L500,20 L500,170 L0,170 Z"
                  fill="url(#purpleGradient)"
                />

                {/* YouTube Line (Brand Purple) */}
                <path
                  d="M0,140 Q75,100 150,110 T300,50 T450,30 L500,20"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={isVisible ? 'animate-fade-in' : ''}
                />

                {/* Instagram Line (Pink) */}
                <path
                  d="M0,155 Q80,130 160,135 T310,90 T440,65 L500,55"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                />

                {/* TikTok Line (Cyan) */}
                <path
                  d="M0,165 Q90,145 170,120 T320,80 T460,40 L500,35"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Active Data Point highlight */}
                <circle cx="300" cy="50" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" className="shadow-md" />
                <circle cx="450" cy="30" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* X Axis Labels */}
              <div className="mt-4 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>

          {/* Top Content Row Preview */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-900">Top Performing Content</span>
              <span className="text-[11px] font-bold text-brand-600 cursor-pointer hover:underline">View All →</span>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white p-3 border border-slate-200/60 text-sm shadow-xs hover:border-brand-200 hover:shadow-sm transition-all gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-xs font-extrabold shrink-0">
                    YouTube
                  </span>
                  <span className="font-bold text-slate-800 truncate">10 AI Tools Transforming Content Creation</span>
                </div>
                <div className="flex items-center gap-5 shrink-0 font-bold text-slate-600">
                  <span>1.8M views</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">9.4% ER</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white p-3 border border-slate-200/60 text-sm shadow-xs hover:border-brand-200 hover:shadow-sm transition-all gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="rounded-full bg-pink-100 text-pink-700 px-2.5 py-1 text-xs font-extrabold shrink-0">
                    Instagram
                  </span>
                  <span className="font-bold text-slate-800 truncate">Behind the Scenes: Production Studio Workflow</span>
                </div>
                <div className="flex items-center gap-5 shrink-0 font-bold text-slate-600">
                  <span>842K views</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">11.2% ER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
