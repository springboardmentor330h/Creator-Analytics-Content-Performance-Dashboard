import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <Sidebar />

      <div className="min-h-screen min-w-0 lg:ml-64">
        <Header />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;