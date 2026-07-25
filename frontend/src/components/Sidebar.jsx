export default function Sidebar() {
  const items = ["Overview", "Content Analytics", "Audience", "Revenue", "Reports"];
  return (
    <aside className="w-56 bg-indigo-700 text-white p-4">
      <h2 className="mb-6 text-lg font-bold">CreatorIQ</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="cursor-pointer rounded px-3 py-2 hover:bg-indigo-600">
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}