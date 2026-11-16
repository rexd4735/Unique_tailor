
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  X,
  CreditCard,
  Wallet,
  FileText,
  Printer,
  Save,
  Eye,
  User,
  CalendarDays,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";

const BILL_API = "http://localhost:5000/api/bills";
const ORDER_API = "http://localhost:5000/api/orders";

const emptyForm = {
  order: "",
  advanceAmount: 0,
  paymentMethod: "Cash",
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [orders, setOrders] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [paymentData, setPaymentData] = useState({
    paidAmount: "",
    paymentMethod: "Cash",
  });

  const [selectedBill, setSelectedBill] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = sessionStorage.getItem("adminToken");

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Fetch Bills and Orders
  const fetchData = async () => {
    try {
      setLoading(true);

      const [billRes, orderRes] = await Promise.all([
        axios.get(BILL_API, { headers }),
        axios.get(ORDER_API, { headers }),
      ]);

      setBills(billRes.data.bills || []);
      setOrders(orderRes.data.orders || []);
    } catch (error) {
      console.error("Fetch billing error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load billing data. Check backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Selected Order
  const selectedOrder = orders.find(
    (order) => order._id === formData.order
  );

  const totalAmount = Number(selectedOrder?.totalAmount || 0);
  const advanceAmount = Number(formData.advanceAmount || 0);
  const balanceAmount = totalAmount - advanceAmount;

  // Orders that do not have bills
  const availableOrders = orders.filter(
    (order) =>
      !bills.some(
        (bill) =>
          bill.order?._id === order._id ||
          bill.order === order._id
      )
  );

  // Search
  const filteredBills = useMemo(() => {
    const value = search.toLowerCase();

    return bills.filter((bill) => {
      const customerName = bill.customer?.name || "";
      const mobile = bill.customer?.mobile || "";
      const invoice = bill.invoiceNumber || "";
      const orderNumber = bill.order?.orderNumber || "";
      const customerId = bill.order?.customerId || "";

      return (
        invoice.toLowerCase().includes(value) ||
        customerName.toLowerCase().includes(value) ||
        mobile.includes(search) ||
        orderNumber.toLowerCase().includes(value) ||
        customerId.toLowerCase().includes(value)
      );
    });
  }, [bills, search]);

  // Dashboard Calculations
  const totalRevenue = bills.reduce(
    (sum, bill) => sum + Number(bill.paidAmount || 0),
    0
  );

  const pendingAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.balanceAmount || 0),
    0
  );

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;

  // Create Bill Modal
  const openCreateModal = () => {
    setFormData(emptyForm);
    setShowCreateModal(true);
  };

  // Create Bill
  const handleCreateBill = async (e) => {
    e.preventDefault();

    if (!formData.order) {
      alert("Please select an order.");
      return;
    }

    if (
      !Number.isFinite(advanceAmount) ||
      advanceAmount < 0 ||
      advanceAmount > totalAmount
    ) {
      alert("Please enter a valid advance amount.");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        BILL_API,
        {
          order: formData.order,
          advanceAmount,
          paymentMethod: formData.paymentMethod,
        },
        { headers }
      );

      setShowCreateModal(false);
      setFormData(emptyForm);

      await fetchData();

      alert("Bill created successfully!");
    } catch (error) {
      console.error("Create bill error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to create bill."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open Payment Modal
  const openPaymentModal = (bill) => {
    setSelectedBill(bill);

    setPaymentData({
      paidAmount: bill.paidAmount,
      paymentMethod: bill.paymentMethod || "Cash",
    });

    setShowPaymentModal(true);
  };

  // Update Payment
  const handlePaymentUpdate = async (e) => {
    e.preventDefault();

    const paid = Number(paymentData.paidAmount);

    if (
      !Number.isFinite(paid) ||
      paid < 0 ||
      paid > selectedBill.totalAmount
    ) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${BILL_API}/${selectedBill._id}`,
        {
          paidAmount: paid,
          paymentMethod: paymentData.paymentMethod,
        },
        { headers }
      );

      setShowPaymentModal(false);
      setSelectedBill(null);

      await fetchData();

      alert("Payment updated successfully!");
    } catch (error) {
      console.error("Payment update error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update payment."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Bill
  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) {
      return;
    }

    try {
      await axios.delete(`${BILL_API}/${id}`, { headers });

      await fetchData();

      alert("Bill deleted successfully!");
    } catch (error) {
      console.error("Delete bill error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete bill."
      );
    }
  };

  // View Invoice
  const openInvoice = (bill) => {
    setSelectedBill(bill);
    setShowInvoiceModal(true);
  };

  // Print Invoice
  const printInvoice = () => {
    window.print();
  };

  // Payment Status Style
  const statusStyle = (status) => {
    const styles = {
      Paid: "bg-green-500/10 text-green-400",
      Partial: "bg-yellow-500/10 text-yellow-400",
      Pending: "bg-red-500/10 text-red-400",
    };

    return styles[status] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <AdminLayout>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .invoice-print,
          .invoice-print * {
            visibility: visible !important;
          }

          .invoice-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#080B1A] text-white p-4 md:p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#b99554]/10">
              <Receipt size={27} className="text-[#d6ad60]" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Billing
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Manage invoices and customer payments
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold"
          >
            <Plus size={19} />
            Create Bill
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {[
            {
              title: "Total Invoices",
              value: bills.length,
              icon: FileText,
            },
            {
              title: "Total Collected",
              value: currency(totalRevenue),
              icon: Wallet,
            },
            {
              title: "Pending Amount",
              value: currency(pendingAmount),
              icon: CreditCard,
            },
            {
              title: "Paid Invoices",
              value: paidBills,
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
                  {card.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl p-4 mb-6">

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice, order number, customer name or mobile..."
              className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#b99554]"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">

              <thead className="bg-[#17143A] text-gray-300 text-sm">
                <tr>
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-10 text-center text-gray-400"
                    >
                      Loading bills...
                    </td>
                  </tr>
                ) : filteredBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-10 text-center text-gray-400"
                    >
                      No bills found.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr
                      key={bill._id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-4">
                        <p className="text-[#d6ad60] font-semibold">
                          {bill.invoiceNumber}
                        </p>

                        <p className="text-xs text-gray-400">
                          {new Date(bill.billDate).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-medium">
                          {bill.customer?.name || "Customer"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {bill.customer?.mobile || ""}
                        </p>
                      </td>

                      <td className="p-4 text-sm text-gray-300">
                        {bill.order?.orderNumber ||
                          bill.order?.trackId ||
                          "N/A"}
                      </td>

                      <td className="p-4 font-semibold">
                        {currency(bill.totalAmount)}
                      </td>

                      <td className="p-4 text-green-400">
                        {currency(bill.paidAmount)}
                      </td>

                      <td className="p-4 text-orange-400">
                        {currency(bill.balanceAmount)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-2 rounded-lg text-xs font-semibold ${statusStyle(
                            bill.paymentStatus
                          )}`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">

                          <button
                            onClick={() => openInvoice(bill)}
                            className="p-2 rounded-lg bg-[#b99554]/10 text-[#d6ad60] hover:bg-[#b99554]/20"
                            title="View Invoice"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            title="Update Payment"
                          >
                            <CreditCard size={17} />
                          </button>

                          <button
                            onClick={() => deleteBill(bill._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            title="Delete Bill"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Bill Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">

            <div className="bg-[#101D35] border border-[#b99554]/30 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

              <div className="sticky top-0 z-10 bg-[#101D35] border-b border-white/10 p-5 flex justify-between items-center">

                <div>
                  <h2 className="text-xl font-bold">
                    Create New Bill
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Generate invoice from existing order
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X size={21} />
                </button>
              </div>

              <form
                onSubmit={handleCreateBill}
                className="p-5 space-y-5"
              >

                {/* Select Order */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Select Order
                  </label>

                  <select
                    required
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: e.target.value,
                        advanceAmount: 0,
                      })
                    }
                    className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554]"
                  >
                    <option value="">Choose Existing Order</option>

                    {availableOrders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.orderNumber || order.trackId || order._id} -{" "}
                        {order.customer?.name || "Customer"} -{" "}
                        {currency(order.totalAmount)}
                      </option>
                    ))}
                  </select>

                  {availableOrders.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-2">
                      No unbilled orders available.
                    </p>
                  )}
                </div>

                {/* Customer Details */}
                {selectedOrder && (
                  <div className="bg-[#080B1A] border border-white/10 rounded-xl p-4 space-y-3">

                    <h3 className="font-semibold flex items-center gap-2 text-[#d6ad60]">
                      <User size={18} />
                      Customer Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p>
                        <span className="text-gray-400">Name: </span>
                        {selectedOrder.customer?.name || "N/A"}
                      </p>

                      <p>
                        <span className="text-gray-400">Mobile: </span>
                        {selectedOrder.customer?.mobile || "N/A"}
                      </p>

                      <p>
                        <span className="text-gray-400">Order ID: </span>
                        {selectedOrder.orderNumber || selectedOrder.trackId || "N/A"}
                      </p>

                      <p>
                        <span className="text-gray-400">Garments: </span>
                        {selectedOrder.items?.length || 0}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                {selectedOrder && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Advance Payment (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        max={totalAmount}
                        step="0.01"
                        required
                        value={formData.advanceAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            advanceAmount: e.target.value,
                          })
                        }
                        className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div className="bg-[#17143A] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400">
                          Total Amount
                        </p>

                        <h3 className="text-xl font-bold text-[#d6ad60] mt-2">
                          {currency(totalAmount)}
                        </h3>
                      </div>

                      <div className="bg-[#17143A] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400">
                          Remaining Balance
                        </p>

                        <h3 className="text-xl font-bold text-orange-400 mt-2">
                          {currency(balanceAmount)}
                        </h3>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Payment Method
                      </label>

                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                        className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554]"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 rounded-xl border border-white/10 text-gray-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.order ||
                      advanceAmount < 0 ||
                      advanceAmount > totalAmount
                    }
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "Creating..." : "Create Bill"}
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Update Modal */}
        {showPaymentModal && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">

            <div className="bg-[#101D35] border border-[#b99554]/30 rounded-2xl w-full max-w-lg shadow-2xl">

              <div className="p-5 border-b border-white/10 flex justify-between items-center">

                <div>
                  <h2 className="text-xl font-bold">
                    Update Payment
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    {selectedBill.invoiceNumber}
                  </p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X size={21} />
                </button>
              </div>

              <form
                onSubmit={handlePaymentUpdate}
                className="p-5 space-y-4"
              >

                <div className="bg-[#080B1A] rounded-xl p-4 space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Total Amount</span>
                    <span>{currency(selectedBill.totalAmount)}</span>
                  </p>

                  <p className="flex justify-between">
                    <span className="text-gray-400">Already Paid</span>
                    <span className="text-green-400">
                      {currency(selectedBill.paidAmount)}
                    </span>
                  </p>

                  <p className="flex justify-between">
                    <span className="text-gray-400">Balance</span>
                    <span className="text-orange-400">
                      {currency(selectedBill.balanceAmount)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Total Paid Amount (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={selectedBill.totalAmount}
                    step="0.01"
                    required
                    value={paymentData.paidAmount}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paidAmount: e.target.value,
                      })
                    }
                    className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554]"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Enter cumulative paid amount, including previous payments.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Payment Method
                  </label>

                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-5 py-3 rounded-xl border border-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#b99554] text-[#080B1A] font-semibold disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "Updating..." : "Update Payment"}
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice View Modal */}
        {showInvoiceModal && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">

            <div className="bg-[#101D35] border border-[#b99554]/30 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

              <div className="no-print sticky top-0 z-10 bg-[#101D35] border-b border-white/10 p-4 flex justify-between items-center">

                <h2 className="text-lg font-bold">
                  Invoice Preview
                </h2>

                <div className="flex gap-2">

                  <button
                    onClick={printInvoice}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#b99554] text-[#080B1A] font-semibold"
                  >
                    <Printer size={17} />
                    Print
                  </button>

                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X size={21} />
                  </button>

                </div>
              </div>

              <div className="invoice-print bg-white text-gray-900 p-6 md:p-10">

                <div className="flex justify-between items-start border-b-2 border-[#b99554] pb-5">

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      UNIQUE TAILOR
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                      Tailoring & Clothing Services
                    </p>
                  </div>

                  <div className="text-right">
                    <h2 className="text-xl font-bold">
                      INVOICE
                    </h2>

                    <p className="text-sm mt-2">
                      {selectedBill.invoiceNumber}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(selectedBill.billDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200">

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      Bill To
                    </p>

                    <h3 className="font-bold">
                      {selectedBill.customer?.name || "Customer"}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {selectedBill.customer?.mobile || ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      Order Details
                    </p>

                    <p className="text-sm">
                      Order ID:{" "}
                      {selectedBill.order?.orderNumber ||
                        selectedBill.order?.trackId ||
                        "N/A"}
                    </p>

                    <p className="text-sm">
                      Status: {selectedBill.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="py-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 text-left">
                        <th className="py-3">Description</th>
                        <th className="py-3 text-right">Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedBill.order?.items?.length > 0 ? (
                        selectedBill.order.items.map((item, index) => (
                          <tr
                            key={item._id || index}
                            className="border-b border-gray-100"
                          >
                            <td className="py-3">
                              {item.garmentType || item.measurement?.garmentType || "Tailoring Service"}
                              {" "}× {item.quantity || 1}
                            </td>

                            <td className="py-3 text-right">
                              {currency(
                                Number(item.unitPrice || 0) *
                                  Number(item.quantity || 1)
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-3">
                            Tailoring Services
                          </td>

                          <td className="py-3 text-right">
                            {currency(selectedBill.totalAmount)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-300 pt-5 ml-auto max-w-xs space-y-3">

                  <div className="flex justify-between text-sm">
                    <span>Total Amount</span>
                    <span>{currency(selectedBill.totalAmount)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-green-700">
                    <span>Total Paid</span>
                    <span>{currency(selectedBill.paidAmount)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-3">
                    <span>Balance Due</span>
                    <span>{currency(selectedBill.balanceAmount)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-10 pt-5 text-center">
                  <p className="font-semibold">
                    Thank you for choosing Unique Tailor!
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    We appreciate your business.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
