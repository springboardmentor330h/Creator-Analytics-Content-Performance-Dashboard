import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles, Eye, EyeOff, Loader2, TrendingUp, Users, Heart, Share2, ArrowUpRight
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      {/* Branding / product-preview panel - hidden on small screens */}
      <div className="relative flex-col justify-between hidden w-1/2 p-12 overflow-hidden lg:flex bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute rounded-full -top-24 -right-24 w-72 h-72 bg-white/10 blur-3xl" />
        <div className="absolute rounded-full -bottom-32 -left-16 w-80 h-80 bg-indigo-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CreatorIQ</span>
        </div>

        <div className="relative">
          <h2 className="max-w-md mb-3 text-3xl font-bold leading-tight text-white">
            Every number that matters, in one dashboard.
          </h2>
          <p className="max-w-sm mb-8 text-sm leading-relaxed text-white/70">
            Track content, audience, and revenue across every platform you post to — updated in real time.
          </p>

          {/* Mini live-dashboard mockup */}
          <div className="p-5 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-2xl border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium tracking-wide uppercase text-white/50">This week</span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: TrendingUp, label: "Views", value: "482K" },
                { icon: Heart, label: "Likes", value: "38.2K" },
                { icon: Users, label: "Followers", value: "12.9K" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/10">
                  <Icon className="w-4 h-4 mb-2 text-white/70" />
                  <p className="text-base font-bold leading-none text-white">{value}</p>
                  <p className="mt-1 text-[11px] text-white/50">{label}</p>
                </div>
              ))}
            </div>

            {/* Simple sparkline made of bars, purely decorative */}
            <div className="flex items-end h-12 gap-1.5">
              {[40, 55, 48, 62, 58, 70, 65, 80, 74, 88, 82, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-white/20 to-white/60"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/50">Creator Analytics &amp; Content Performance Dashboard</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center flex-1 px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">CreatorIQ</span>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">Log in to see how your content is performing.</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 mb-5 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email" placeholder="you@example.com" autoComplete="email"
                className="w-full px-3.5 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl dark:border-gray-600 dark:bg-gray-900/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-11 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl dark:border-gray-600 dark:bg-gray-900/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
                <button
                  type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="flex items-center justify-center w-full gap-2 py-2.5 mt-6 font-medium text-white transition rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
