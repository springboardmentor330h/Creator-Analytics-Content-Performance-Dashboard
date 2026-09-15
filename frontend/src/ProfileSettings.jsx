import { useEffect, useState } from "react";
import api from "./api";
import { useAuth } from "./context/AuthContext";

function ProfileSettings() {
  const { logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const meRes = await api.get("/auth/me");
      let fullUser = meRes.data;

      if (meRes.data && meRes.data.id) {
        try {
          const detailRes = await api.get(`/users/${meRes.data.id}`);
          fullUser = { ...fullUser, ...detailRes.data };
        } catch (detailErr) {
          console.warn("Could not fetch user details:", detailErr);
        }
      }

      setUserData(fullUser);

      setFormData({
        full_name: fullUser.full_name || "",
        email: fullUser.email || "",
        password: "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load user profile information.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!userData || !userData.id) {
      setError("User profile ID missing.");
      return;
    }

    if (!formData.full_name.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
      };

      if (formData.password && formData.password.trim().length >= 6) {
        payload.password = formData.password.trim();
      }

      const res = await api.put(`/users/${userData.id}`, payload);

      setSuccess("Profile updated successfully!");

      if (res.data && res.data.data) {
        setUserData((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      } else {
        await fetchProfile();
      }

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (err) {
      console.error("Update profile error:", err);

      setError(err.response?.data?.detail || "Failed to update user profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800">Loading Profile...</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profile & Settings</h1>

        <p className="text-gray-500 mt-2">
          Manage your account settings, personal details, and preferences.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* User Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-900 text-white font-bold text-3xl flex items-center justify-center flex-shrink-0">
          {userData?.full_name
            ? userData.full_name.charAt(0).toUpperCase()
            : "C"}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {userData?.full_name || "Creator User"}
            </h2>

            <span className="px-3 py-1 bg-gray-100 text-gray-800 font-semibold text-xs rounded-full self-center sm:self-auto">
              {userData?.role || "Creator"}
            </span>
          </div>

          <p className="text-gray-500 mt-1">
            {userData?.email || "No email available"}
          </p>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
            <span>User ID: #{userData?.id ?? "N/A"}</span>

            <span>•</span>

            <span>Status: Active</span>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">
          Edit Profile Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Full Name
            </label>

            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  full_name: e.target.value,
                })
              }
              className="w-full border rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Email Address
            </label>

            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full border rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              New Password (Optional)
            </label>

            <input
              type="text"
              value={formData.password}
              placeholder="Enter new password"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  password: e.target.value,
                });
              }}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:border-gray-500 focus:ring-2 focus:ring-gray-300 outline-none"
            />

            <p className="text-xs text-gray-400 mt-1">
              Minimum 6 characters required if changing password.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Role (Read-Only)
            </label>

            <input
              type="text"
              disabled
              value={userData?.role || "Creator"}
              className="w-full border bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-between items-center border-t">
            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition text-sm shadow-sm"
            >
              Logout
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition disabled:opacity-50 text-sm shadow-sm"
            >
              {isSubmitting ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;
