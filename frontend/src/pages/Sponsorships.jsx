
import { useEffect, useState } from "react";
import api from "../api/axios";

function Sponsorships() {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSponsorships = async () => {
      try {
        const response = await api.get("/sponsorship");
        setSponsorships(response.data);
      } catch (err) {
        console.error("Sponsorship API Error:", err);
        setError("Failed to load sponsorship data.");
      } finally {
        setLoading(false);
      }
    };

    loadSponsorships();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Sponsorships
        </h1>
        <p className="mt-3 text-slate-500">
          Loading sponsorship data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Sponsorships
        </h1>
        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Sponsorships
        </h1>

        <p className="mt-2 text-slate-500">
          Track your brand partnerships and sponsorship campaigns.
        </p>
      </div>

      {sponsorships.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-slate-500">
            No sponsorship records found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Brand
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Campaign
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Contract Value
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Start Date
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  End Date
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Payment
                </th>
              </tr>
            </thead>

            <tbody>
              {sponsorships.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {item.brand_name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {item.campaign}
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-800">
                    INR {Number(item.contract_value || 0).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {item.start_date}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {item.end_date}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                      {item.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Sponsorships;

