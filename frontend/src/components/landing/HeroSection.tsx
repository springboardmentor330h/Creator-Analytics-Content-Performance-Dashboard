import {
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const heroStats = [
  {
    value: '15K+',
    label: 'Creators & Agencies',
    icon: Users,
    iconBg: 'bg-[#F3EFFF]',
    iconColor: 'text-[#635BFF]',
    borderColor: 'border-[#DDD6FE]/40',
  },
  {
    value: '6+',
    label: 'Social Platforms',
    icon: BarChart3,
    iconBg: 'bg-[#E0F2FE]',
    iconColor: 'text-[#0284C7]',
    borderColor: 'border-[#BAE6FD]/40',
  },
  {
    value: 'All-in-One',
    label: 'Analytics Platform',
    icon: Zap,
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
    borderColor: 'border-[#BBF7D0]/40',
  },
  {
    value: 'Data-Driven',
    label: 'Growth & Success',
    icon: Shield,
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#D97706]',
    borderColor: 'border-[#FDE68A]/40',
  },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16">
      {/* Background Soft Glows */}
      <div className="pointer-events-none absolute -top-24 right-1/4 -z-10 h-[520px] w-[520px] rounded-full bg-[#635BFF]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-0 -z-10 h-[360px] w-[460px] rounded-full bg-indigo-50/70 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-[280px] w-[280px] rounded-full bg-purple-50/60 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Hero Grid */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Copy & CTAs */}
          <div className="space-y-6 sm:space-y-7 text-center lg:col-span-6 xl:col-span-5 lg:text-left">
            {/* Top Pill Badge matching reference */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE]/80 bg-[#F3EFFF] px-4 py-1.5 text-xs font-bold text-[#635BFF] shadow-xs">
              <Users className="h-3.5 w-3.5 text-[#635BFF]" />
              <span>Trusted by 15K+ Creators & Agencies</span>
            </div>

            {/* Headline with Project Title */}
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem] leading-[1.02] sm:leading-[0.98] lg:leading-[0.96]">
              CreatorIQ <br />
              <span className="text-[#635BFF]">
                Analytics.
              </span>
            </h1>

            {/* Subtitle matching reference */}
            <p className="mx-auto max-w-xl text-base sm:text-lg font-normal leading-relaxed text-slate-600 lg:mx-0">
              Track content performance, understand your audience, and grow your brand with powerful analytics built for creators, agencies, and marketing teams.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#635BFF]/25 hover:bg-[#5248E5] hover:shadow-xl hover:shadow-[#635BFF]/35 active:scale-[0.98] transition-all duration-200 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-[#635BFF]" />
                <span>Explore Features</span>
              </a>
            </div>

            {/* Micro Social Proof / Trust Bullets */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
                <span>Instant setup</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Hero Illustration & Floating Elements */}
          <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-7">
            {/* Ambient Radial Gradient Behind Illustration */}
            <div className="absolute inset-0 -m-4 sm:-m-8 rounded-3xl bg-gradient-to-tr from-violet-100/40 via-purple-50/20 to-sky-50/30 blur-2xl -z-10" />

            {/* High-Fidelity 3D Visual Container with subtle gentle float */}
            <div className="relative w-full max-w-[560px] xl:max-w-[620px] transition-transform duration-500 hover:scale-[1.015]">
              <img
                src="/hero-illustration@2x.png"
                alt="CreatorIQ Analytics Workspace and Insights"
                className="w-full h-auto object-contain drop-shadow-[0_12px_36px_rgba(99,91,255,0.08)] select-none pointer-events-none"
                width={1130}
                height={830}
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar matching reference (4 columns) */}
        <div className="mt-12 sm:mt-14 lg:mt-16 pt-8 sm:pt-10 border-t border-slate-100/80">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:divide-x lg:divide-slate-100">
            {heroStats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={stat.value}
                  className={`flex items-center gap-3.5 sm:gap-4 p-2 sm:p-3 rounded-2xl transition-all duration-200 hover:bg-slate-50/80 group ${
                    index > 0 ? 'lg:pl-8' : ''
                  }`}
                >
                  {/* Icon Circle */}
                  <div
                    className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor} border ${stat.borderColor} shadow-xs transition-transform duration-200 group-hover:scale-105`}
                  >
                    <StatIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  {/* Stat Text */}
                  <div className="text-left min-w-0">
                    <span className="block text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-[#635BFF] transition-colors truncate">
                      {stat.value}
                    </span>
                    <span className="block text-xs sm:text-sm font-semibold text-slate-500 truncate">
                      {stat.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
