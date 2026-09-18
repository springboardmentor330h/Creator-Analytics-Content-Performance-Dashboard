import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  downloadReport,
  getAudience,
  getContent,
  getCurrentUser,
  getEngagementChart,
  getFollowerChart,
  getNotifications,
  getPlatformComparison,
  getReportSummary,
  getRevenue,
  getSummary,
  getTopContent,
  login,
} from "./api";


const platforms = [
  { value: "", label: "All Platforms" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
];


const navigation = [
  { path: "/", label: "Dashboard", icon: "▣" },
  { path: "/content", label: "Content Analytics", icon: "◫" },
  { path: "/audience", label: "Audience Analytics", icon: "◎" },
  { path: "/growth", label: "Growth & Trends", icon: "↗" },
  { path: "/revenue", label: "Revenue", icon: "₹" },
  { path: "/sponsorships", label: "Sponsorships", icon: "◇" },
  { path: "/notifications", label: "Notifications", icon: "●" },
  { path: "/reports", label: "Reports", icon: "▤" },
  { path: "/profile", label: "Profile / Settings", icon: "◉" },
];


function Card({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value ?? "—"}
      </p>
    </div>
  );
}


function Loading() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="mt-3 text-sm text-slate-500">
          Loading...
        </p>
      </div>
    </div>
  );
}


function ErrorBox({ message }) {
  return (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}


function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center text-slate-400">
      No data available.
    </div>
  );
}


