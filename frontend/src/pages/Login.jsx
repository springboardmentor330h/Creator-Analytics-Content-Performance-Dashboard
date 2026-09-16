import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    setMouse({
      x: (e.clientX / innerWidth) * 100,
      y: (e.clientY / innerHeight) * 100,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser?.role === "Administrator" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center bg-brand-900 px-4 overflow-hidden"
    >
      {/* Cursor-reactive glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-200 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(99,102,241,0.25), transparent 55%)`,
        }}
      />

      {/* Ambient drifting blobs for depth */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl transition-transform duration-500 ease-out"
        style={{ transform: `translate(${(mouse.x - 50) * 0.15}px, ${(mouse.y - 50) * 0.15}px)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl transition-transform duration-500 ease-out"
        style={{ transform: `translate(${(mouse.x - 50) * -0.15}px, ${(mouse.y - 50) * -0.15}px)` }}
      />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl shadow-black/30 w-full max-w-sm p-8 transition-transform duration-300 hover:shadow-brand-600/20">
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles size={18} className="text-brand-500" />
          <h1 className="text-2xl font-semibold text-slate-800 text-center">CreatorIQ</h1>
        </div>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">
          Creator Analytics & Content Performance Dashboard
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
