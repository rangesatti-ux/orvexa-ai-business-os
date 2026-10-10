import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import api from "../../services/api";

function CustomerPage() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    customer_code: "",
    full_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/customers/?page=1&limit=100"
      );

      setCustomers(response.data?.customers || []);
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load customers from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const resetForm = () => {
    setForm({
      customer_code: "",
      full_name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setEditingCustomer(null);
  };

  const openCreateForm = () => {
    setError("");
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setError("");

    setEditingCustomer(customer);

    setForm({
      customer_code: customer.customer_code || "",
      full_name: customer.full_name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.customer_code.trim()) {
      setError("Customer code is required.");
      return;
    }

    if (!form.full_name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_code: form.customer_code.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.id}`,
          payload
        );
      } else {
        await api.post("/customers/", payload);
      }

      closeForm();

      await loadCustomers();
    } catch (err) {
      console.error("Failed to save customer:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to save customer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/customers/${customerId}`);

      await loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete customer."
      );
    }
  };

  const filteredCustomers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        String(customer.customer_code || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.full_name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.city || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.state || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.pincode || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [customers, search]);

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage your customer records and contact information.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Customers
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                {customers.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Matching Customers
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                {filteredCustomers.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              <Search size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer code, name, phone, email, city..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                Customer List
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                {filteredCustomers.length} customer
                {filteredCustomers.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Users
              size={20}
              className="text-gray-400 dark:text-slate-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <Users
              size={44}
              className="text-gray-300 dark:text-slate-600"
            />

            <h3 className="mt-4 font-semibold text-gray-700 dark:text-slate-300">
              {search
                ? "No matching customers"
                : "No customers yet"}
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
              {search
                ? "Try a different search term."
                : "Add your first customer to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-gray-50 dark:bg-slate-900/60">
                <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Contact
                  </th>

                  <th className="px-5 py-4">
                    Address
                  </th>

                  <th className="px-5 py-4">
                    Location
                  </th>

                  <th className="px-5 py-4">
                    Pincode
                  </th>

                  <th className="px-5 py-4">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                          {customer.full_name
                            ? customer.full_name
                                .charAt(0)
                                .toUpperCase()
                            : "C"}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {customer.full_name || "-"}
                          </p>

                          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            {customer.customer_code || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        )}

                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        )}

                        {!customer.phone &&
                          !customer.email && (
                            <span className="text-sm text-gray-400">
                              -
                            </span>
                          )}
                      </div>
                    </td>

                    <td className="max-w-[260px] px-5 py-4">
                      <p className="truncate text-sm text-gray-600 dark:text-slate-300">
                        {customer.address || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <div>
                          <p className="text-sm text-gray-700 dark:text-slate-200">
                            {customer.city || "-"}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {customer.state || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {customer.pincode || "-"}
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(customer)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                          title="Edit customer"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(customer.id)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                          title="Delete customer"
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

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {editingCustomer
                    ? "Update customer information."
                    : "Add a new customer to your business records."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Customer Code */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Customer Code *
                    </label>

                    <input
                      type="text"
                      name="customer_code"
                      value={form.customer_code}
                      onChange={handleChange}
                      placeholder="CUS001"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="customer@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="500001"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;