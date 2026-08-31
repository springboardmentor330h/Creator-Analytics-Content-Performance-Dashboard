import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export interface PieSlice {
  /** Label shown in legend and tooltip */
  name: string
  /** Numeric value */
  value: number
  /** Optional override for the tooltip display label (full name when name is abbreviated) */
  fullName?: string
}

interface PieChartCardProps {
  title: string
  data: PieSlice[]
  colors: string[]
  /** Unit string shown after the value in the tooltip, e.g. "%" or " INR" */
  unit?: string
  /** If true, values are formatted as percentages (value.toFixed(1) + %) */
  isPercent?: boolean
  /** Custom tooltip formatter. Receives (value, fullName). If omitted, a default is used. */
  tooltipFormatter?: (value: number, fullName: string) => string
  /** Optional extra className on the outer wrapper */
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: PieSlice }>
  unit?: string
  isPercent?: boolean
  tooltipFormatter?: (value: number, fullName: string) => string
}

function CustomTooltip({ active, payload, unit = '', isPercent, tooltipFormatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const displayName = item.payload.fullName || item.name
  const formattedValue = tooltipFormatter
    ? tooltipFormatter(item.value, displayName)
    : isPercent
    ? `${item.value.toFixed(1)}%`
    : `${item.value.toLocaleString()}${unit}`

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '10px 14px',
        fontSize: '12px',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.10)',
        color: '#0f172a',
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 2, color: '#1e293b' }}>{displayName}</p>
      <p style={{ fontWeight: 600, color: '#6366f1' }}>{formattedValue}</p>
    </div>
  )
}

export default function PieChartCard({
  title,
  data,
  colors,
  unit = '',
  isPercent = false,
  tooltipFormatter,
  className = '',
}: PieChartCardProps) {
  const filteredData = data.filter((d) => d.value > 0)

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col ${className}`}
      style={{ minHeight: 340 }}
    >
      {/* Card header */}
      <div className="px-6 pt-5 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>

      {/* Chart area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-4">
        {filteredData.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium py-8">No data available</p>
        ) : (
          <>
            {/* Donut chart — no inline labels, avoids all overlap */}
            <div className="w-full" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={filteredData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="38%"
                    outerRadius="62%"
                    paddingAngle={3}
                    minAngle={10}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomTooltip
                        unit={unit}
                        isPercent={isPercent}
                        tooltipFormatter={tooltipFormatter}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend — sits below chart, always inside card */}
            <div className="w-full mt-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {filteredData.map((entry, index) => {
                  const displayValue = isPercent
                    ? `${entry.value.toFixed(1)}%`
                    : `${entry.value.toLocaleString()}${unit}`
                  return (
                    <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[130px]">
                        {entry.name}
                      </span>
                      <span className="text-xs font-bold text-slate-500 shrink-0">{displayValue}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
