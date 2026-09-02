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

  const statusClasses = {
    Active: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Completed: "bg-sky-100 text-sky-700",
    Cancelled: "bg-rose-100 text-rose-700",
  };

  const paymentClasses = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Overdue: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Partnerships</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Sponsorships</h1>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <p className="text-slate-500">Loading sponsorships...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="dashboard-hero">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Partnerships</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Sponsorships</h1>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="dashboard-hero">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">Partnerships</p>
              <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Sponsorships</h1>
              <p className="mt-2 text-sm text-indigo-100/90">Sponsorship information for Creator 2</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {sponsorships.length} Active deals
            </div>
          </div>
        </div>

        {sponsorships.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <h2 className="text-xl font-semibold text-slate-800">No sponsorships found.</h2>
            <p className="mt-2 text-slate-500">No sponsorship records are currently available.</p>
          </div>
        ) : (
          <div className="content-table-card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Partnership overview</h2>
                <p className="mt-1 text-sm text-slate-500">Current and upcoming campaign deals</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="dashboard-table w-full text-left">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Campaign</th>
                    <th>Contract Value</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsorships.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-slate-800">{item.brand_name}</td>
                      <td>{item.campaign}</td>
                      <td>₹{Number(item.contract_value).toLocaleString("en-IN")}</td>
                      <td>{item.start_date}</td>
                      <td>{item.end_date}</td>
                      <td><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[item.status] || "bg-slate-100 text-slate-700"}`}>{item.status}</span></td>
                      <td><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentClasses[item.payment_status] || "bg-slate-100 text-slate-700"}`}>{item.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sponsorships;