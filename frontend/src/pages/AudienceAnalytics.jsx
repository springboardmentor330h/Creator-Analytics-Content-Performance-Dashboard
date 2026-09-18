import { useEffect, useState } from "react";
import api from "../services/api";
import AnalyticsChart from "../components/AnalyticsChart";

const PLATFORMS = [
  "All Platforms",
  "YouTube",
  "Instagram",
  "TikTok",
  "Facebook",
  "LinkedIn",
  "X",
];

function AudienceAnalytics() {
  const [audience, setAudience] = useState(null);
  const [audienceTrends, setAudienceTrends] = useState([]);

  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAudienceAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          selectedPlatform === "All Platforms"
            ? {}
            : { platform: selectedPlatform };

        const [audienceResponse, trendsResponse] = await Promise.all([
          api.get("/analytics/audience", { params }),
          api.get("/analytics/audience-trends", { params }),
        ]);

        const audienceResult =
          audienceResponse.data?.data ?? audienceResponse.data;

        const trendsResult =
          trendsResponse.data?.data ?? trendsResponse.data;

        setAudience(audienceResult);

        if (Array.isArray(trendsResult)) {
          setAudienceTrends(trendsResult);
        } else {
          setAudienceTrends([]);
        }
      } catch (err) {
        console.error("Audience analytics error:", err);

        setAudience(null);
        setAudienceTrends([]);

        if (err.response) {
          setError(
            `Unable to load audience analytics. Server returned ${err.response.status}.`
          );
        } else if (err.request) {
          setError(
            "Unable to connect to the backend. Make sure FastAPI is running."
          );
        } else {
          setError("Unable to load audience analytics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAudienceAnalytics();
  }, [selectedPlatform]);

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-purple-500" />

          <p className="text-sm text-gray-500">
            Loading audience analytics...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <h2 className="text-lg font-semibold text-red-400">
            Unable to load Audience Analytics
          </h2>

          <p className="mt-2 text-sm text-red-300">{error}</p>

          <p className="mt-4 text-xs text-gray-500">
            Check that the FastAPI backend is running and that
            /analytics/audience is available in Swagger.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------

  if (!audience) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-white/10 bg-[#151515] p-8 text-center">
          <h2 className="text-lg font-semibold text-white">
            No Audience Data
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There is no audience analytics data available for{" "}
            {selectedPlatform}.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DATA
  // --------------------------------------------------

  const totalFollowers = audience.total_followers ?? 0;

  const totalReach = audience.total_reach ?? 0;

  const totalImpressions = audience.total_impressions ?? 0;

  const genderDistribution = audience.gender_distribution ?? {};

  const ageDistribution = audience.age_distribution ?? {};

  const deviceDistribution = audience.device_distribution ?? {};

  const topCountries = Array.isArray(audience.top_countries)
    ? audience.top_countries
    : [];

  const topCities = Array.isArray(audience.top_cities)
    ? audience.top_cities
    : [];

  // --------------------------------------------------
  // FORMAT AUDIENCE TREND DATA
  // --------------------------------------------------

  const trendData = audienceTrends
    .filter((item) => item.date)
    .map((item) => ({
      label: item.date,
      value: Number(item.followers ?? 0),
    }));

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="w-full space-y-7">
      {/* ==================================================
          HEADER
      ================================================== */}

      <section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
              Audience Analytics
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Understand your audience, demographics, and growth patterns.
            </p>
          </div>

          {/* PLATFORM SELECTOR */}

          <div className="w-full lg:w-56">
            <label
              htmlFor="audience-platform"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Platform
            </label>

            <select
              id="audience-platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
            >
              {PLATFORMS.map((platform) => (
                <option
                  key={platform}
                  value={platform}
                  className="bg-[#151515] text-white"
                >
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CURRENT PLATFORM INDICATOR */}

        <div className="mt-4 inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5">
          <span className="mr-2 h-2 w-2 rounded-full bg-purple-400" />

          <span className="text-xs font-medium text-purple-300">
            {selectedPlatform}
          </span>
        </div>
      </section>

      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Followers */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">Total Followers</p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {Number(totalFollowers).toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            {selectedPlatform === "All Platforms"
              ? "Across all audience records"
              : `For ${selectedPlatform}`}
          </p>
        </div>

        {/* Total Reach */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">Total Reach</p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {Number(totalReach).toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            {selectedPlatform === "All Platforms"
              ? "Total audience reach"
              : `Reach generated on ${selectedPlatform}`}
          </p>
        </div>

        {/* Total Impressions */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-500">Total Impressions</p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {Number(totalImpressions).toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            {selectedPlatform === "All Platforms"
              ? "Total recorded impressions"
              : `Impressions on ${selectedPlatform}`}
          </p>
        </div>
      </section>

      {/* ==================================================
          AUDIENCE GROWTH
      ================================================== */}

      <section>
        {selectedPlatform !== "All Platforms" && trendData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-8">
            <h2 className="text-lg font-semibold text-white">
              Audience Growth
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Platform-specific historical audience growth data is not
              available yet.
            </p>

            <p className="mt-2 text-xs text-gray-600">
              Current follower growth tracking is maintained at the
              creator level.
            </p>
          </div>
        ) : trendData.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#151515] p-8 text-center">
            <p className="text-sm text-gray-500">
              No audience trend data available.
            </p>
          </div>
        ) : (
          <AnalyticsChart
            title="Audience Growth"
            description="Track how your follower count changes over time."
            data={trendData}
            dataKey="value"
            xAxisKey="label"
            yAxisLabel="Followers"
            lineColor="#a855f7"
          />
        )}
      </section>

      {/* ==================================================
          DEMOGRAPHICS
      ================================================== */}

      <section className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Gender Distribution */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <h2 className="text-lg font-semibold text-white">
            Gender Distribution
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Followers by gender
          </p>

          <div className="mt-6 space-y-4">
            {Object.keys(genderDistribution).length === 0 ? (
              <p className="text-sm text-gray-500">
                No gender data available.
              </p>
            ) : (
              Object.entries(genderDistribution).map(
                ([gender, followers]) => (
                  <div
                    key={gender}
                    className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0"
                  >
                    <span className="text-sm capitalize text-gray-400">
                      {gender}
                    </span>

                    <span className="text-sm font-medium text-white">
                      {Number(followers).toLocaleString()}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* Age Distribution */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <h2 className="text-lg font-semibold text-white">
            Age Distribution
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Followers by age group
          </p>

          <div className="mt-6 space-y-4">
            {Object.keys(ageDistribution).length === 0 ? (
              <p className="text-sm text-gray-500">
                No age data available.
              </p>
            ) : (
              Object.entries(ageDistribution).map(([age, followers]) => (
                <div
                  key={age}
                  className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0"
                >
                  <span className="text-sm text-gray-400">{age}</span>

                  <span className="text-sm font-medium text-white">
                    {Number(followers).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Distribution */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <h2 className="text-lg font-semibold text-white">
            Device Distribution
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Followers by device
          </p>

          <div className="mt-6 space-y-4">
            {Object.keys(deviceDistribution).length === 0 ? (
              <p className="text-sm text-gray-500">
                No device data available.
              </p>
            ) : (
              Object.entries(deviceDistribution).map(
                ([device, followers]) => (
                  <div
                    key={device}
                    className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0"
                  >
                    <span className="text-sm capitalize text-gray-400">
                      {device}
                    </span>

                    <span className="text-sm font-medium text-white">
                      {Number(followers).toLocaleString()}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          LOCATION ANALYTICS
      ================================================== */}

      <section className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Countries */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Top Countries
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Countries with the highest number of followers.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {topCountries.length === 0 ? (
              <p className="text-sm text-gray-500">
                No country data available.
              </p>
            ) : (
              topCountries.map((country, index) => (
                <div
                  key={`${country.country}-${index}`}
                  className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-xs font-medium text-purple-400">
                      {index + 1}
                    </span>

                    <span className="text-sm text-gray-300">
                      {country.country}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-white">
                    {Number(country.followers ?? 0).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Cities */}

        <div className="rounded-xl border border-white/10 bg-[#151515] p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Top Cities
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Cities with the highest number of followers.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {topCities.length === 0 ? (
              <p className="text-sm text-gray-500">
                No city data available.
              </p>
            ) : (
              topCities.map((city, index) => (
                <div
                  key={`${city.city}-${index}`}
                  className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-xs font-medium text-purple-400">
                      {index + 1}
                    </span>

                    <span className="text-sm text-gray-300">
                      {city.city}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-white">
                    {Number(city.followers ?? 0).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AudienceAnalytics;