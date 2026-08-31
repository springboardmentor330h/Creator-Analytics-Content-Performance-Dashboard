import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";

const statusColors = { active: "bg-green-100 text-green-700", completed: "bg-blue-100 text-blue-700", cancelled: "bg-red-100 text-red-700" };
const paymentColors = { paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", overdue: "bg-red-100 text-red-700" };

const emptyForm = {
  creator_id: "", brand_name: "", campaign_name: "", contract_value: "",
  start_date: "", end_date: "", status: "active", payment_status: "pending",
};

export default function Sponsorships() {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const fetchAll = async () => {
    try {
      const res = await api.get("/sponsorships");
      setSponsorships(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, end_date: item.end_date || "" });
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "contract_value" || name === "creator_id" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const payload = { ...form, end_date: form.end_date || null };
      if (editingId) {
        await api.put(`/sponsorships/${editingId}`, payload);
      } else {
        await api.post("/sponsorships", payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/sponsorships/${id}`);
    fetchAll();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sponsorships</h2>
        <button onClick={openCreate} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
          + Add Sponsorship
        </button>
      </div>

      <div className="p-5 bg-white rounded-lg shadow">
        {sponsorships.length === 0 ? (
          <EmptyState message="No sponsorships yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Brand</th>
                <th className="py-2">Campaign</th>
                <th className="py-2">Value</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payment</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{s.brand_name}</td>
                  <td className="py-2">{s.campaign_name}</td>
                  <td className="py-2">₹{s.contract_value.toLocaleString()}</td>
                  <td className="py-2">{s.start_date}</td>
                  <td className="py-2">{s.end_date || "-"}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[s.status] || "bg-gray-100"}`}>{s.status}</span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${paymentColors[s.payment_status] || "bg-gray-100"}`}>{s.payment_status}</span>
                  </td>
                  <td className="py-2 space-x-3">
                    <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <ConfirmDeleteButton onConfirm={() => handleDelete(s.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Sponsorship" : "Add Sponsorship"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <input name="creator_id" type="number" placeholder="Creator ID" className="w-full px-3 py-2 border rounded"
              value={form.creator_id} onChange={handleChange} required />
            <input name="brand_name" placeholder="Brand Name" className="w-full px-3 py-2 border rounded"
              value={form.brand_name} onChange={handleChange} required minLength={2} />
            <input name="campaign_name" placeholder="Campaign Name" className="w-full px-3 py-2 border rounded"
              value={form.campaign_name} onChange={handleChange} required minLength={2} />
            <input name="contract_value" type="number" placeholder="Contract Value" className="w-full px-3 py-2 border rounded"
              value={form.contract_value} onChange={handleChange} required min={0.01} step="0.01" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Start Date</label>
                <input name="start_date" type="date" className="w-full px-3 py-2 border rounded"
                  value={form.start_date} onChange={handleChange} required />
              </div>
              <div>
                <label className="text-xs text-gray-500">End Date (optional)</label>
                <input name="end_date" type="date" className="w-full px-3 py-2 border rounded"
                  value={form.end_date} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select name="status" className="px-3 py-2 border rounded" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select name="payment_status" className="px-3 py-2 border rounded" value={form.payment_status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
              {editingId ? "Update" : "Create"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}