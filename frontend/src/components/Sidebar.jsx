import { NavLink } from 'react-router-dom'

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '▦' },
    { name: 'Content Analytics', path: '/content', icon: '▶' },
    { name: 'Audience Analytics', path: '/audience', icon: '♙' },
    { name: 'Growth & Trends', path: '/growth', icon: '↗' },
    { name: 'Revenue', path: '/revenue', icon: '₹' },
    { name: 'Sponsorships', path: '/sponsorships', icon: '♧' },
    { name: 'Notifications', path: '/notifications', icon: '♢' },
    { name: 'Reports', path: '/reports', icon: '▤' },
    { name: 'Profile', path: '/profile', icon: '●' },
  ]

  return (
    <aside className="min-h-screen w-64 bg-[#172554] p-5 text-white shadow-xl">

      {/* Logo */}
      <div className="mb-10 border-b border-blue-300/20 pb-6">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <span className="text-lg font-extrabold text-white">
              CI
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              CreatorIQ
            </h1>

            <p className="text-xs text-blue-200">
              Analytics Platform
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">

        <p className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-blue-300">
          Main Menu
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`
            }
          >
            {/* White Icon */}
            <span className="mr-3 flex w-7 items-center justify-center text-lg font-bold text-white transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>

            {/* Menu name */}
            <span className="text-sm font-medium">
              {item.name}
            </span>

          </NavLink>
        ))}

      </nav>

    </aside>
  )
}

export default Sidebar