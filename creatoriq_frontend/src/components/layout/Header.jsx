function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Creator Analytics Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-medium text-slate-800">
            Harsh Kumar
          </p>

          <p className="text-sm text-slate-500">
            Creator
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          H
        </div>
      </div>
    </header>
  );
}

export default Header;