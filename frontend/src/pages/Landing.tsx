import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react'
import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import TrustSection from '../components/landing/TrustSection'
import FeatureSection from '../components/landing/FeatureSection'
import HowItWorks from '../components/landing/HowItWorks'
import AnalyticsPreview from '../components/landing/AnalyticsPreview'
import PlatformSection from '../components/landing/PlatformSection'
import PricingSection from '../components/landing/PricingSection'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'

const DEMO_TABS = [
  { id: 'metrics', label: 'Content Analytics', icon: TrendingUp },
  { id: 'rbac', label: 'RBAC Security Scopes', icon: ShieldCheck },
  { id: 'compare', label: 'Side-by-Side Comparison', icon: Layers },
]

const FAQ_ITEMS = [
  {
    q: 'How does CreatorIQ strictly enforce Role-Based Access Control (RBAC)?',
    a: 'CreatorIQ defines 4 distinct workspace security scopes: Creator, Agency, Marketing Team, and Administrator. Access tokens enforce strict data isolation so users only access content permitted under their assigned role.',
  },
  {
    q: 'What metrics are tracked in the Content Analytics?',
    a: 'The Content Analytics monitors 8 key metrics: Views, Likes, Comments, Shares, Saves, Watch Time, Reach, and Engagement Rate — with real-time trend charts and top-performing reports.',
  },
  {
    q: 'What happens after user registration?',
    a: 'New users are assigned a secure JWT session and directed to the appropriate dashboard based on their designated RBAC role (Creator vs Agency vs Admin).',
  },
  {
    q: 'How does the side-by-side Content Comparison dashboard work?',
    a: 'Users can select up to 5 content items across permitted channels to generate side-by-side bar charts comparing views, engagement, reach, and watch time in real-time.',
  },
  {
    q: 'Can agencies manage multiple creator rosters?',
    a: 'Yes, users with the Agency role can view agency linkage requests, monitor creator rosters, and generate aggregate analytics reports across client accounts.',
  },
]

export default function Landing() {
  const [activeDemoTab, setActiveDemoTab] = useState('metrics')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-600 selection:text-white">
      {/* Sticky White Navbar */}
      <Navbar />

      {/* Hero Section with Realistic Flat Analytics Dashboard Mockup */}
      <HeroSection />

      {/* Trust Platform Bar */}
      <TrustSection />

      {/* Feature Cards Grid (5 Cards with 200ms Micro-Hover) */}
      <FeatureSection />

      {/* How It Works 3-Step Timeline */}
      <HowItWorks />

      {/* Analytics Preview (Visual Match) */}
      <AnalyticsPreview />

      {/* Social Media Platform Integration Matrix */}
      <PlatformSection />

      {/* Interactive Showcase / Live Demo Preview */}
      <section id="demo" className="relative z-10 border-t border-slate-200/80 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-100">
              Interactive Workspace Showcase
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
              Test Live Metric Previews & Scopes
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Switch between tabs to see real-time data ingestion and access security in action.
            </p>
          </div>

          {/* Demo Tab Selector */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {DEMO_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeDemoTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDemoTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Demo Display Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 max-w-4xl mx-auto shadow-lg">
            {activeDemoTab === 'metrics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Live Content Analytics</h3>
                    <p className="text-xs text-slate-500">8 Metrics monitored in real-time across channels.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Data Ingestion
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Views', value: '5,842,910' },
                    { label: 'Likes', value: '418,250' },
                    { label: 'Reach', value: '8,920,400' },
                    { label: 'Engagement Rate', value: '8.45%' },
                  ].map((m) => (
                    <div key={m.label} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemoTab === 'rbac' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Role-Based Access Scopes</h3>
                    <p className="text-xs text-slate-500">4 Security Scopes enforce data isolation.</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-brand-600" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { role: 'Creator Scope', desc: 'Manage personal social content, views, social channel links, and personal dashboard.' },
                    { role: 'Agency Scope', desc: 'View creator roster, agency linkages, creator connection requests, and comparative metrics.' },
                    { role: 'Marketing Team Scope', desc: 'Review performance summaries, campaign aggregations, and multi-platform reach.' },
                    { role: 'Administrator Scope', desc: 'Full system management, user role assignments, audit logs, and system settings.' },
                  ].map((r) => (
                    <div key={r.role} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-extrabold text-brand-600 uppercase">{r.role}</span>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemoTab === 'compare' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Side-by-Side Content Comparison</h3>
                    <p className="text-xs text-slate-500">Benchmark up to 5 posts across channels.</p>
                  </div>
                  <Layers className="h-5 w-5 text-brand-600" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">YouTube</span>
                    <p className="mt-2 font-extrabold text-slate-900 text-sm">10 AI Tools Transforming Content Creation</p>
                    <div className="mt-3 flex justify-between text-xs text-slate-600 font-semibold">
                      <span>Views: 1.8M</span>
                      <span className="text-brand-600 font-bold">Engagement: 9.4%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">TikTok</span>
                    <p className="mt-2 font-extrabold text-slate-900 text-sm">Quick Analytics Hack for Creators #Shorts</p>
                    <div className="mt-3 flex justify-between text-xs text-slate-600 font-semibold">
                      <span>Views: 2.4M</span>
                      <span className="text-brand-600 font-bold">Engagement: 14.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <section id="resources" className="border-t border-slate-200/80 bg-slate-50/50 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
              Frequently Asked Questions
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
              Got questions? We've got answers.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Everything you need to know about the CreatorIQ platform architecture and setup.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-6 text-left text-sm font-extrabold text-slate-900 hover:bg-slate-50/80 transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-brand-600 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-4 bg-slate-50/30">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
