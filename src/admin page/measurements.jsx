
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Ruler,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  User,
  Users,
  Shirt,
  Scissors,
  Save,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";

const API_URL = "http://localhost:5000/api/measurements";
const CUSTOMER_API = "http://localhost:5000/api/customers";

const garmentOptions = {
  Men: {
    Shirt: ["Chest", "Shoulder", "Shirt Length", "Sleeve Length", "Neck", "Waist"],
    Pant: ["Waist", "Hip", "Pant Length", "Thigh", "Knee", "Bottom"],
    Dhoti: ["Waist", "Length", "Width"],
  },
  Women: {
    Blouse: ["Bust", "Waist", "Shoulder", "Sleeve Length", "Blouse Length", "Armhole"],
    Chudithar: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve Length", "Top Length", "Pant Length"],
    Saree: ["Blouse Bust", "Blouse Waist", "Shoulder", "Sleeve Length", "Blouse Length"],
  },
};

const emptyForm = {
  customerId: "",
  gender: "",
  garmentType: "",
  measurements: {},
  notes: "",
};

export default function Measurements() {
  const [customers, setCustomers] = useState([]);
  const [measurementsList, setMeasurementsList] = useState([]);
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

      const [customerRes, measurementRes] = await Promise.all([
        axios.get(CUSTOMER_API, { headers }),
        axios.get(API_URL, { headers }),
      ]);

      setCustomers(customerRes.data.customers || []);
      setMeasurementsList(measurementRes.data.measurements || []);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Unable to load measurements. Check backend server.");
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

  const filteredMeasurements = useMemo(() => {
    const value = search.toLowerCase();

    return measurementsList.filter((item) => {
      const name = item.customer?.name || "";
      const mobile = item.customer?.mobile || "";

      return (
        item.customerId?.toLowerCase().includes(value) ||
        name.toLowerCase().includes(value) ||
        mobile.includes(value) ||
        item.garmentType?.toLowerCase().includes(value)
      );
    });
  }, [measurementsList, search]);

  const openAddModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      customerId: item.customerId,
      gender: item.gender,
      garmentType: item.garmentType,
      measurements: item.measurements || {},
      notes: item.notes || "",
    });

    setEditingId(item._id);
    setShowModal(true);
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({
      ...prev,
      gender,
      garmentType: "",
      measurements: {},
    }));
  };

  const handleGarmentChange = (garmentType) => {
    const fields = garmentOptions[formData.gender][garmentType];

    const values = {};
    fields.forEach((field) => {
      values[field] = formData.measurements[field] || "";
    });

    setFormData((prev) => ({
      ...prev,
      garmentType,
      measurements: values,
    }));
  };

  const handleMeasurementChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId || !formData.gender || !formData.garmentType) {
      alert("Please select customer, gender and garment.");
      return;
    }

    const hasEmptyField = Object.values(formData.measurements).some(
      (value) => String(value).trim() === ""
    );

    if (hasEmptyField) {
      alert("Please fill all measurement fields.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        customerId: formData.customerId,
        gender: formData.gender,
        garmentType: formData.garmentType,
        measurements: formData.measurements,
        notes: formData.notes,
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, { headers });
      } else {
        await axios.post(API_URL, payload, { headers });
      }

      setShowModal(false);
      setFormData(emptyForm);
      setEditingId(null);

      await fetchData();
      alert("Measurement saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert(error.response?.data?.message || "Unable to save measurement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this measurement?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, { headers });
      await fetchData();
      alert("Measurement deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unable to delete measurement.");
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#080B1A] text-white p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#b99554]/10">
                <Ruler className="text-[#d6ad60]" size={26} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Measurements
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Manage customer garment measurements
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold px-5 py-3 rounded-xl transition"
          >
            <Plus size={19} />
            Add Measurement
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#101D35] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Records</p>
            <h2 className="text-3xl font-bold text-[#d6ad60] mt-2">
              {measurementsList.length}
            </h2>
          </div>

          <div className="bg-[#101D35] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Men's Records</p>
            <h2 className="text-3xl font-bold text-white mt-2">
              {measurementsList.filter((item) => item.gender === "Men").length}
            </h2>
          </div>

          <div className="bg-[#101D35] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Women's Records</p>
            <h2 className="text-3xl font-bold text-white mt-2">
              {measurementsList.filter((item) => item.gender === "Women").length}
            </h2>
          </div>
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
              placeholder="Search Customer ID, name, mobile or garment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-[#b99554]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#101D35] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#17143A] text-gray-300 text-sm">
                <tr>
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Garment</th>
                  <th className="p-4">Measurements</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-400">
                      Loading measurements...
                    </td>
                  </tr>
                ) : filteredMeasurements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-400">
                      No measurements found.
                    </td>
                  </tr>
                ) : (
                  filteredMeasurements.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-4 text-[#d6ad60] font-semibold">
                        {item.customerId}
                      </td>

                      <td className="p-4">
                        <p className="font-medium">{item.customer?.name || "Customer"}</p>
                        <p className="text-xs text-gray-400">
                          {item.customer?.mobile || ""}
                        </p>
                      </td>

                      <td className="p-4">{item.gender}</td>

                      <td className="p-4">{item.garmentType}</td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {Object.entries(item.measurements || {})
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <p key={key} className="text-xs text-gray-300">
                                {key}: {value}
                              </p>
                            ))}
                          {Object.keys(item.measurements || {}).length > 3 && (
                            <p className="text-xs text-[#d6ad60]">
                              +{Object.keys(item.measurements).length - 3} more
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
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

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
            <div className="bg-[#101D35] border border-[#b99554]/30 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 z-10 bg-[#101D35] border-b border-white/10 p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit Measurement" : "Add Measurement"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Enter customer garment details
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-6">
                {/* Customer */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Select Customer ID
                  </label>

                  <select
                    required
                    value={formData.customerId}
                    disabled={!!editingId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerId: e.target.value,
                      }))
                    }
                    className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#b99554] disabled:opacity-60"
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

                {/* Gender */}
                <div>
                  <label className="block text-sm text-gray-300 mb-3">
                    Select Gender
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {["Men", "Women"].map((gender) => (
                      <button
                        type="button"
                        key={gender}
                        onClick={() => handleGenderChange(gender)}
                        className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition ${
                          formData.gender === gender
                            ? "border-[#d6ad60] bg-[#b99554]/15 text-[#d6ad60]"
                            : "border-white/10 bg-[#080B1A] text-gray-300"
                        }`}
                      >
                        {gender === "Men" ? <User size={20} /> : <Users size={20} />}
                        <span className="font-semibold">{gender}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garment */}
                {formData.gender && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Select Garment Type
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.keys(garmentOptions[formData.gender]).map(
                        (garment) => (
                          <button
                            type="button"
                            key={garment}
                            onClick={() => handleGarmentChange(garment)}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                              formData.garmentType === garment
                                ? "border-[#d6ad60] bg-[#b99554]/15 text-[#d6ad60]"
                                : "border-white/10 bg-[#080B1A] text-gray-300"
                            }`}
                          >
                            <Shirt size={22} />
                            <span className="text-sm font-medium">{garment}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Measurement Fields */}
                {formData.gender && formData.garmentType && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Ruler className="text-[#d6ad60]" size={19} />
                      <h3 className="font-semibold">
                        {formData.garmentType} Measurements
                      </h3>
                      <span className="text-xs text-gray-400">(in inches)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {garmentOptions[formData.gender][formData.garmentType].map(
                        (field) => (
                          <div key={field}>
                            <label className="block text-sm text-gray-300 mb-2">
                              {field}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.25"
                              required
                              placeholder={`Enter ${field}`}
                              value={formData.measurements[field] || ""}
                              onChange={(e) =>
                                handleMeasurementChange(field, e.target.value)
                              }
                              className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#b99554]"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {formData.garmentType && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Additional Notes
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
                      placeholder="Any additional instructions..."
                      className="w-full bg-[#080B1A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#b99554] resize-none"
                    />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !formData.garmentType}
                    className="px-5 py-3 rounded-xl bg-[#b99554] hover:bg-[#d6ad60] text-[#080B1A] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "Saving..." : editingId ? "Update Measurement" : "Save Measurement"}
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
