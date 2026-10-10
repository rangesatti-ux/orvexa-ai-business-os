import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Truck,
  RefreshCw,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const emptyForm = {
    supplier_code: "",
    supplier_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
  };

  const [form, setForm] = useState(emptyForm);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/suppliers/?page=1&limit=100"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        setSuppliers(data.suppliers || []);
      }
    } catch (err) {
      console.error("Failed to load suppliers:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load suppliers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [
        supplier.supplier_code,
        supplier.supplier_name,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
        supplier.city,
        supplier.state,
        supplier.gst_number,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [suppliers, search]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      supplier_code: supplier.supplier_code || "",
      supplier_name: supplier.supplier_name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      pincode: supplier.pincode || "",
      gst_number: supplier.gst_number || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSupplier(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.supplier_code.trim()) {
      setError("Supplier code is required.");
      return;
    }

    if (!form.supplier_name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        supplier_code: form.supplier_code.trim(),
        supplier_name: form.supplier_name.trim(),
        contact_person: form.contact_person.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        gst_number: form.gst_number.trim(),
      };

      if (editingSupplier) {
        await api.put(
          `/suppliers/${editingSupplier.id}`,
          payload
        );
      } else {
        await api.post("/suppliers/", payload);
      }

      closeModal();
      await loadSuppliers();
    } catch (err) {
      console.error("Failed to save supplier:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to save supplier."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Delete supplier "${supplier.supplier_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/suppliers/${supplier.id}`);

      await loadSuppliers();
    } catch (err) {
      console.error("Failed to delete supplier:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete supplier."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Truck size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Suppliers
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your business suppliers
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Suppliers
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            {suppliers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Matching Results
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            {filteredSuppliers.length}
          </p>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search suppliers..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={loadSuppliers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && !showModal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              Loading suppliers...
            </div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Truck
              size={42}
              className="mb-4 text-gray-300 dark:text-slate-600"
            />

            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              No suppliers found
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add your first supplier to get started.
            </p>

            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Supplier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Code
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Supplier
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Contact Person
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Location
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    GST Number
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {supplier.supplier_code || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {supplier.supplier_name || "-"}
                      </div>

                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {supplier.address || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {supplier.contact_person || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {supplier.phone || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {supplier.email || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {[
                        supplier.city,
                        supplier.state,
                        supplier.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {supplier.gst_number || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(supplier)
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                          title="Edit supplier"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(supplier)
                          }
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          title="Delete supplier"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter supplier details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Supplier Code *
                  </label>

                  <input
                    name="supplier_code"
                    value={form.supplier_code}
                    onChange={handleChange}
                    placeholder="SUP001"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Supplier Name *
                  </label>

                  <input
                    name="supplier_name"
                    value={form.supplier_name}
                    onChange={handleChange}
                    placeholder="ABC Suppliers"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Person
                  </label>

                  <input
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="supplier@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GST Number
                  </label>

                  <input
                    name="gst_number"
                    value={form.gst_number}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Supplier address"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Hyderabad"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Telangana"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="500001"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingSupplier
                    ? "Update Supplier"
                    : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierPage;