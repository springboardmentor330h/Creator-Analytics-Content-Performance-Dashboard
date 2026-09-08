function KPICard({ title, value, description, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Decorative Circle */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-200/50 transition-transform duration-300 group-hover:scale-125"></div>

      {/* Icon - Right Side */}
      <div className="absolute right-6 top-6 z-10 text-3xl font-bold text-[#2563eb]">
        {icon}
      </div>

      {/* Card Content */}
      <div className="relative z-10 pr-12">

        {/* Title */}
        <p className="text-sm font-semibold text-[#2563eb]">
          {title}
        </p>

        {/* Value */}
        <h3 className="mt-3 text-3xl font-extrabold text-[#2563eb]">
          {value}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600">
          {description}
        </p>

      </div>

    </div>
  )
}

export default KPICard