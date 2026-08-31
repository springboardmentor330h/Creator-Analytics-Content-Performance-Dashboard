import api from "../api/axios";

export default function Reports() {
  const downloadFile = async (type) => {
    const res = await api.get(`/reports/export/${type}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `creatoriq_report.${type === "pdf" ? "pdf" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reports & Export</h2>
      <div className="bg-white rounded-lg shadow p-6 flex gap-4">
        <button
          onClick={() => downloadFile("pdf")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Download PDF Report
        </button>
        <button
          onClick={() => downloadFile("excel")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download Excel Report
        </button>
      </div>
    </div>
  );
}