
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Scissors,
  Clock,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

import AdminLayout from "../components/admin/AdminLayout";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data.stats);
      } catch (err) {
        if (err.response?.status === 401) {
          sessionStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          setError("Unable to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Dashboard cards
  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: Scissors,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "In Progress",
      value: stats.inProgressOrders,
      icon: RefreshCw,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div>
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-widest uppercase text-[#b18a46]">
            Overview
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#e5edff] md:text-3xl">
            Welcome Back, Admin!
          </h2>

          <p className="mt-2 text-gray-400">
            Manage your tailoring business with ease.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="mb-5 text-gray-400">
            Loading dashboard data...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mb-5 text-red-400">{error}</p>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#171b35] to-[#101d35] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#b99554]/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      {card.title}
                    </p>

                    <h3 className="mt-3 text-3xl font-semibold text-white">
                      {loading ? "—" : card.value}
                    </h3>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg}`}
                  >
                    <Icon
                      size={26}
                      className={card.color}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1127] via-[#17143A] to-[#101D35] p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Recent Orders
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Your latest tailoring orders
              </p>
            </div>

            <span className="text-sm font-medium text-[#d6ad60]">
              Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left">
              <thead>
                <tr className="bg-[#202642] text-sm text-white">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Track ID</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Delivery Date</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center text-sm text-gray-400"
                  >
                    Recent orders will appear here once orders are added.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-500">
          © 2026 Unique Tailor. All rights reserved.
        </footer>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
