import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Profile & Settings</h2>

      <div className="max-w-lg p-6 bg-white rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white bg-blue-600 rounded-full">
            {user.full_name?.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-500">User ID</span>
            <span className="font-medium">{user.id}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}