import { Link } from 'react-router-dom'
import { ArrowRight, Play, CheckCircle2, Users, ShieldCheck, Zap } from 'lucide-react'
import DashboardMockup from './DashboardMockup'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Barely Visible Decorative Radial Background Elements */}
      <div className="pointer-events-none absolute top-0 right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-brand-100/40 to-violet-100/30 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-10 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-indigo-50/50 to-purple-50/40 blur-3xl opacity-50" />
      
      {/* Subtle Dot Grid Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" 
      />

      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* LEFT Column: Content & Calls to Action */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Small Trust Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/80 px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-xs">
              <Users className="h-3.5 w-3.5 text-brand-600" />
              <span>Trusted by 15K+ Creators & Agencies</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Creator Analytics <br />
              <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-normal max-w-xl">
              Track content performance, understand your audience, and grow your brand with powerful analytics built for creators, agencies, and marketing teams.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="ciq-btn-primary px-7 py-3.5 text-sm font-bold group shadow-md hover:shadow-lg transition-all"
              >
                <span>Start Free Workspace</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#demo"
                className="ciq-btn-secondary px-7 py-3.5 text-sm font-bold text-slate-700 hover:text-brand-600 hover:border-brand-200"
              >
                <Play className="h-3.5 w-3.5 text-brand-600 fill-brand-600 mr-1" />
                <span>View Live Demo</span>
              </a>
            </div>

            {/* Trust Points Under Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Secure & Private by Design</span>
              </div>
            </div>

          </div>

          {/* RIGHT Column: Flat Analytics Dashboard Mockup */}
          <div className="lg:col-span-8">
            <DashboardMockup />
          </div>

        </div>
      </div>
    </section>
  )
}
