import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  RefreshCw,
  ShoppingCart,
  IndianRupee,
  Receipt,
  TrendingUp,
  X,
} from "lucide-react";

import api from "../../services/api";

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [stats, setStats] = useState({
    total_sales: 0,
    total_revenue: 0,
    today_revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    payment_method: "UPI",
    discount: 0,
    gst: 18,
  });

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
    },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [salesResponse, productsResponse, statsResponse] =
        await Promise.all([
          api.get("/sales/?page=1&limit=100"),
          api.get("/products/?page=1&limit=100"),
          api.get("/sales/dashboard/stats"),
        ]);

      setSales(salesResponse.data?.sales || []);

      setProducts(productsResponse.data?.products || []);

      setStats({
        total_sales: statsResponse.data?.total_sales ?? 0,
        total_revenue: statsResponse.data?.total_revenue ?? 0,
        today_revenue: statsResponse.data?.today_revenue ?? 0,
      });
    } catch (err) {
      console.error("Failed to load sales:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load sales data from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProduct = (productId) => {
    return products.find(
      (product) => String(product.id) === String(productId)
    );
  };

  const updateItem = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return [
          {
            product_id: "",
            quantity: 1,
          },
        ];
      }

      return currentItems.filter(
        (_, itemIndex) => itemIndex !== index
      );
    });
  };

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = getProduct(item.product_id);

      if (!product) {
        return total;
      }

      const quantity = Number(item.quantity) || 0;
      const price = Number(product.price) || 0;

      return total + price * quantity;
    }, 0);
  }, [items, products]);

  const discountAmount = Math.max(
    0,
    Number(form.discount) || 0
  );

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  const gstAmount =
    taxableAmount * ((Number(form.gst) || 0) / 100);

  const grandTotal = taxableAmount + gstAmount;

  const resetForm = () => {
    setForm({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      payment_method: "UPI",
      discount: 0,
      gst: 18,
    });

    setItems([
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  };

  const handleCreateSale = async (event) => {
    event.preventDefault();

    setError("");

    const validItems = items.filter(
      (item) =>
        item.product_id !== "" &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setError("Please add at least one valid product.");
      return;
    }

    const hasInvalidProduct = validItems.some(
      (item) => !getProduct(item.product_id)
    );

    if (hasInvalidProduct) {
      setError("One or more selected products are invalid.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim(),
        payment_method: form.payment_method,
        discount: Number(form.discount) || 0,
        gst: Number(form.gst) || 0,
        items: validItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      };

      await api.post("/sales/", payload);

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error("Failed to create sale:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to create sale."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/sales/${saleId}`);

      await loadData();
    } catch (err) {
      console.error("Failed to delete sale:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete sale."
      );
    }
  };

  const filteredSales = sales.filter((sale) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      String(sale.invoice_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(sale.customer_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(sale.customer_phone || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(sale.payment_method || "")
        .toLowerCase()
        .includes(searchValue)
    );
  });

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getProductName = (productId) => {
    const product = getProduct(productId);

    return product?.product_name || `Product #${productId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Sales
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Create sales invoices and manage sales history.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadData}
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
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            New Sale
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Sales
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                {stats.total_sales}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Receipt size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Revenue
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(stats.total_revenue)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              <IndianRupee size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Today's Revenue
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(stats.today_revenue)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <TrendingUp size={22} />
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
            placeholder="Search invoice, customer, phone or payment method..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                Sales History
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                {filteredSales.length} sale
                {filteredSales.length !== 1 ? "s" : ""}
              </p>
            </div>

            <ShoppingCart
              size={20}
              className="text-gray-400 dark:text-slate-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
            <Receipt
              size={42}
              className="text-gray-300 dark:text-slate-600"
            />

            <h3 className="mt-4 font-semibold text-gray-700 dark:text-slate-300">
              No sales found
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
              Create your first sale to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-gray-50 dark:bg-slate-900/60">
                <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Subtotal</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4">GST</th>
                  <th className="px-5 py-4">Grand Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {sale.invoice_number}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {sale.customer_name || "Walk-in Customer"}
                        </p>

                        {sale.customer_phone && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                            {sale.customer_phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {(sale.items || []).map((item) => (
                          <div
                            key={item.id}
                            className="text-xs text-gray-600 dark:text-slate-300"
                          >
                            <span className="font-medium">
                              {getProductName(item.product_id)}
                            </span>{" "}
                            × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700 dark:text-slate-200">
                      {formatCurrency(sale.subtotal)}
                    </td>

                    <td className="px-5 py-4 text-gray-600 dark:text-slate-300">
                      {formatCurrency(sale.discount)}
                    </td>

                    <td className="px-5 py-4 text-gray-600 dark:text-slate-300">
                      {formatCurrency(sale.gst)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-800 dark:text-white">
                        {formatCurrency(sale.grand_total)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                          {sale.payment_method || "Unknown"}
                        </span>

                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          {sale.payment_status || "Unknown"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400">
                      {formatDate(sale.created_at)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSale(sale.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        title="Delete sale"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Sale Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Create New Sale
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Create an invoice using products from inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleCreateSale}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Customer Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Customer Name
                    </label>

                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          customer_name: event.target.value,
                        })
                      }
                      placeholder="Enter customer name"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Customer Phone
                    </label>

                    <input
                      type="text"
                      value={form.customer_phone}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          customer_phone: event.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Customer Email
                    </label>

                    <input
                      type="email"
                      value={form.customer_email}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          customer_email: event.target.value,
                        })
                      }
                      placeholder="customer@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Payment */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Payment Method
                    </label>

                    <select
                      value={form.payment_method}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          payment_method: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          discount: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* GST */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      GST (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.gst}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          gst: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Products */}
                <div className="mt-7">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Sale Items
                      </h3>

                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Select products and quantities.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    >
                      <Plus size={16} />
                      Add Product
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const selectedProduct = getProduct(
                        item.product_id
                      );

                      const lineTotal =
                        (Number(selectedProduct?.price) || 0) *
                        (Number(item.quantity) || 0);

                      return (
                        <div
                          key={index}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-[1fr_140px_160px_44px] sm:items-end dark:border-slate-700 dark:bg-slate-900/50"
                        >
                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-slate-400">
                              Product
                            </label>

                            <select
                              value={item.product_id}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "product_id",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map((product) => (
                                <option
                                  key={product.id}
                                  value={product.id}
                                >
                                  {product.product_name} — ₹
                                  {Number(
                                    product.price || 0
                                  ).toLocaleString("en-IN")}{" "}
                                  | Stock: {product.quantity}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-slate-400">
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-slate-400">
                              Line Total
                            </label>

                            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                              {formatCurrency(lineTotal)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Remove item"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-7 flex justify-end">
                  <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
                    <h3 className="mb-4 font-semibold text-gray-800 dark:text-white">
                      Sale Summary
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">
                          Subtotal
                        </span>

                        <span className="font-medium text-gray-800 dark:text-white">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">
                          Discount
                        </span>

                        <span className="font-medium text-red-600 dark:text-red-400">
                          - {formatCurrency(discountAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">
                          GST ({Number(form.gst) || 0}%)
                        </span>

                        <span className="font-medium text-gray-800 dark:text-white">
                          {formatCurrency(gstAmount)}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-3 dark:border-slate-700">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            Grand Total
                          </span>

                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
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

                  {submitting ? "Creating..." : "Create Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesPage;