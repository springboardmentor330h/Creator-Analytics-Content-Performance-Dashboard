import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function ProfileSettings() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="space-y-6 p-6">
          <h1 className="text-2xl font-semibold">Profile & Settings</h1>

          <div className="max-w-lg rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Account Details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Full Name</dt>
                <dd className="font-medium">{user?.full_name ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Role</dt>
                <dd className="font-medium capitalize">{user?.role ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Account Status</dt>
                <dd className="font-medium">{user?.is_active ? "Active" : "Inactive"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">User ID</dt>
                <dd className="font-mono text-xs text-gray-400">{user?.id ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <button
            onClick={logout}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Log Out
          </button>
        </main>
      </div>
    </div>
  );
}