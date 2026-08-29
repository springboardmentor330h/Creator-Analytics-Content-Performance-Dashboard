import { useEffect, useState } from "react";
import api from "../services/api";

function Sponsorships() {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/sponsorships/creator/2")
      .then((response) => {
        setSponsorships(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load sponsorship data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading sponsorships...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Sponsorships
      </h1>

      <p className="mt-2 text-gray-600">
        Sponsorship information for Creator 2
      </p>

      {sponsorships.length === 0 ? (
        <p className="mt-6 text-gray-500">
          No sponsorships found.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4">Brand</th>
                <th className="p-4">Campaign</th>
                <th className="p-4">Contract Value</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
              </tr>
            </thead>

            <tbody>
              {sponsorships.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4">{item.brand_name}</td>
                  <td className="p-4">{item.campaign}</td>
                  <td className="p-4">
                    ₹{Number(item.contract_value).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">{item.start_date}</td>
                  <td className="p-4">{item.end_date}</td>
                  <td className="p-4">{item.status}</td>
                  <td className="p-4">{item.payment_status}</td>
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