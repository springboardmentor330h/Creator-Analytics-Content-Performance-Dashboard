import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useRole } from "../context/RoleContext";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "creator" });
  const [error, setError] = useState("");
  const { loginAs } = useRole();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email: form.email, password: form.password });
      loginAs(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/users", form);
      const res = await api.post("/auth/login", { email: form.email, password: form.password });
      loginAs(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow sm:p-8"
      >
        <h1 className="text-xl font-semibold">{mode === "login" ? "CreatorIQ Login" : "Create Account"}</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}

        {mode === "register" && (
          <>
            <input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
              required
              minLength={3}
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="creator">Creator</option>
              <option value="agency">Agency</option>
              <option value="marketing_team">Marketing Team</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-sm"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 text-sm"
          required
          minLength={8}
        />

        <button className="w-full rounded bg-indigo-600 py-2 text-sm text-white">
          {mode === "login" ? "Login" : "Register"}
        </button>

        <p className="text-center text-xs text-gray-500">
          {mode === "login" ? (
            <>Don't have an account? <button type="button" onClick={() => setMode("register")} className="text-indigo-600">Register</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode("login")} className="text-indigo-600">Login</button></>
          )}
        </p>
      </form>
    </div>
  );
}