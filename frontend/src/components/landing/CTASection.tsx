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
            className="ciq-btn-primary px-8 py-4 text-sm font-bold group shadow-md hover:shadow-lg transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#demo"
            className="ciq-btn-secondary px-8 py-4 text-sm font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300"
          >
            <Play className="h-3.5 w-3.5 text-brand-600 fill-brand-600 mr-1" />
            <span>View Demo</span>
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-600 font-semibold">
          Free 14-day trial • No credit card required • Instant setup
        </p>
      </div>
    </section>
  )
}
