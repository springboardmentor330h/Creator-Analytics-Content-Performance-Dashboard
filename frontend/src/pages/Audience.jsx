import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/KpiCard";
import Modal from "../components/Modal";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#9333ea", "#0891b2"];
const emptyForm = {
  creator_id: "", age_group: "", gender: "", country: "", city: "",
  device_type: "", active_hour: 0, followers: 0, impressions: 0, reach: 0,
};

export default function Audience() {
  const [report, setReport] = useState(null);
  const [audienceList, setAudienceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const fetchAll = async () => {
    try {
      const [reportRes, listRes] = await Promise.all([
        api.get("/analytics/audience"),
        api.get("/audience"),
      ]);
      setReport(reportRes.data);
      setAudienceList(listRes.data);
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
    const numericFields = ["creator_id", "active_hour", "followers", "impressions", "reach"];
    setForm({ ...form, [name]: numericFields.includes(name) ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/audience/${editingId}`, form);
      } else {
        await api.post("/audience", form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/audience/${id}`);
    fetchAll();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!report) return null;

  const genderData = Object.entries(report.gender_distribution || {}).map(([name, value]) => ({ name, value }));
  const ageData = Object.entries(report.age_distribution || {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Audience Analytics</h2>
        <button onClick={openCreate} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
          + Add Audience Segment
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <KpiCard label="Total Followers" value={report.total_followers.toLocaleString()} />
        <KpiCard label="Total Reach" value={report.total_reach.toLocaleString()} />
        <KpiCard label="Total Impressions" value={report.total_impressions.toLocaleString()} />
        <KpiCard label="Top Device" value={report.top_device || "N/A"} />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="mb-4 font-semibold">Gender Distribution (%)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={75} label>
                {genderData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="mb-4 font-semibold">Age Distribution (%)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={ageData} dataKey="value" nameKey="name" outerRadius={75} label>
                {ageData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Audience Segments</h3>
        {audienceList.length === 0 ? (
          <EmptyState message="No audience data yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Age Group</th>
                  <th className="py-2">Gender</th>
                  <th className="py-2">Country</th>
                  <th className="py-2">City</th>
                  <th className="py-2">Device</th>
                  <th className="py-2">Followers</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {audienceList.slice(0, 20).map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2">{a.age_group}</td>
                    <td className="py-2">{a.gender}</td>
                    <td className="py-2">{a.country}</td>
                    <td className="py-2">{a.city}</td>
                    <td className="py-2">{a.device_type}</td>
                    <td className="py-2">{a.followers.toLocaleString()}</td>
                    <td className="py-2 space-x-3">
                      <button onClick={() => openEdit(a)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(a.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {audienceList.length > 20 && (
              <p className="mt-3 text-xs text-gray-400">Showing 20 of {audienceList.length} records.</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Audience Segment" : "Add Audience Segment"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <input name="creator_id" type="number" placeholder="Creator ID" className="w-full px-3 py-2 border rounded"
              value={form.creator_id} onChange={handleChange} required />

            <div className="grid grid-cols-2 gap-3">
              <input name="age_group" placeholder="Age Group (e.g. 18-24)" className="px-3 py-2 border rounded"
                value={form.age_group} onChange={handleChange} required />
              <select name="gender" className="px-3 py-2 border rounded" value={form.gender} onChange={handleChange} required>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input name="country" placeholder="Country" className="px-3 py-2 border rounded"
                value={form.country} onChange={handleChange} required />
              <input name="city" placeholder="City" className="px-3 py-2 border rounded"
                value={form.city} onChange={handleChange} required />
              <select name="device_type" className="px-3 py-2 border rounded" value={form.device_type} onChange={handleChange} required>
                <option value="">Device</option>
                <option value="Mobile">Mobile</option>
                <option value="Desktop">Desktop</option>
                <option value="Tablet">Tablet</option>
              </select>
              <input name="active_hour" type="number" placeholder="Active Hour (0-23)" className="px-3 py-2 border rounded"
                value={form.active_hour} onChange={handleChange} min={0} max={23} required />
              <input name="followers" type="number" placeholder="Followers" className="px-3 py-2 border rounded"
                value={form.followers} onChange={handleChange} min={0} />
              <input name="impressions" type="number" placeholder="Impressions" className="px-3 py-2 border rounded"
                value={form.impressions} onChange={handleChange} min={0} />
              <input name="reach" type="number" placeholder="Reach" className="px-3 py-2 border rounded"
                value={form.reach} onChange={handleChange} min={0} />
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