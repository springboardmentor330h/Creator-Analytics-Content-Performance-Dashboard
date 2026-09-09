import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Play } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-purple-50/40 to-white py-20 lg:py-28 border-t border-slate-200/80">
      {/* Decorative Light Radial Accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-extrabold text-brand-700 shadow-xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          <span>Transform Your Content Strategy Today</span>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-3xl mx-auto">
          Ready to understand your content better?
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bring your content analytics together and make smarter, data-driven decisions.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#635BFF]/25 hover:bg-[#5248E5] hover:shadow-xl hover:shadow-[#635BFF]/35 active:scale-[0.98] transition-all group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-[#635BFF]" />
            <span>Explore Platform</span>
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-600 font-semibold">
          Free 14-day trial • No credit card required • Instant setup
        </p>
      </div>
    </section>
  )
}
