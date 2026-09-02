import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 w-96">
        <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">CreatorIQ Login</h1>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <input type="email" placeholder="Email" className="w-full px-3 py-2 mb-4 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full px-3 py-2 mb-6 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full py-2 text-white transition rounded-lg bg-brand-600 hover:bg-brand-700">Login</button>
        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}