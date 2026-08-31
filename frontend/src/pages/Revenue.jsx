import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/KpiCard";
import Modal from "../components/Modal";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sources = ["Sponsorship", "Ad Revenue", "Affiliate Marketing", "Brand Collaboration", "Subscription"];
const emptyForm = { creator_id: "", source: sources[0], amount: "", description: "", date: "" };

export default function Revenue() {
  const [summary, setSummary] = useState(null);
  const [revenueList, setRevenueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const fetchAll = async () => {
    try {
      const [summaryRes, listRes] = await Promise.all([
        api.get("/analytics/revenue"),
        api.get("/revenue"),
      ]);
      setSummary(summaryRes.data);
      setRevenueList(listRes.data);
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
    setForm({ ...item });
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "amount" || name === "creator_id" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/revenue/${editingId}`, form);
      } else {
        await api.post("/revenue", form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/revenue/${id}`);
    fetchAll();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!summary) return null;

  const sourceData = Object.entries(summary.revenue_by_source).map(([source, amount]) => ({ source, amount }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
        <button onClick={openCreate} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
          + Add Revenue
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <KpiCard label="Total Revenue" value={`₹${summary.total_revenue.toLocaleString()}`} />
      </div>

      <div className="p-5 mb-8 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Revenue by Source</h3>
        {sourceData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sourceData}>
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-5 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Revenue Records</h3>
        {revenueList.length === 0 ? (
          <EmptyState message="No revenue records yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Source</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Description</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {revenueList.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{r.source}</td>
                  <td className="py-2">₹{r.amount.toLocaleString()}</td>
                  <td className="py-2">{r.description || "-"}</td>
                  <td className="py-2">{r.date}</td>
                  <td className="py-2 space-x-3">
                    <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <ConfirmDeleteButton onConfirm={() => handleDelete(r.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Revenue" : "Add Revenue"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <input name="creator_id" type="number" placeholder="Creator ID" className="w-full px-3 py-2 border rounded"
              value={form.creator_id} onChange={handleChange} required />
            <select name="source" className="w-full px-3 py-2 border rounded" value={form.source} onChange={handleChange}>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input name="amount" type="number" placeholder="Amount" className="w-full px-3 py-2 border rounded"
              value={form.amount} onChange={handleChange} required min={0.01} step="0.01" />
            <input name="description" placeholder="Description" className="w-full px-3 py-2 border rounded"
              value={form.description} onChange={handleChange} />
            <input name="date" type="date" className="w-full px-3 py-2 border rounded"
              value={form.date} onChange={handleChange} required />

            <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
              {editingId ? "Update" : "Create"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}