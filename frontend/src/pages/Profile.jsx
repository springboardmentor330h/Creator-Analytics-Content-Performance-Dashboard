import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h2>
      <div className="max-w-lg p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-brand-600">
            {user.full_name?.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.full_name}</p>
            <p className="text-sm text-gray-500 capitalize dark:text-gray-400">{user.role}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user.email}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">User ID</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user.id}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-gray-500 dark:text-gray-400">Role</span>
            <span className="font-medium text-gray-800 capitalize dark:text-gray-200">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}