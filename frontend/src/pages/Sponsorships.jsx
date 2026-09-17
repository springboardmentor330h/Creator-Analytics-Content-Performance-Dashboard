import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import DataTable from "../components/DataTable";
import PageState from "../components/PageState";
import { useAuth } from "../context/AuthContext";
import { getSponsorships } from "../api/sponsorship";

export default function Sponsorships() {
  const { user } = useAuth();
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.creator_id) return;

    getSponsorships(user.creator_id)
      .then(setSponsorships)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const totalValue = sponsorships.reduce((sum, s) => sum + (s.contract_value || 0), 0);
  const activeCount = sponsorships.filter((s) => s.status === "active").length;
  const paidCount = sponsorships.filter((s) => s.payment_status === "paid").length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Sponsorships</h1>

          <PageState loading={loading} error={error}>
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard label="Total Deals" value={sponsorships.length} />
                <KPICard label="Total Contract Value" value={totalValue} suffix=" USD" />
                <KPICard label="Active Deals" value={activeCount} />
                <KPICard label="Paid Deals" value={paidCount} />
              </div>

              <DataTable
                title="Sponsorship Deals"
                columns={[
                  { key: "brand_name", label: "Brand" },
                  { key: "campaign_name", label: "Campaign" },
                  { key: "contract_value", label: "Value (USD)" },
                  { key: "start_date", label: "Start Date" },
                  { key: "end_date", label: "End Date" },
                  { key: "status", label: "Status" },
                  { key: "payment_status", label: "Payment" },
                ]}
                rows={sponsorships}
              />
            </>
          </PageState>
        </main>
      </div>
    </div>
  );
}