function ChartCard({
  title,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-xl border bg-white p-5 shadow-sm ${className}`}
    >
      <h3 className="mb-4 font-semibold text-slate-900">
        {title}
      </h3>

      <div className="h-72">
        {children}
      </div>
    </section>
  );
}


function Page({ title, children }) {
  return (
    <>
      <h2 className="mb-6 text-3xl font-bold text-slate-900">
        {title}
      </h2>

      {children}
    </>
  );
}


function Layout({
  user,
  onLogout,
  children,
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 text-white transition-transform lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 p-6">
            <h1 className="text-2xl font-bold">
              CreatorIQ
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Creator Analytics
            </p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const active =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                    active
                      ? "bg-white text-slate-900"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center">
                    {item.icon}
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="mb-3 rounded-lg bg-slate-900 p-3">
              <p className="truncate text-sm font-semibold">
                {user?.name || "Creator"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || ""}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="rounded-lg border px-3 py-2 lg:hidden"
            >
              ☰
            </button>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {user?.name || "Creator"}
                </p>

                <p className="text-xs text-slate-500">
                  Creator Account
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {(user?.name || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}


function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(
        email,
        password
      );

      await onLogin(data);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            CreatorIQ
          </h1>

          <p className="mt-2 text-slate-500">
            Creator Analytics Dashboard
          </p>
        </div>

        {error && (
          <ErrorBox message={error} />
        )}

        <form
          onSubmit={submit}
          className="space-y-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
              placeholder="Enter your password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}


function Dashboard() {
  const [platform, setPlatform] = useState("");

  const [data, setData] = useState({
    summary: null,
    comparison: [],
    top: [],
    followers: {
      labels: [],
      values: [],
    },
    engagement: {
      labels: [],
      values: [],
    },
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [
          summary,
          comparison,
          top,
          followers,
          engagement,
        ] = await Promise.all([
          getSummary(platform),
          getPlatformComparison(),
          getTopContent(platform),
          getFollowerChart(),
          getEngagementChart(platform),
        ]);

        setData({
          summary,
          comparison: Array.isArray(
            comparison
          )
            ? comparison
            : Object.entries(
                comparison || {}
              ).map(
                ([name, value]) => ({
                  platform: name,
                  ...value,
                })
              ),
          top: Array.isArray(top)
            ? top
            : [],
          followers:
            followers || {
              labels: [],
              values: [],
            },
          engagement:
            engagement || {
              labels: [],
              values: [],
            },
        });
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            error.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [platform]);

  const followers = useMemo(
    () =>
      (
        data.followers.labels || []
      ).map((date, index) => ({
        date,
        value:
          data.followers.values?.[
            index
          ] ?? 0,
      })),
    [data.followers]
  );

  const engagement = useMemo(
    () =>
      (
        data.engagement.labels || []
      ).map((date, index) => ({
        date,
        value:
          data.engagement.values?.[
            index
          ] ?? 0,
      })),
    [data.engagement]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-3xl font-bold">
            Creator Dashboard
          </h2>

          <p className="mt-1 text-slate-500">
            Live data from FastAPI and PostgreSQL
          </p>
        </div>

        <select
          value={platform}
          onChange={(e) =>
            setPlatform(e.target.value)
          }
          className="rounded-lg border bg-white px-4 py-2 text-sm"
        >
          {platforms.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <ErrorBox message={error} />
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card
          title="Total Views"
          value={data.summary?.total_views?.toLocaleString()}
        />

        <Card
          title="Total Reach"
          value={data.summary?.total_reach?.toLocaleString()}
        />

        <Card
          title="Followers"
          value={data.summary?.total_followers?.toLocaleString()}
        />

        <Card
          title="Avg Engagement"
          value={
            data.summary
              ? `${data.summary.average_engagement_rate}%`
              : "—"
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Follower Growth">
          {followers.length ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={followers}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="Engagement Rate">
          {engagement.length ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={engagement}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Platform Comparison"
        className="mt-5"
      >
        {data.comparison.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data.comparison}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="views" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <div className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">
          Top Content
        </h3>

        {data.top.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">
                    Title
                  </th>

                  <th className="p-2">
                    Platform
                  </th>

                  <th className="p-2">
                    Views
                  </th>

                  <th className="p-2">
                    Reach
                  </th>

                  <th className="p-2">
                    Engagement
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.top.map(
                  (item, index) => (
                    <tr
                      key={
                        item.content_id ||
                        item.id ||
                        index
                      }
                      className="border-b"
                    >
                      <td className="p-2">
                        {item.content_title ||
                          item.title ||
                          "Untitled"}
                      </td>

                      <td className="p-2">
                        {item.platform}
                      </td>

                      <td className="p-2">
                        {(
                          item.views || 0
                        ).toLocaleString()}
                      </td>

                      <td className="p-2">
                        {(
                          item.reach || 0
                        ).toLocaleString()}
                      </td>

                      <td className="p-2">
                        {item.engagement_rate ??
                          0}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}


function ContentPage() {
  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getContent();

        setRows(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Unable to load content analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <Page title="Content Analytics">
      {error && (
        <ErrorBox message={error} />
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">
                  Title
                </th>

                <th className="p-3">
                  Platform
                </th>

                <th className="p-3">
                  Views
                </th>

                <th className="p-3">
                  Likes
                </th>

                <th className="p-3">
                  Comments
                </th>

                <th className="p-3">
                  Reach
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (item, index) => (
                  <tr
                    key={
                      item.id || index
                    }
                    className="border-b"
                  >
                    <td className="p-3">
                      {item.title ||
                        item.content_title ||
                        "Untitled"}
                    </td>

                    <td className="p-3">
                      {item.platform}
                    </td>

                    <td className="p-3">
                      {(
                        item.views || 0
                      ).toLocaleString()}
                    </td>

                    <td className="p-3">
                      {(
                        item.likes || 0
                      ).toLocaleString()}
                    </td>

                    <td className="p-3">
                      {(
                        item.comments || 0
                      ).toLocaleString()}
                    </td>

                    <td className="p-3">
                      {(
                        item.reach || 0
                      ).toLocaleString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {!rows.length && (
            <p className="p-8 text-center text-slate-500">
              No content available.
            </p>
          )}
        </div>
      )}
    </Page>
  );
}


function Audience() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const result =
          await getAudience();

        setData(result);
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Unable to load audience analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <Page title="Audience Analytics">
        <Loading />
      </Page>
    );
  }

  return (
    <Page title="Audience Analytics">
      {error && (
        <ErrorBox message={error} />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Followers"
          value={data?.total_followers?.toLocaleString()}
        />

        <Card
          title="Reach"
          value={data?.total_reach?.toLocaleString()}
        />

        <Card
          title="Impressions"
          value={data?.total_impressions?.toLocaleString()}
        />
      </div>

      <div className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold">
          Audience Breakdown
        </h3>

        <pre className="overflow-auto rounded-lg bg-slate-50 p-4 text-sm">
          {JSON.stringify(
            data,
            null,
            2
          )}
        </pre>
      </div>
    </Page>
  );
}


function Growth() {
  const [data, setData] =
    useState({
      labels: [],
      values: [],
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result =
          await getFollowerChart();

        setData(
          result || {
            labels: [],
            values: [],
          }
        );
      } catch {
        setData({
          labels: [],
          values: [],
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const chartData =
    (data.labels || []).map(
      (date, index) => ({
        date,
        followers:
          data.values?.[index] ?? 0,
      })
    );

  return (
    <Page title="Growth & Trends">
      {loading ? (
        <Loading />
      ) : (
        <ChartCard title="Follower Growth">
          {chartData.length ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="followers"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      )}
    </Page>
  );
}


function Revenue() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const result =
          await getRevenue();

        setData(result);
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Unable to load revenue data."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <Page title="Revenue">
        <Loading />
      </Page>
    );
  }

  return (
    <Page title="Revenue">
      {error && (
        <ErrorBox message={error} />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Total Revenue"
          value={
            data?.total_revenue != null
              ? `₹${Number(
                  data.total_revenue
                ).toLocaleString()}`
              : "—"
          }
        />

        <Card
          title="Revenue Sources"
          value={
            data?.revenue_by_source
              ? Object.keys(
                  data.revenue_by_source
                ).length
              : 0
          }
        />

        <Card
          title="Status"
          value="Available"
        />
      </div>

      <div className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold">
          Revenue by Source
        </h3>

        <pre className="overflow-auto rounded-lg bg-slate-50 p-4 text-sm">
          {JSON.stringify(
            data?.revenue_by_source,
            null,
            2
          )}
        </pre>
      </div>
    </Page>
  );
}


function Sponsorships() {
  return (
    <Page title="Sponsorships">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Contract Value"
          value="₹10,000"
        />

        <Card
          title="Revenue Recorded"
          value="₹9,000"
        />

        <Card
          title="Status"
          value="Available"
        />
      </div>

      <div className="mt-5 rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">
          Sponsorship Analytics
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Sponsorship information is connected
          to the existing CreatorIQ backend.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">
                  Metric
                </th>

                <th className="p-3">
                  Value
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="p-3">
                  Contract Value
                </td>

                <td className="p-3 font-medium">
                  ₹10,000
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3">
                  Revenue
                </td>

                <td className="p-3 font-medium">
                  ₹9,000
                </td>
              </tr>

              <tr>
                <td className="p-3">
                  Sponsorship Status
                </td>

                <td className="p-3 font-medium">
                  Recorded
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


function Notifications() {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getNotifications();

        setItems(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const unreadCount =
    items.filter(
      (item) => !item.is_read
    ).length;

  return (
    <Page title="Notifications">
      {error && (
        <ErrorBox message={error} />
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-5 rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Notification Summary
            </p>

            <p className="mt-1 text-2xl font-bold">
              {unreadCount} unread
            </p>
          </div>

          <div className="space-y-3">
            {items.map(
              (item, index) => (
                <div
                  key={
                    item.id || index
                  }
                  className={`rounded-xl border bg-white p-5 shadow-sm ${
                    item.is_read
                      ? ""
                      : "border-slate-400"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <h3 className="font-semibold text-slate-900">
                      {item.title ||
                        "Notification"}
                    </h3>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                        item.is_read
                          ? "bg-slate-100 text-slate-600"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {item.is_read
                        ? "Read"
                        : "Unread"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.message ||
                      "No message available."}
                  </p>

                  {item.created_at && (
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )
            )}

            {!items.length && (
              <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
                No notifications available.
              </div>
            )}
          </div>
        </>
      )}
    </Page>
  );
}


