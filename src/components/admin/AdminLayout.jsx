
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ruler,
  ClipboardList,
  Receipt,
  ChartNoAxesCombined,
  LogOut,
  Scissors,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Measurements", path: "/admin/measurements", icon: Ruler },
    { name: "Orders", path: "/admin/orders", icon: ClipboardList },
    { name: "Billing", path: "/admin/billing", icon: Receipt },
    { name: "Report", path: "/admin/Report", icon: ChartNoAxesCombined },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080B1A] via-[#17143A] to-[#101D35] md:flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Common Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col
        border-r border-white/10
        bg-gradient-to-b from-[#0a0d1f] via-[#17143A] to-[#101D35]
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:sticky md:translate-x-0`}
      >
        {/* Logo */}
        <div className="border-b border-white/10 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mt-3 text-2xl font-semibold text-white">
                Unique Tailor
              </h1>
              <p className="mt-1 text-xs tracking-widest text-gray-400">
                ADMIN PANEL
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white md:hidden"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-4 px-4 text-xs tracking-widest text-gray-500">
            MENU
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `mb-2 flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#b99554] to-[#d6ad60] text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={1.8} />
                    <span className="text-sm font-medium">{item.name}</span>
                    {isActive && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/10 hover:text-red-400"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#080B1A]/40 px-5 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white md:hidden"
            >
              <Menu size={25} />
            </button>

            <div>
              <p className="text-sm font-semibold tracking-widest text-white">
                UNIQUE TAILOR / ADMIN
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Tailoring Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#566072] font-semibold text-white">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm text-white">Admin</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
