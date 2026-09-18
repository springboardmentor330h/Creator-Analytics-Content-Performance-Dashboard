function Header({ title = "Overview" }) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#111111] px-6 lg:px-8">

      {/* Left */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Creator analytics dashboard
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-white/10 bg-[#181818] px-4 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
          />
        </div>

        {/* Notification */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
          title="Notifications"
        >
          <span className="text-lg">🔔</span>

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-purple-500" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-white/10" />

        {/* Profile */}
        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
            C
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              Creator
            </p>

            <p className="text-xs text-gray-500">
              Creator Account
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Header;