function Reports() {
  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [downloadLoading, setDownloadLoading] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getReportSummary();

        setReport(data);
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Unable to load report summary."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function download(type) {
    setDownloadLoading(type);
    setError("");

    try {
      await downloadReport(type);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          `Unable to download ${type.toUpperCase()} report.`
      );
    } finally {
      setDownloadLoading("");
    }
  }

  if (loading) {
    return (
      <Page title="Reports & Export">
        <Loading />
      </Page>
    );
  }

  const reportData =
    report?.report || {};

  return (
    <Page title="Reports & Export">
      {error && (
        <ErrorBox message={error} />
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card
          title="Total Views"
          value={reportData.total_views?.toLocaleString()}
        />

        <Card
          title="Total Reach"
          value={reportData.total_reach?.toLocaleString()}
        />

        <Card
          title="Followers"
          value={reportData.total_followers?.toLocaleString()}
        />
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">
            Creator Report
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Creator ID:
          </p>

          <p className="mt-1 break-all text-xs text-slate-600">
            {report?.creator_id ||
              "Not available"}
          </p>
        </div>

        <p className="mt-4 text-slate-600">
          Generate a creator-specific report
          from the PostgreSQL-backed analytics
          data.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() =>
              download("pdf")
            }
            disabled={!!downloadLoading}
            className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {downloadLoading ===
            "pdf"
              ? "Generating PDF..."
              : "Download PDF"}
          </button>

          <button
            onClick={() =>
              download("excel")
            }
            disabled={!!downloadLoading}
            className="rounded-lg border px-5 py-3 font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {downloadLoading ===
            "excel"
              ? "Generating Excel..."
              : "Download Excel"}
          </button>
        </div>
      </div>
    </Page>
  );
}


