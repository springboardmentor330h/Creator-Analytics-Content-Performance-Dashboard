
import { useEffect, useState } from "react";
import api from "../api/axios";

function AudienceAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAudience = async () => {
      try {
        const response = await api.get("/analytics/audience");
        setData(response.data);
      } catch (err) {
        console.error("Audience Analytics API Error:", err);
        setError("Failed to load audience analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAudience();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Audience Analytics
        </h1>
        <p className="mt-3 text-slate-500">
          Loading audience data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Audience Analytics
        </h1>
        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    );
  }

  const genderDistribution = data?.gender_distribution || {};
  const ageDistribution = data?.age_distribution || {};

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Audience Analytics
        </h1>

        <p className="mt-2 text-slate-500">
          Understand your audience demographics and reach.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Total Followers
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {Number(data?.total_followers || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Total Reach
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {Number(data?.total_reach || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">
            Total Impressions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {Number(data?.total_impressions || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Demographics */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Gender */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-800">
            Gender Distribution
          </h2>

          <div className="space-y-4">
            {Object.entries(genderDistribution).map(
              ([gender, percentage]) => (
                <div
                  key={gender}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <span className="font-medium text-slate-700">
                    {gender}
                  </span>

                  <span className="font-bold text-slate-800">
                    {percentage}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Age */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-800">
            Age Distribution
          </h2>

          <div className="space-y-4">
            {Object.entries(ageDistribution).map(
              ([ageGroup, percentage]) => (
                <div
                  key={ageGroup}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <span className="font-medium text-slate-700">
                    {ageGroup}
                  </span>

                  <span className="font-bold text-slate-800">
                    {percentage}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AudienceAnalytics;

