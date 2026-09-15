function Sidebar({ onNavigate, currentPage = "Dashboard" }) {
  const menuItems = [
    "Dashboard",
    "Content Analytics",
    "Audience Analytics",
    "Growth & Trends",
    "Revenue",
    "Sponsorships",
    "Notifications",
    "Reports",
    "Profile / Settings",
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8 px-3">
        <h2 className="text-2xl font-bold tracking-tight">CreatorIQ</h2>
      </div>

      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentPage === item;
          return (
            <p
              key={item}
              onClick={() => onNavigate(item)}
              className={`px-3 py-2.5 rounded-xl transition cursor-pointer text-sm font-medium ${
                isActive
                  ? "bg-gray-800 text-white font-semibold shadow-sm border-l-4 border-white"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
              }`}
            >
              {item}
            </p>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;

