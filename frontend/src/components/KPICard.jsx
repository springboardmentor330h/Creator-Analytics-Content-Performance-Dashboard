function KPICard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-gray-800">
        {value}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  )
}

export default KPICard