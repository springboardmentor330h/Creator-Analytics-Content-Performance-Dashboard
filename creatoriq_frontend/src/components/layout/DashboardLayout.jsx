import { Outlet } from "react-router";

import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout() {
  return (
    <div className="dashboard-layout flex min-h-screen bg-[#07111f]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="dashboard-main p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;