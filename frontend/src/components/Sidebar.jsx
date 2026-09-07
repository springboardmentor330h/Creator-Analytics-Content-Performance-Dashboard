import { NavLink } from 'react-router-dom'

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Content Analytics', path: '/content' },
    { name: 'Audience Analytics', path: '/audience' },
    { name: 'Growth & Trends', path: '/growth' },
    { name: 'Revenue', path: '/revenue' },
    { name: 'Sponsorships', path: '/sponsorships' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Reports', path: '/reports' },
    { name: 'Profile', path: '/profile' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-gray-900 p-5 text-white">
      <h1 className="mb-8 text-2xl font-bold">
        CreatorIQ
      </h1>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 transition ${
                isActive
                  ? 'bg-gray-700'
                  : 'hover:bg-gray-800'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar