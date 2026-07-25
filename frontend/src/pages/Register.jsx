import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "creator" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-80 space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-xl font-semibold">Create Account</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input name="full_name" placeholder="Full Name" onChange={handleChange} className="w-full rounded border px-3 py-2" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full rounded border px-3 py-2" />
        <select name="role" onChange={handleChange} className="w-full rounded border px-3 py-2">
          <option value="creator">Creator</option>
          <option value="agency">Agency</option>
          <option value="marketing_team">Marketing Team</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full rounded bg-indigo-600 py-2 text-white">Register</button>
        <p className="text-center text-sm">
          Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </form>
    </div>
  );
}