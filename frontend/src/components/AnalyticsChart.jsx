import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AnalyticsChart({
  title,
  description = "Performance over time",
  data,
  dataKey,
  xAxisKey = "label",
  yAxisLabel,
  lineColor = "#a855f7",
  valueSuffix = "",
}) {
  const chartData = Array.isArray(data) ? data : [];

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatValue = (value) => {
    if (typeof value !== "number") {
      return value;
    }

    return `${value.toLocaleString()}${valueSuffix}`;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <div className="mb-5">

        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>

      </div>


      {/* ------------------------------------------------
          CHART
      ------------------------------------------------ */}

      <div className="h-72">

        {chartData.length === 0 ? (

          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No chart data available.
          </div>

        ) : (

          <ResponsiveContainer width="100%" height="100%">

            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 15,
                left: 5,
                bottom: 5,
              }}
            >

              {/* Grid */}

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
                vertical={false}
              />


              {/* X Axis */}

              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatDate}
                tick={{
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
                axisLine={{
                  stroke: "rgba(255,255,255,0.1)",
                }}
                tickLine={false}
                minTickGap={25}
              />


              {/* Y Axis */}

              <YAxis
                tick={{
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={(value) =>
                  Number(value).toLocaleString()
                }
                label={
                  yAxisLabel
                    ? {
                        value: yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        fill: "#9ca3af",
                        fontSize: 11,
                        offset: 5,
                      }
                    : undefined
                }
              />


              {/* Tooltip */}

              <Tooltip
                cursor={{
                  stroke: "rgba(255,255,255,0.15)",
                  strokeWidth: 1,
                }}
                contentStyle={{
                  backgroundColor: "#181818",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
                labelStyle={{
                  color: "#9ca3af",
                  fontSize: 11,
                  marginBottom: 4,
                }}
                itemStyle={{
                  color: lineColor,
                  fontSize: 13,
                  fontWeight: 600,
                }}
                formatter={(value) => [
                  formatValue(Number(value)),
                  yAxisLabel || "Value",
                ]}
                labelFormatter={(label) =>
                  formatDate(label)
                }
              />


              {/* Main Line */}

              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={lineColor}
                strokeWidth={3}
                dot={{
                  r: 3,
                  fill: lineColor,
                  stroke: "#151515",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: lineColor,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />

            </LineChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>
  );
}

export default AnalyticsChart;