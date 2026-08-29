import { useEffect, useState } from "react";

import {
  getCreatorRevenue,
  getRevenueSummary,
  getRevenueBySource,
  getMonthlyRevenue,
} from "../services/api";

import RevenueChart from "../components/charts/RevenueChart";
import RevenueBySourceChart from "../components/charts/RevenueBySourceChart";

function Revenue() {
  const creatorId = 2;

  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryData,
          revenueData,
          sourceData,
          monthlyData,
        ] = await Promise.all([
          getRevenueSummary(creatorId),
          getCreatorRevenue(creatorId),
          getRevenueBySource(creatorId),
          getMonthlyRevenue(creatorId),
        ]);

        setSummary(summaryData);

        setRevenue(revenueData);

        setBySource(
          sourceData.revenue_by_source || []
        );

        setMonthly(
          monthlyData.monthly_revenue || []
        );
      } catch (err) {
        console.error("Revenue API error:", err);

        setError(
          "Unable to load revenue data from the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Revenue
        </h1>

        <p className="mt-4 text-gray-500">
          Loading revenue data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Revenue
        </h1>

        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Revenue
        </h1>

        <p className="mt-2 text-gray-600">
          Revenue analytics for Creator {creatorId}
        </p>
      </div>


      {/* KPI Cards */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Revenue
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₹
            {Number(
              summary?.total_revenue || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Creator ID
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {summary?.creator_id}
          </h2>
        </div>


        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Transactions
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {revenue.length}
          </h2>
        </div>

      </div>


      {/* Charts */}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <RevenueChart
          data={monthly}
        />

        <RevenueBySourceChart
          data={bySource}
        />

      </div>


      {/* Revenue Transactions */}

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold">
          Revenue Transactions
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-gray-500">

                <th className="px-4 py-3">
                  Source
                </th>

                <th className="px-4 py-3">
                  Amount
                </th>

                <th className="px-4 py-3">
                  Date
                </th>

                <th className="px-4 py-3">
                  Description
                </th>

              </tr>
            </thead>

            <tbody>

              {revenue.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-4 font-medium">
                    {item.source}
                  </td>

                  <td className="px-4 py-4">
                    ₹
                    {Number(
                      item.amount
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4">
                    {item.revenue_date}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {item.description}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Revenue;