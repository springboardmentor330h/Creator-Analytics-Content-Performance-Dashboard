import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import TrustSection from '../components/landing/TrustSection'
import FeatureSection from '../components/landing/FeatureSection'
import HowItWorks from '../components/landing/HowItWorks'
import PlatformSection from '../components/landing/PlatformSection'
import PricingSection from '../components/landing/PricingSection'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'

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
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-600 selection:text-white">
      {/* Sticky White Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Trust Platform Bar */}
      <TrustSection />

      {/* Feature Cards Grid (5 Cards with 200ms Micro-Hover) */}
      <FeatureSection />

      {/* How It Works 3-Step Timeline */}
      <HowItWorks />

      {/* Social Media Platform Integration Matrix */}
      <PlatformSection />

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
