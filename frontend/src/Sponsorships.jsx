import { useEffect, useState } from "react";
import api from "./api";

function Sponsorships() {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    brand_name: "",
    campaign: "",
    contract_value: "",
    start_date: "",
    end_date: "",
    status: "Active",
    payment_status: "Pending",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const fetchSponsorships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/revenue/sponsorships");
      setSponsorships(response.data || []);
    } catch (err) {
      console.error("Sponsorships Error:", err);

      setError(
        err.response?.data?.detail || "Failed to load sponsorship records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);

    setFormData({
      brand_name: "",
      campaign: "",
      contract_value: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0],
      status: "Active",
      payment_status: "Pending",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingId(item.id);

    setFormData({
      brand_name: item.brand_name || "",
      campaign: item.campaign || "",
      contract_value: item.contract_value || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      status: item.status || "Active",
      payment_status: item.payment_status || "Pending",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.brand_name.trim()) {
      setFormError("Brand name is required.");
      return;
    }

    if (!formData.campaign.trim()) {
      setFormError("Campaign name is required.");
      return;
    }

    if (!formData.contract_value || Number(formData.contract_value) <= 0) {
      setFormError("Contract value must be greater than 0.");
      return;
    }

    if (!formData.start_date) {
      setFormError("Start date is required.");
      return;
    }

    if (!formData.end_date) {
      setFormError("End date is required.");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        brand_name: formData.brand_name.trim(),
        campaign: formData.campaign.trim(),
        contract_value: Number(formData.contract_value),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        payment_status: formData.payment_status,
      };

      if (editingId) {
        await api.put(`/revenue/sponsorships/${editingId}`, payload);
      } else {
        await api.post("/revenue/sponsorships", payload);
      }

      setIsModalOpen(false);
      await fetchSponsorships();
    } catch (err) {
      console.error("Save Sponsorship Error:", err);

      setFormError(err.response?.data?.detail || "Failed to save sponsorship.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Sponsorship
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sponsorship?")) {
      return;
    }

    try {
      setDeletingId(id);

      await api.delete(`/revenue/sponsorships/${id}`);

      await fetchSponsorships();
    } catch (err) {
      console.error("Delete Sponsorship Error:", err);

      alert(err.response?.data?.detail || "Failed to delete sponsorship.");
    } finally {
      setDeletingId(null);
    }
  };

  // Summary Metrics
  const totalSponsorships = sponsorships.length;

  const activeSponsorships = sponsorships.filter(
    (s) => s.status === "Active",
  ).length;

  const totalValue = sponsorships.reduce(
    (sum, s) => sum + (Number(s.contract_value) || 0),
    0,
  );

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Loading Sponsorships...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sponsorships</h1>

          <p className="text-gray-500 mt-2">
            Manage your brand deals, campaigns, and contract values.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition shadow-sm self-start sm:self-auto"
        >
          + Add Sponsorship
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm">Total Deals</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {totalSponsorships}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm">Active Campaigns</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {activeSponsorships}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm">Total Contract Value</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            ₹{totalValue.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Sponsorship List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Brand Campaigns
          </h2>

          <span className="text-sm text-gray-500">
            {sponsorships.length} items
          </span>
        </div>

        {sponsorships.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
                <tr>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Campaign</th>
                  <th className="p-4">Contract Value</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm">
                {sponsorships.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900">
                      {item.brand_name}
                    </td>

                    <td className="p-4 text-gray-700">{item.campaign}</td>

                    <td className="p-4 font-semibold text-gray-900">
                      ₹{Number(item.contract_value).toLocaleString()}
                    </td>

                    <td className="p-4 text-gray-500 text-xs">
                      {item.start_date} to {item.end_date}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          item.payment_status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : item.payment_status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.payment_status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="px-3 py-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-700">
              No sponsorships found.
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Click "+ Add Sponsorship" above to create your first deal.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Sponsorship" : "Add Sponsorship"}
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Form Error */}
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Brand Name *
                </label>

                <input
                  type="text"
                  required
                  value={formData.brand_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brand_name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Campaign Name *
                </label>

                <input
                  type="text"
                  required
                  value={formData.campaign}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      campaign: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  placeholder="e.g. Summer Launch"
                />
              </div>

              {/* Contract Value */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Contract Value (₹) *
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formData.contract_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contract_value: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  placeholder="e.g. 50000"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Start Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    End Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  >
                    <option value="Active">Active</option>

                    <option value="Completed">Completed</option>

                    <option value="Paused">Paused</option>

                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Payment Status
                  </label>

                  <select
                    value={formData.payment_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none"
                  >
                    <option value="Pending">Pending</option>

                    <option value="Paid">Paid</option>

                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingId
                      ? "Update Sponsorship"
                      : "Create Sponsorship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sponsorships;
