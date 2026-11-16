
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Wallet,
  Receipt,
  ShoppingBag,
  Search,
  CalendarDays,
  Download,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";

const ORDER_API = "http://localhost:5000/api/orders";
const BILL_API = "http://localhost:5000/api/bills";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("adminToken");

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Fetch Reports Data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [orderRes, billRes] = await Promise.all([
        axios.get(ORDER_API, { headers }),
        axios.get(BILL_API, { headers }),
      ]);

      setOrders(orderRes.data.orders || []);
      setBills(billRes.data.bills || []);
    } catch (error) {
      console.error("Reports fetch error:", error);
      alert("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Date Filter
  const isWithinDate = (date) => {
    if (!date) return false;

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return false;

    if (startDate) {
      const start = new Date(startDate + "T00:00:00");
      if (value < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate + "T23:59:59.999");
      if (value > end) return false;
    }

    return true;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name = order.customer?.name || "";
      const number = order.orderNumber || "";
      const mobile = order.customer?.mobile || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        number.toLowerCase().includes(search.toLowerCase()) ||
        mobile.includes(search);

      return (
        isWithinDate(order.createdAt || order.deliveryDate) &&
        matchesSearch
      );
    });
  }, [orders, startDate, endDate, search]);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const name = bill.customer?.name || "";
      const invoice = bill.invoiceNumber || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        invoice.toLowerCase().includes(search.toLowerCase());

      return isWithinDate(bill.billDate || bill.createdAt) &&
        matchesSearch;
    });
  }, [bills, startDate, endDate, search]);

  // Summary Calculations
  const totalOrders = filteredOrders.length;

  const completedOrders = filteredOrders.filter(
    (order) => order.status === "Completed" ||
      order.status === "Delivered"
  ).length;

  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "Pending"
  ).length;

  const totalOrderValue = filteredOrders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

  const totalCollected = filteredBills.reduce(
    (sum, bill) => sum + Number(bill.paidAmount || 0),
    0
  );

  const totalPending = filteredBills.reduce(
    (sum, bill) => sum + Number(bill.balanceAmount || 0),
    0
  );

  const paidBills = filteredBills.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;

  const partialBills = filteredBills.filter(
    (bill) => bill.paymentStatus === "Partial"
  ).length;

  const pendingBills = filteredBills.filter(
    (bill) => bill.paymentStatus === "Pending"
  ).length;

  // Monthly Revenue (Last 6 Months)
  const monthlyData = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const month = date.getMonth();
      const year = date.getFullYear();

      const revenue = bills
        .filter((bill) => {
          const billDate = new Date(
            bill.billDate || bill.createdAt
          );

          return (
            !Number.isNaN(billDate.getTime()) &&
            billDate.getMonth() === month &&
            billDate.getFullYear() === year
          );
        })
        .reduce(
          (sum, bill) => sum + Number(bill.paidAmount || 0),
          0
        );

      result.push({
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        revenue,
      });
    }

    return result;
  }, [bills]);

  const maxRevenue = Math.max(
    ...monthlyData.map((item) => item.revenue),
    1
  );

  // Order Status
  const orderStatuses = [
    "Pending",
    "In Progress",
    "Ready",
    "Delivered",
    "Completed",
    "Cancelled",
  ];

  const statusColors = {
    Pending: "bg-yellow-400",
    "In Progress": "bg-blue-400",
    Ready: "bg-green-400",
    Delivered: "bg-purple-400",
    Completed: "bg-emerald-400",
    Cancelled: "bg-red-400",
  };

  const getStatusCount = (status) =>
    filteredOrders.filter(
      (order) => order.status === status
    ).length;

  // Clear Filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
  };

  // Export CSV
  const exportCSV = () => {
    const rows = [
      [
        "Invoice Number",
        "Customer",
        "Mobile",
        "Total Amount",
        "Paid Amount",
        "Balance",
        "Payment Status",
        "Payment Method",
        "Date",
      ],
      ...filteredBills.map((bill) => [
        bill.invoiceNumber || "",
        bill.customer?.name || "",
        bill.customer?.mobile || "",
        bill.totalAmount || 0,
        bill.paidAmount || 0,
        bill.balanceAmount || 0,
        bill.paymentStatus || "",
        bill.paymentMethod || "",
        new Date(
          bill.billDate || bill.createdAt
        ).toLocaleDateString("en-IN"),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Unique-Tailor-Reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#080B1A] text-white p-4 md:p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#b99554]/10">
              <BarChart3 size={27} className="text-[#d6ad60]" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Reports Management
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Business performance and financial reports
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer..."
                className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-10 pr-3 py-3 outline-none focus:border-[#b99554]"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-10 pr-3 py-3 text-white outline-none focus:border-[#b99554]"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-10 pr-3 py-3 text-white outline-none focus:border-[#b99554]"
              />
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {[
            {
              title: "Total Orders",
              value: totalOrders,
              icon: ShoppingBag,
            },
            {
              title: "Order Value",
              value: currency(totalOrderValue),
              icon: TrendingUp,
            },
            {
              title: "Total Collected",
              value: currency(totalCollected),
              icon: Wallet,
            },
            {
              title: "Pending Payments",
              value: currency(totalPending),
              icon: Receipt,
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-[#101D35] border border-white/10 rounded-2xl p-5"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    {card.title}
                  </p>

                  <Icon size={21} className="text-[#d6ad60]" />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-[#d6ad60] mt-3">
                  {loading ? "..." : card.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl p-5 mb-6">

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold">
                Monthly Revenue
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Payments collected over the last 6 months
              </p>
            </div>

            <TrendingUp className="text-[#d6ad60]" size={22} />
          </div>

          <div className="flex items-end justify-between gap-3 h-48 px-2">

            {monthlyData.map((item) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center justify-end h-full gap-2"
              >
                <span className="text-[10px] sm:text-xs text-gray-400">
                  {currency(item.revenue)}
                </span>

                <div
                  className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-[#b99554] to-[#e2c17d] transition-all duration-500"
                  style={{
                    height: `${Math.max(
                      (item.revenue / maxRevenue) * 100,
                      3
                    )}%`,
                  }}
                />

                <span className="text-xs text-gray-400">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order and Payment Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Order Status */}
          <div className="bg-[#101D35] border border-white/10 rounded-2xl p-5">

            <h2 className="text-lg font-bold mb-1">
              Order Status Report
            </h2>

            <p className="text-xs text-gray-400 mb-6">
              Current order distribution
            </p>

            <div className="space-y-5">

              {orderStatuses.map((status) => {
                const count = getStatusCount(status);

                const percentage = totalOrders
                  ? (count / totalOrders) * 100
                  : 0;

                return (
                  <div key={status}>

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">
                        {status}
                      </span>

                      <span className="text-[#d6ad60] font-semibold">
                        {count}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#080B1A] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-[#101D35] border border-white/10 rounded-2xl p-5">

            <h2 className="text-lg font-bold mb-1">
              Payment Status Report
            </h2>

            <p className="text-xs text-gray-400 mb-6">
              Invoice payment summary
            </p>

            <div className="space-y-4">

              {[
                {
                  title: "Paid Invoices",
                  count: paidBills,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                },
                {
                  title: "Partial Payments",
                  count: partialBills,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                },
                {
                  title: "Pending Payments",
                  count: pendingBills,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`${item.bg} rounded-xl p-5 flex justify-between items-center`}
                >
                  <span className="text-sm text-gray-300">
                    {item.title}
                  </span>

                  <span className={`text-2xl font-bold ${item.color}`}>
                    {item.count}
                  </span>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="text-gray-400 text-sm">
                  Total Invoices
                </span>

                <span className="font-bold text-[#d6ad60]">
                  {filteredBills.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl overflow-hidden mb-6">

          <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-bold">
              Recent Orders Report
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Order details based on selected filters
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">

              <thead className="bg-[#17143A] text-gray-300 text-sm">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400">
                      Loading reports...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(0, 10).map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-4 text-[#d6ad60] font-semibold">
                        {order.orderNumber || order.trackId || "N/A"}
                      </td>

                      <td className="p-4">
                        <p className="font-medium">
                          {order.customer?.name || "Customer"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {order.customer?.mobile || ""}
                        </p>
                      </td>

                      <td className="p-4 text-sm text-gray-300">
                        {new Date(
                          order.createdAt || order.deliveryDate
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="p-4 font-semibold">
                        {currency(order.totalAmount)}
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                          statusColors[order.status]
                            ? `${statusColors[order.status]}/10`
                            : "bg-gray-500/10"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="bg-[#101D35] border border-[#b99554]/20 rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-[#d6ad60]" size={22} />

            <h2 className="font-bold">
              Business Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <p className="text-sm text-gray-400">
                Completed Orders
              </p>

              <h3 className="text-xl font-bold text-green-400 mt-1">
                {completedOrders}
              </h3>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Pending Orders
              </p>

              <h3 className="text-xl font-bold text-yellow-400 mt-1">
                {pendingOrders}
              </h3>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Total Invoices
              </p>

              <h3 className="text-xl font-bold text-[#d6ad60] mt-1">
                {filteredBills.length}
              </h3>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
