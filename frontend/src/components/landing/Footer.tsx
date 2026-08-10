import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-14 text-xs text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5 mb-12">
          
          {/* Brand Info Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold shadow-sm">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  CreatorIQ
                </span>
                <span className="text-[10px] font-semibold text-brand-600 tracking-wide leading-none">
                  Analytics & Intelligence
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Empowering creators, agencies, and marketing teams with real-time multi-platform content performance metrics and growth analytics.
            </p>

            <div className="flex items-center gap-4 text-slate-400 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-600 transition-colors"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-600 transition-colors"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-600 transition-colors"
                aria-label="YouTube"
              >
                YouTube
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">
              Product
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Features</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Content Analytics</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Audience Analytics</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Growth Tracking</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Revenue Analytics</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">
              Company
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li><a href="#about" className="hover:text-brand-600 transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-brand-600 transition-colors">Contact</a></li>
              <li><a href="#careers" className="hover:text-brand-600 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Resources & Legal Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">
              Resources & Legal
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li><a href="#docs" className="hover:text-brand-600 transition-colors">Documentation</a></li>
              <li><a href="#help" className="hover:text-brand-600 transition-colors">Help Center</a></li>
              <li><a href="#blog" className="hover:text-brand-600 transition-colors">Blog</a></li>
              <li><a href="#privacy" className="hover:text-brand-600 transition-colors">Privacy</a></li>
              <li><a href="#terms" className="hover:text-brand-600 transition-colors">Terms</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 CreatorIQ. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Operational • Production SaaS Interface</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
