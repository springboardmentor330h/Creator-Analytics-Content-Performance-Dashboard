import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/KpiCard";
import Modal from "../components/Modal";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const emptyForm = {
  creator_id: "", platform: "", content_title: "", views: 0, likes: 0,
  comments: 0, shares: 0, saves: 0, watch_time: 0, reach: 0, published_date: "",
};

export default function Content() {
  const [summary, setSummary] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const fetchAll = async () => {
    try {
      const [summaryRes, listRes, chartRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/content"),
        api.get("/analytics/chart/engagement"),
      ]);
      setSummary(summaryRes.data);
      setContentList(listRes.data);
      setChartData(chartRes.data.labels.map((l, i) => ({ date: l, engagement: chartRes.data.values[i] })));
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
    const numericFields = ["creator_id", "views", "likes", "comments", "shares", "saves", "watch_time", "reach"];
    setForm({ ...form, [name]: numericFields.includes(name) ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/content/${editingId}`, form);
      } else {
        await api.post("/content", form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/content/${id}`);
    fetchAll();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Content Analytics</h2>
        <button onClick={openCreate} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
          + Add Content
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <KpiCard label="Total Views" value={summary.total_views.toLocaleString()} />
        <KpiCard label="Total Likes" value={summary.total_likes.toLocaleString()} />
        <KpiCard label="Total Comments" value={summary.total_comments.toLocaleString()} />
        <KpiCard label="Total Shares" value={summary.total_shares.toLocaleString()} />
      </div>

      <div className="p-5 mb-8 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Engagement Rate Over Time</h3>
        {chartData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="engagement" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-5 bg-white rounded-lg shadow">
        <h3 className="mb-4 font-semibold">All Content</h3>
        {contentList.length === 0 ? (
          <EmptyState message="No content yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Title</th>
                  <th className="py-2">Platform</th>
                  <th className="py-2">Views</th>
                  <th className="py-2">Likes</th>
                  <th className="py-2">Published</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contentList.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.content_title}</td>
                    <td className="py-2">{c.platform}</td>
                    <td className="py-2">{c.views.toLocaleString()}</td>
                    <td className="py-2">{c.likes.toLocaleString()}</td>
                    <td className="py-2">{c.published_date}</td>
                    <td className="py-2 space-x-3">
                      <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline">
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(c.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Content" : "Add Content"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <input name="creator_id" type="number" placeholder="Creator ID" className="w-full px-3 py-2 border rounded"
              value={form.creator_id} onChange={handleChange} required />
            <input name="platform" placeholder="Platform (e.g. YouTube)" className="w-full px-3 py-2 border rounded"
              value={form.platform} onChange={handleChange} required />
            <input name="content_title" placeholder="Content Title" className="w-full px-3 py-2 border rounded"
              value={form.content_title} onChange={handleChange} required minLength={3} />

            <div className="grid grid-cols-2 gap-3">
              <input name="views" type="number" placeholder="Views" className="px-3 py-2 border rounded"
                value={form.views} onChange={handleChange} min={0} />
              <input name="likes" type="number" placeholder="Likes" className="px-3 py-2 border rounded"
                value={form.likes} onChange={handleChange} min={0} />
              <input name="comments" type="number" placeholder="Comments" className="px-3 py-2 border rounded"
                value={form.comments} onChange={handleChange} min={0} />
              <input name="shares" type="number" placeholder="Shares" className="px-3 py-2 border rounded"
                value={form.shares} onChange={handleChange} min={0} />
              <input name="saves" type="number" placeholder="Saves" className="px-3 py-2 border rounded"
                value={form.saves} onChange={handleChange} min={0} />
              <input name="watch_time" type="number" placeholder="Watch Time" className="px-3 py-2 border rounded"
                value={form.watch_time} onChange={handleChange} min={0} />
              <input name="reach" type="number" placeholder="Reach" className="px-3 py-2 border rounded"
                value={form.reach} onChange={handleChange} min={0} />
              <input name="published_date" type="date" className="px-3 py-2 border rounded"
                value={form.published_date} onChange={handleChange} required />
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