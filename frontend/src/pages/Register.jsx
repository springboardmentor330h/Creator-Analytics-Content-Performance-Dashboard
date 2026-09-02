import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "creator" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 w-96">
        <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600">Account created! Redirecting...</p>}
        <input name="full_name" placeholder="Full Name" className="w-full px-3 py-2 mb-4 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.full_name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2 mb-4 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password (min 6 chars)" className="w-full px-3 py-2 mb-4 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.password} onChange={handleChange} required />
        <select name="role" className="w-full px-3 py-2 mb-6 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.role} onChange={handleChange}>
          <option value="creator">Creator</option>
          <option value="agency">Agency</option>
          <option value="marketing team">Marketing Team</option>
          <option value="administrator">Administrator</option>
        </select>
        <button className="w-full py-2 text-white transition rounded-lg bg-brand-600 hover:bg-brand-700">Create Account</button>
        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}