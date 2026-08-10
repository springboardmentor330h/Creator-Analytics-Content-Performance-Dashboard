import { Link } from 'react-router-dom'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever free',
    description: 'Perfect for individual creators starting out with basic content tracking.',
    features: [
      '1 Social Channel Connection',
      'Basic Content Performance Tracking',
      '7-Day Analytics History',
      'Role-Based Security Scopes',
      'Standard Support',
    ],
    buttonText: 'Start Free Workspace',
    highlighted: false,
  },
  {
    name: 'Creator Pro',
    price: '$29',
    period: 'per month',
    description: 'Advanced analytics and side-by-side comparison for growing brands.',
    features: [
      'Up to 10 Social Channel Links',
      'Side-by-Side Comparison (5 items)',
      'Unlimited Analytics History',
      'Top-Performing Content Reports',
      'PDF & Excel Export Reports',
      'Priority Email Support',
    ],
    buttonText: 'Start 14-Day Free Trial',
    highlighted: true,
  },
  {
    name: 'Agency & Team',
    price: '$99',
    period: 'per month',
    description: 'Comprehensive workspace for agencies managing rosters of creators.',
    features: [
      'Unlimited Social Channels & Roster',
      'Full RBAC Scope Management (4 Roles)',
      'Agency Roster Linkage & Linkage Requests',
      'Custom Multi-Platform Reports',
      'Dedicated Account Manager',
      '24/7 SLA Support',
    ],
    buttonText: 'Contact Sales',
    highlighted: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-100">
            Transparent Pricing
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            Simple, predictable plans for every stage
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Start for free, upgrade when you need multi-channel comparison and agency tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-brand-600 bg-white shadow-xl shadow-brand-500/10 scale-102 z-10'
                  : 'border border-slate-200 bg-white shadow-sm hover:border-slate-300'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Most Popular Choice
                </div>
              )}

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-500 min-h-[36px]">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs font-semibold text-slate-500">{plan.period}</span>
                </div>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-600 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  to="/register"
                  className={`w-full text-center py-3 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
