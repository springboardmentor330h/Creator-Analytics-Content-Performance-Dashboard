import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function Reports() {
  const { creatorId } = useCreator();
  const base = "http://localhost:8000";

  const links = [
    { label: "Content Report PDF", url: base + "/reports/content/pdf/" + creatorId },
    { label: "Content Report Excel", url: base + "/reports/content/excel/" + creatorId },
    { label: "Audience Report Excel", url: base + "/reports/audience/excel/" + creatorId },
    { label: "Revenue Report Excel", url: base + "/reports/revenue/excel/" + creatorId },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Reports and Export</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {links.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="rounded-xl bg-white p-4 shadow hover:bg-indigo-50">
                <p className="font-medium text-indigo-700">{link.label}</p>
                <p className="text-sm text-gray-500">Click to download</p>
              </a>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}