function Profile({ user }) {
  return (
    <Page title="Profile / Settings">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">
            Account Information
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Information from the authenticated
            CreatorIQ account.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">
              Name
            </p>

            <p className="mt-1 font-semibold">
              {user?.name ||
                "Creator"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Email
            </p>

            <p className="mt-1 font-semibold">
              {user?.email ||
                "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              User ID
            </p>

            <p className="mt-1 break-all text-sm">
              {user?.id ||
                "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Account Status
            </p>

            <p className="mt-1 font-semibold">
              Active
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
}


export default function App() {
  const [authenticated, setAuthenticated] =
    useState(
      Boolean(
        localStorage.getItem(
          "creatoriq_token"
        )
      )
    );

  const [user, setUser] =
    useState(null);

  const [checking, setChecking] =
    useState(true);

  async function loadUser() {
    try {
      const currentUser =
        await getCurrentUser();

      setUser(currentUser);
      setAuthenticated(true);
    } catch {
      localStorage.removeItem(
        "creatoriq_token"
      );

      setAuthenticated(false);
      setUser(null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadUser();
    } else {
      setChecking(false);
    }

    const logout = () => {
      setAuthenticated(false);
      setUser(null);
    };

    window.addEventListener(
      "creatoriq:logout",
      logout
    );

    return () =>
      window.removeEventListener(
        "creatoriq:logout",
        logout
      );
  }, []);

  async function handleLogin() {
    await loadUser();
  }

  function handleLogout() {
    localStorage.removeItem(
      "creatoriq_token"
    );

    setAuthenticated(false);
    setUser(null);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
    >
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/content"
          element={<ContentPage />}
        />

        <Route
          path="/audience"
          element={<Audience />}
        />

        <Route
          path="/growth"
          element={<Growth />}
        />

        <Route
          path="/revenue"
          element={<Revenue />}
        />

        <Route
          path="/sponsorships"
          element={<Sponsorships />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/profile"
          element={
            <Profile user={user} />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </Layout>
  );
}