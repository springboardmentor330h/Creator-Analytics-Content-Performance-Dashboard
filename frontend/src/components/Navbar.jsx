import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
      <span className="font-medium">Dashboard</span>
      <button onClick={logout} className="text-sm text-red-500">Logout</button>
    </header>
  );
}