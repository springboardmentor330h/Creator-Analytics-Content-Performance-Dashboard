import {
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    id: 'content-analytics',
    title: 'Content Analytics',
    description: 'Track views, likes, comments, shares and more in real-time.',
    icon: BarChart3,
    color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    path: '/content-analytics',
  },
  {
    id: 'audience-insights',
    title: 'Audience Insights',
    description: 'Understand your audience demographics, behavior and growth.',
    icon: Users,
    color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
  },
  {
    id: 'growth-tracking',
    title: 'Growth Tracking',
    description: 'Monitor growth trends and track your performance over time.',
    icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
  },
  {
    id: 'revenue-analytics',
    title: 'Revenue Analytics',
    description: 'Track earnings, monetization and revenue performance.',
    icon: DollarSign,
    color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
  },
  {
    id: 'export-reports',
    title: 'Export Reports',
    description: 'Download professional reports in PDF and Excel formats.',
    icon: FileSpreadsheet,
    color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
  },
]

export default function FeatureSection() {
  const navigate = useNavigate()

  return (
    <section id="features" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-100">
            Platform Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            All the analytics and insights you need in one place.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            // 5th card spans 2 columns on lg or stays nicely balanced
            const isLastOnLg = index === 4
            return (
              <div
                key={feature.id}
                onClick={() => feature.path && navigate(feature.path)}
                className={`group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg ${
                  isLastOnLg ? 'sm:col-span-2 lg:col-span-1' : ''
                } ${feature.path ? 'cursor-pointer' : ''}`}
              >
                {/* Icon Container */}
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mt-5 text-xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* CTA Link */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-brand-600 group-hover:text-brand-700">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
