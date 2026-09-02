import { useEffect, useState } from "react";
import api from "../api/axios";
import KpiCard from "../components/KpiCard";
import Modal from "../components/Modal";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import PlatformSelector from "../components/PlatformSelector";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ALL_PLATFORMS = ["YouTube", "Instagram", "TikTok", "Facebook", "LinkedIn", "Twitter", "Threads", "Pinterest", "Snapchat", "Twitch"];
const emptyForm = { creator_id: "", platform: "", content_title: "", views: 0, likes: 0, comments: 0, shares: 0, saves: 0, watch_time: 0, reach: 0, published_date: "" };

export default function Content() {
  const [summary, setSummary] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const fetchAll = async () => {
    try {
      const params = selectedPlatform ? { platform: selectedPlatform } : {};
      const [s, l, c] = await Promise.all([
        api.get("/analytics/summary", { params }),
        api.get("/content", { params }),
        api.get("/analytics/chart/engagement", { params }),
      ]);
      setSummary(s.data);
      setContentList(l.data);
      setChartData(c.data.labels.map((d, i) => ({ date: d, engagement: c.data.values[i] })));
    } catch { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [selectedPlatform]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormError(""); setShowModal(true); };
  const openEdit = (item) => { setEditingId(item.id); setForm({ ...item }); setFormError(""); setShowModal(true); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numeric = ["creator_id", "views", "likes", "comments", "shares", "saves", "watch_time", "reach"];
    setForm({ ...form, [name]: numeric.includes(name) ? Number(value) : value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError("");
    try {
      if (editingId) await api.put(`/content/${editingId}`, form);
      else await api.post("/content", form);
      setShowModal(false); fetchAll();
    } catch (err) { setFormError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Save failed."); }
  };
  const handleDelete = async (id) => { await api.delete(`/content/${id}`); fetchAll(); };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Analytics</h2>
        <div className="flex items-center gap-3">
          <PlatformSelector platforms={ALL_PLATFORMS} selected={selectedPlatform} onChange={setSelectedPlatform} />
          <button onClick={openCreate} className="px-4 py-2 text-sm text-white transition rounded-lg bg-brand-600 hover:bg-brand-700">+ Add Content</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <KpiCard label="Total Views" value={summary.total_views.toLocaleString()} color="blue" />
        <KpiCard label="Total Likes" value={summary.total_likes.toLocaleString()} color="pink" />
        <KpiCard label="Total Comments" value={summary.total_comments.toLocaleString()} color="purple" />
        <KpiCard label="Total Shares" value={summary.total_shares.toLocaleString()} color="orange" />
      </div>

      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Engagement Rate Over Time</h3>
        {chartData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide /><YAxis />
              <Tooltip contentStyle={{ borderRadius: "12px" }} />
              <Line type="monotone" dataKey="engagement" stroke="#3b6fed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">All Content</h3>
        {contentList.length === 0 ? <EmptyState message="No content yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:text-gray-500 dark:border-gray-700">
                  <th className="py-2">Title</th><th className="py-2">Platform</th><th className="py-2">Views</th><th className="py-2">Likes</th><th className="py-2">Published</th><th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contentList.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-2 text-gray-800 dark:text-gray-200">{c.content_title}</td>
                    <td className="py-2"><span className="px-2 py-1 text-xs rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">{c.platform}</span></td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{c.views.toLocaleString()}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{c.likes.toLocaleString()}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{c.published_date}</td>
                    <td className="py-2 space-x-3">
                      <button onClick={() => openEdit(c)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Edit</button>
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
            <input name="creator_id" type="number" placeholder="Creator ID" className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.creator_id} onChange={handleChange} required />
            <input name="platform" placeholder="Platform" className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.platform} onChange={handleChange} required />
            <input name="content_title" placeholder="Content Title" className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.content_title} onChange={handleChange} required minLength={3} />
            <div className="grid grid-cols-2 gap-3">
              {["views","likes","comments","shares","saves","watch_time","reach"].map((f) => (
                <input key={f} name={f} type="number" placeholder={f} className="px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form[f]} onChange={handleChange} min={0} />
              ))}
              <input name="published_date" type="date" className="px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={form.published_date} onChange={handleChange} required />
            </div>
            <button type="submit" className="w-full py-2 text-white transition rounded-lg bg-brand-600 hover:bg-brand-700">{editingId ? "Update" : "Create"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}