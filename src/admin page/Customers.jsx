
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  X,
  UserRound,
  UsersRound,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";

const API_URL = "http://localhost:5000/api/customers";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const emptyForm = {
    name: "",
    mobile: "",
    email: "",
    address: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // Fetch customers from MongoDB
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await axios.get(API_URL);

      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setApiError(
        error.response?.data?.message || "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search customers
  const filteredCustomers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchText) ||
        customer.mobile?.includes(searchText)
    );
  }, [customers, search]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setApiError("");
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setApiError("");
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add or Update Customer
  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
    alert("Please enter a valid 10-digit Indian mobile number.");
    return;
  }

  try {
    setSaving(true);
    setApiError("");

    const customerData = {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
    };

    let response;

    if (editingCustomer) {
      response = await axios.put(
        `${API_URL}/${editingCustomer._id}`,
        customerData
      );
    } else {
      response = await axios.post(API_URL, customerData);
    }

    console.log("Saved customer:", response.data.customer);

    await fetchCustomers();

    setShowModal(false);
    setFormData(emptyForm);
    setEditingCustomer(null);

    alert("Customer saved successfully!");
  } catch (error) {
    console.error("Save customer error:", error);

    const message =
      error.response?.data?.message || "Unable to save customer.";

    setApiError(message);
    alert(message);
  } finally {
    setSaving(false);
  }
};


  // Delete Customer
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      setApiError("");

      await axios.delete(`${API_URL}/${id}`);

      alert("Customer deleted successfully!");

      await fetchCustomers();
    } catch (error) {
      console.error("Delete customer error:", error);

      const message =
        error.response?.data?.message || "Unable to delete customer.";

      setApiError(message);
      alert(message);
    }
  };

  return (
    <AdminLayout>
      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          
          <h2 className="mt-2 text-3xl font-semibold text-[#e5edff]">
            Customers
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Manage your customers and their contact information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b99554] to-[#d6ad60] px-5 py-3 font-semibold text-[#10152b] shadow-lg transition hover:brightness-110"
        >
          <UserPlus size={19} />
          Add Customer
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#171d3b] to-[#10172d] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Customers</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                {customers.length}
              </h3>
            </div>
            <div className="rounded-xl bg-[#b99554]/15 p-3 text-[#d6ad60]">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#171d3b] to-[#10172d] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Search Results</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                {filteredCustomers.length}
              </h3>
            </div>
            <div className="rounded-xl bg-purple-500/15 p-3 text-purple-300">
              <Search size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#171d3b] to-[#10172d] p-6 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Customer Records</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                {customers.length.toString().padStart(2, "0")}
              </h3>
            </div>
            <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
              <UsersRound size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Customer table section */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1127] via-[#17143A] to-[#101D35] shadow-xl">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:p-6">
          <div>
            <h3 className="text-xl font-semibold text-[#f0f4fa]">
              All Customers
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Customer details and contact information
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or mobile number..."
              className="w-full rounded-xl border border-white/10 bg-[#080B1A]/70 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#b99554]"
            />
          </div>
        </div>

        {apiError && (
          <div className="mx-5 mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
            {apiError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#1f274c] text-sm text-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Mobile</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Customer ID</th>
                <th className="px-6 py-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-400">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="transition hover:bg-white/[0.04]"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b99554]/15 text-[#d6ad60]">
                          <UserRound size={20} />
                        </div>
                        <span className="font-medium text-white">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-[#d6ad60]" />
                        {customer.mobile}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-[#d6ad60]" />
                        {customer.email || "—"}
                      </div>
                    </td>

                    <td className="max-w-[200px] px-6 py-5 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="shrink-0 text-[#d6ad60]" />
                        <span className="truncate">
                          {customer.address || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#d6ad60]">
                      {customer.customerId}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          title="Edit customer"
                          className="rounded-lg border border-blue-400/20 bg-blue-500/10 p-2 text-blue-300 transition hover:bg-blue-500/20"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(customer._id)}
                          title="Delete customer"
                          className="rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gray-400">
                      <Users size={27} />
                    </div>
                    <p className="font-medium text-gray-200">
                      {search ? "No customers found" : "No customers added yet"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {search
                        ? "Try searching with another name or mobile number."
                        : "Click Add Customer to create your first customer record."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/10 px-6 py-4 text-sm text-gray-400">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </section>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#17143A] to-[#101D35] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#b99554]">
                  Customer Details
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h3>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-white/10 bg-[#080B1A]/70 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#b99554]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-white/10 bg-[#080B1A]/70 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#b99554]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#080B1A]/70 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#b99554]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter customer address"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080B1A]/70 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#b99554]"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#b99554] to-[#d6ad60] px-6 py-3 font-semibold text-[#10152b] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                    ? "Save Changes"
                    : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Customers;
