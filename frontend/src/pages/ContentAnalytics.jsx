import { useEffect, useState } from "react";
import api from "../api/axios";

function ContentAnalytics() {
  const [topContent, setTopContent] = useState([]);
  const [reachData, setReachData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContentAnalytics = async () => {
      try {
        const [topResponse, reachResponse] = await Promise.all([
          api.get("/analytics/content/top-performing?limit=5"),
          api.get("/analytics/content/reach?limit=5"),
        ]);

        setTopContent(topResponse.data);
        setReachData(reachResponse.data);
      } catch (err) {
        console.error("Content Analytics API Error:", err);
        setError("Failed to load content analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadContentAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Content Analytics
        </h1>
        <p className="mt-3 text-slate-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Content Analytics
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
          Content Analytics
        </h1>

        <p className="mt-2 text-slate-500">
          Analyze your content performance and reach.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-800">
            Top Performing Content
          </h2>

          <div className="space-y-4">
            {topContent.map((item) => (
              <div
                key={item.content_id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.platform}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {item.engagement_rate}%
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">

                  <div>
                    <p className="text-slate-400">
                      Views
                    </p>

                    <p className="font-semibold text-slate-700">
                      {Number(item.views).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Likes
                    </p>

                    <p className="font-semibold text-slate-700">
                      {Number(item.likes).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Reach
                    </p>

                    <p className="font-semibold text-slate-700">
                      {Number(item.reach).toLocaleString()}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-semibold text-slate-800">
            Reach Analysis
          </h2>

          <div className="space-y-4">

            {reachData.map((item) => (
              <div
                key={item.content_id}
                className="rounded-lg border border-slate-200 p-4"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.platform}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="text-sm text-slate-400">
                      Reach
                    </p>

                    <p className="text-lg font-bold text-slate-800">
                      {Number(item.reach).toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}

export default ContentAnalytics;