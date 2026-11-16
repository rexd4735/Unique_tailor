
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  User,
  Shirt,
  Save,
  PackageCheck,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";

const ORDER_API = "http://localhost:5000/api/orders";
const CUSTOMER_API = "http://localhost:5000/api/customers";
const MEASUREMENT_API = "http://localhost:5000/api/measurements";

const emptyForm = {
  customerId: "",
  items: [],
  deliveryDate: "",
  notes: "",
};

const statuses = [
  "Pending",
  "In Progress",
  "Ready",
  "Delivered",
  "Cancelled",
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

export default function Orders() {
  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [orders, setOrders] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = sessionStorage.getItem("adminToken");

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const fetchData = async () => {
    try {
      setLoading(true);

      const [customerRes, measurementRes, orderRes] =
        await Promise.all([
          axios.get(CUSTOMER_API, { headers }),
          axios.get(MEASUREMENT_API, { headers }),
          axios.get(ORDER_API, { headers }),
        ]);

      setCustomers(customerRes.data.customers || []);
      setMeasurements(measurementRes.data.measurements || []);
      setOrders(orderRes.data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
      alert("Unable to load orders. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCustomer = customers.find(
    (customer) => customer.customerId === formData.customerId
  );

  const availableMeasurements = measurements.filter(
    (measurement) =>
      measurement.customerId === formData.customerId
  );

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase();

    return orders.filter((order) => {
      const name = order.customer?.name || "";
      const mobile = order.customer?.mobile || "";

      return (
        order.orderNumber?.toLowerCase().includes(value) ||
        order.customerId?.toLowerCase().includes(value) ||
        name.toLowerCase().includes(value) ||
        mobile.includes(value) ||
        order.status?.toLowerCase().includes(value)
      );
    });
  }, [orders, search]);

  const totalRevenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const openAddModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (order) => {
    setFormData({
      customerId: order.customerId,
      items: order.items.map((item) => ({
        measurement:
          typeof item.measurement === "object"
            ? item.measurement?._id
            : item.measurement,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes || "",
      })),
      deliveryDate: order.deliveryDate
        ? new Date(order.deliveryDate).toISOString().slice(0, 10)
        : "",
      notes: order.notes || "",
    });

    setEditingId(order._id);
    setShowModal(true);
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          measurement: "",
          quantity: 1,
          unitPrice: "",
          notes: "",
        },
      ],
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const formTotal = formData.items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.unitPrice || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert("Please select a customer.");
      return;
    }

    if (formData.items.length === 0) {
      alert("Please add at least one garment.");
      return;
    }

    if (!formData.deliveryDate) {
      alert("Please select delivery date.");
      return;
    }

    const invalidItem = formData.items.some(
      (item) =>
        !item.measurement ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        item.unitPrice === "" ||
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0
    );

    if (invalidItem) {
      alert("Please check all garment, quantity and price fields.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        customerId: formData.customerId,
        items: formData.items.map((item) => ({
          measurement: item.measurement,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          notes: item.notes,
        })),
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
      };

      if (editingId) {
        await axios.put(`${ORDER_API}/${editingId}`, payload, {
          headers,
        });
      } else {
        await axios.post(ORDER_API, payload, { headers });
      }

      setShowModal(false);
      setFormData(emptyForm);
      setEditingId(null);

      await fetchData();
      alert("Order saved successfully!");
    } catch (error) {
      console.error("Save order error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to save order."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${ORDER_API}/${id}`,
        { status },
        { headers }
      );

      await fetchData();
    } catch (error) {
      console.error("Status update:", error);
      alert("Unable to update order status.");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await axios.delete(`${ORDER_API}/${id}`, { headers });
      await fetchData();
      alert("Order deleted successfully!");
    } catch (error) {
      console.error("Delete order:", error);
      alert("Unable to delete order.");
    }
  };

  const statusStyle = (status) => {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-400",
      "In Progress": "bg-blue-500/10 text-blue-400",
      Ready: "bg-green-500/10 text-green-400",
      Delivered: "bg-purple-500/10 text-purple-400",
      Cancelled: "bg-red-500/10 text-red-400",
    };

    return styles[status] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#080B1A] text-white p-4 md:p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#b99554]/10">
              <ShoppingBag size={27} className="text-[#d6ad60]" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Orders
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage tailoring orders and delivery status
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold"
          >
            <Plus size={19} />
            Create Order
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "Total Orders",
              value: orders.length,
            },
            {
              title: "Pending Orders",
              value: orders.filter((o) => o.status === "Pending").length,
            },
            {
              title: "In Progress",
              value: orders.filter((o) => o.status === "In Progress").length,
            },
            {
              title: "Order Value",
              value: currency(totalRevenue),
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-[#101D35] border border-white/10 rounded-2xl p-5"
            >
              <p className="text-sm text-gray-400">{card.title}</p>
              <h2 className="text-2xl font-bold text-[#d6ad60] mt-2">
                {card.value}
              </h2>
            </div>
          ))}
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
              placeholder="Search order number, customer ID, name or mobile..."
              className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#b99554]"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#17143A] text-gray-300 text-sm">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Garments</th>
                  <th className="p-4">Delivery Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-4">
                        <p className="text-[#d6ad60] font-semibold">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.customerId}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-medium">
                          {order.customer?.name || "Customer"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.customer?.mobile || ""}
                        </p>
                      </td>

                      <td className="p-4">
                        {order.items?.map((item) => (
                          <p key={item._id} className="text-sm text-gray-300">
                            {item.garmentType} × {item.quantity}
                          </p>
                        ))}
                      </td>

                      <td className="p-4 text-sm">
                        {new Date(order.deliveryDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="p-4 font-semibold">
                        {currency(order.totalAmount)}
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order._id, e.target.value)
                          }
                          className={`rounded-lg px-3 py-2 text-xs font-semibold outline-none border border-white/10 bg-[#080B1A] ${statusStyle(order.status)}`}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            title="Delete"
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

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
            <div className="bg-[#101D35] border border-[#b99554]/30 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">

              <div className="sticky top-0 z-10 bg-[#101D35] border-b border-white/10 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit Order" : "Create New Order"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Add customer and garment details
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-6">

                {/* Customer Selection */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Select Customer
                  </label>

                  <select
                    required
                    disabled={!!editingId}
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerId: e.target.value,
                        items: [],
                      }))
                    }
                    className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554] disabled:opacity-60"
                  >
                    <option value="">Choose Customer ID</option>

                    {customers.map((customer) => (
                      <option key={customer._id} value={customer.customerId}>
                        {customer.customerId} - {customer.name}
                      </option>
                    ))}
                  </select>

                  {selectedCustomer && (
                    <div className="mt-3 bg-[#080B1A] rounded-xl p-3 text-sm space-y-1">
                      <p>
                        <span className="text-gray-400">Name:</span>{" "}
                        {selectedCustomer.name}
                      </p>
                      <p>
                        <span className="text-gray-400">Mobile:</span>{" "}
                        {selectedCustomer.mobile}
                      </p>
                    </div>
                  )}
                </div>

                {/* Garment Items */}
                {formData.customerId && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Shirt size={19} className="text-[#d6ad60]" />
                          Garment Details
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Select saved customer measurements
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 text-sm bg-[#b99554]/15 text-[#d6ad60] px-3 py-2 rounded-lg"
                      >
                        <Plus size={16} />
                        Add Garment
                      </button>
                    </div>

                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#080B1A] border border-white/10 rounded-xl p-4 mb-3"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-semibold text-sm">
                            Garment {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-400 p-1"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">
                              Select Measurement / Garment
                            </label>

                            <select
                              required
                              value={item.measurement}
                              onChange={(e) =>
                                updateItem(index, "measurement", e.target.value)
                              }
                              className="w-full bg-[#101D35] border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#b99554]"
                            >
                              <option value="">Choose saved measurement</option>

                              {availableMeasurements.map((measurement) => (
                                <option
                                  key={measurement._id}
                                  value={measurement._id}
                                >
                                  {measurement.gender} - {measurement.garmentType}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-2">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(index, "quantity", e.target.value)
                                }
                                className="w-full bg-[#101D35] border border-white/10 rounded-lg p-3 outline-none focus:border-[#b99554]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-2">
                                Unit Price (₹)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                placeholder="Enter price"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(index, "unitPrice", e.target.value)
                                }
                                className="w-full bg-[#101D35] border border-white/10 rounded-lg p-3 outline-none focus:border-[#b99554]"
                              />
                            </div>
                          </div>

                          <p className="text-right text-sm text-[#d6ad60]">
                            Subtotal:{" "}
                            {currency(
                              Number(item.quantity || 0) *
                                Number(item.unitPrice || 0)
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {availableMeasurements.length === 0 && (
                      <p className="text-sm text-yellow-400 mt-3">
                        No saved measurements for this customer. Add measurements first.
                      </p>
                    )}

                    <div className="bg-[#17143A] border border-[#b99554]/30 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-xl font-bold text-[#d6ad60]">
                        {currency(formTotal)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Delivery Date */}
                {formData.customerId && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Delivery Date
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="date"
                          required
                          min={new Date().toLocaleDateString("en-CA")}
                          value={formData.deliveryDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              deliveryDate: e.target.value,
                            }))
                          }
                          className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 pl-11 text-white outline-none focus:border-[#b99554]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Special Instructions / Notes
                      </label>

                      <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Enter order instructions..."
                        className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 outline-none focus:border-[#b99554] resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-3 rounded-xl border border-white/10 text-gray-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !formData.customerId || formData.items.length === 0}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Order"
                      : "Save Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
