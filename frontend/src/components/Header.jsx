function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Monitor your creator performance
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 hover:bg-gray-100">
          🔔
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white">
            U
          </div>

          <div>
            <p className="font-medium text-gray-800">User</p>
            <p className="text-xs text-gray-500">Creator</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header