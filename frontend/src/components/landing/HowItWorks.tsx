import { Link2, LineChart, Rocket, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect',
    description: 'Connect your social platforms and bring your data into one place.',
    icon: Link2,
    badge: 'Step 1',
  },
  {
    number: '02',
    title: 'Analyze',
    description: 'Understand content performance, engagement and audience behavior.',
    icon: LineChart,
    badge: 'Step 2',
  },
  {
    number: '03',
    title: 'Grow',
    description: 'Use insights to improve your content strategy and performance.',
    icon: Rocket,
    badge: 'Step 3',
  },
]

export default function HowItWorks() {
  return (
    <section id="solutions" className="border-y border-slate-200/80 bg-slate-50/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            Simple 3-Step Process
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            From data to better decisions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Streamlined workflow designed for creators and agency teams.
          </p>
        </div>

        {/* Timeline Desktop & Mobile Grid */}
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Horizontal Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-slate-200 -translate-y-6 -z-0" />

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-300"
              >
                {/* Number Badge */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-lg shadow-md mb-6 transition-transform duration-200 group-hover:scale-105">
                  {step.number}
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-extrabold text-slate-900">{step.title}</h3>

                {/* Step Description */}
                <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {/* Sub Icon Pill */}
                <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Icon className="h-3.5 w-3.5 text-brand-600" />
                  <span>{step.badge}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
