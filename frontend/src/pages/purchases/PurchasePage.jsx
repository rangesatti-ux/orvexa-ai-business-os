import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  ShoppingBag,
  IndianRupee,
  Package,
} from "lucide-react";

import api from "../../services/api";

function PurchasePage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    supplier_id: "",
    gst: 18,
    discount: 0,
    items: [
      {
        product_id: "",
        quantity: 1,
        price: 0,
      },
    ],
  });

  // ============================================================
  // LOAD PURCHASES, SUPPLIERS & PRODUCTS
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [purchasesResponse, suppliersResponse, productsResponse] =
        await Promise.all([
          api.get("/purchases/?page=1&limit=100"),
          api.get("/suppliers/?page=1&limit=100"),
          api.get("/products/?page=1&limit=100"),
        ]);

      const purchaseData = purchasesResponse.data;
      const supplierData = suppliersResponse.data;
      const productData = productsResponse.data;

      setPurchases(
        Array.isArray(purchaseData)
          ? purchaseData
          : purchaseData?.purchases || []
      );

      setSuppliers(
        Array.isArray(supplierData)
          ? supplierData
          : supplierData?.suppliers || []
      );

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData?.products || []
      );
    } catch (err) {
      console.error("Failed to load purchase data:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load purchase data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // SUPPLIER / PRODUCT HELPERS
  // ============================================================

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(
      (item) => Number(item.id) === Number(supplierId)
    );

    return supplier
      ? `${supplier.supplier_name} (${supplier.supplier_code})`
      : `Supplier #${supplierId}`;
  };

  const getProductName = (productId) => {
    const product = products.find(
      (item) => Number(item.id) === Number(productId)
    );

    return product
      ? product.product_name
      : `Product #${productId}`;
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredPurchases = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return purchases;
    }

    return purchases.filter((purchase) => {
      const supplierName = getSupplierName(
        purchase.supplier_id
      ).toLowerCase();

      return (
        String(purchase.purchase_number || "")
          .toLowerCase()
          .includes(query) ||
        supplierName.includes(query) ||
        String(purchase.grand_total || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [purchases, search, suppliers]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const resetForm = () => {
    setForm({
      supplier_id: "",
      gst: 18,
      discount: 0,
      items: [
        {
          product_id: "",
          quantity: 1,
          price: 0,
        },
      ],
    });
  };

  const openCreateModal = () => {
    setError("");
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((previous) => {
      const updatedItems = [...previous.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...previous,
        items: updatedItems,
      };
    });
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          product_id: "",
          quantity: 1,
          price: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((previous) => {
      if (previous.items.length === 1) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };
    });
  };

  // ============================================================
  // AUTO-FILL PRODUCT PRICE
  // ============================================================

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(
      (product) =>
        Number(product.id) === Number(productId)
    );

    updateItem(index, "product_id", productId);

    if (selectedProduct) {
      updateItem(
        index,
        "price",
        Number(selectedProduct.price || 0)
      );
    }
  };

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const subtotal = useMemo(() => {
    return form.items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      return total + quantity * price;
    }, 0);
  }, [form.items]);

  const discountAmount = Number(form.discount) || 0;

  const taxableAmount = Math.max(
    subtotal - discountAmount,
    0
  );

  const gstAmount =
    (taxableAmount * (Number(form.gst) || 0)) / 100;

  const grandTotal = taxableAmount + gstAmount;

  // ============================================================
  // CREATE PURCHASE
  // ============================================================

  const createPurchase = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.supplier_id) {
        setError("Please select a supplier.");
        return;
      }

      const validItems = form.items.filter(
        (item) =>
          item.product_id &&
          Number(item.quantity) > 0 &&
          Number(item.price) >= 0
      );

      if (validItems.length === 0) {
        setError("Please add at least one valid product.");
        return;
      }

      const payload = {
        supplier_id: Number(form.supplier_id),
        gst: Number(form.gst) || 0,
        discount: Number(form.discount) || 0,
        items: validItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      };

      await api.post("/purchases/", payload);

      setShowModal(false);
      resetForm();

      await loadData();
    } catch (err) {
      console.error("Failed to create purchase:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to create purchase."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE PURCHASE
  // ============================================================

  const deletePurchase = async (purchaseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/purchases/${purchaseId}`);

      await loadData();
    } catch (err) {
      console.error("Failed to delete purchase:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to delete purchase."
      );
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const totalPurchases = purchases.length;

  const totalPurchaseValue = purchases.reduce(
    (total, purchase) =>
      total + Number(purchase.grand_total || 0),
    0
  );

  const totalItems = purchases.reduce(
    (total, purchase) =>
      total +
      (purchase.items || []).reduce(
        (itemTotal, item) =>
          itemTotal + Number(item.quantity || 0),
        0
      ),
    0
  );

  // ============================================================
  // FORMATTERS
  // ============================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Purchases
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage supplier purchases and inventory costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            New Purchase
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {typeof error === "string"
            ? error
            : JSON.stringify(error)}
        </div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Total Purchases
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                {totalPurchases}
              </p>
            </div>

            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ShoppingBag size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Purchase Value
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(totalPurchaseValue)}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              <IndianRupee size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Items Purchased
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                {totalItems}
              </p>
            </div>

            <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Package size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search purchases..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400">
          Showing {filteredPurchases.length} of{" "}
          {purchases.length} purchases
        </p>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-slate-400">
            Loading purchases...
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-2xl bg-gray-100 p-4 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
              <ShoppingBag size={28} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
              No purchases found
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Create your first purchase to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Purchase
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Supplier
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Items
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Subtotal
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    GST
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Discount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Grand Total
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {purchase.purchase_number || "-"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        #{purchase.id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {getSupplierName(
                          purchase.supplier_id
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {(purchase.items || []).map(
                          (item) => (
                            <div
                              key={item.id}
                              className="text-xs text-gray-600 dark:text-slate-300"
                            >
                              {getProductName(
                                item.product_id
                              )}{" "}
                              × {item.quantity}
                            </div>
                          )
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                      {formatCurrency(
                        purchase.subtotal
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                      {formatCurrency(purchase.gst)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">
                      {formatCurrency(
                        purchase.discount
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(
                          purchase.grand_total
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                      {formatDate(
                        purchase.invoice_date ||
                          purchase.created_at
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          deletePurchase(
                            purchase.id
                          )
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        title="Delete purchase"
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

      {/* CREATE PURCHASE MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  New Purchase
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Record products purchased from a supplier.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={createPurchase}
              className="space-y-6 p-6"
            >
              {/* SUPPLIER */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Supplier
                </label>

                <select
                  value={form.supplier_id}
                  onChange={(event) =>
                    updateForm(
                      "supplier_id",
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.supplier_name} (
                      {supplier.supplier_code})
                    </option>
                  ))}
                </select>

                {suppliers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    No suppliers available. Create a supplier first.
                  </p>
                )}
              </div>

              {/* ITEMS */}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Purchase Items
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Add the products and purchase prices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    <Plus size={16} />

                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-12 dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <div className="md:col-span-5">
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">
                          Product
                        </label>

                        <select
                          value={item.product_id}
                          onChange={(event) =>
                            handleProductChange(
                              index,
                              event.target.value
                            )
                          }
                          required
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="">
                            Select product
                          </option>

                          {products.map((product) => (
                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.product_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">
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
                          required
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-slate-400">
                          Purchase Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(event) =>
                            updateItem(
                              index,
                              "price",
                              event.target.value
                            )
                          }
                          required
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex items-end justify-end md:col-span-2">
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          disabled={
                            form.items.length === 1
                          }
                          className="rounded-lg p-2.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-500/10"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="md:col-span-12">
                        <p className="text-right text-xs text-gray-500 dark:text-slate-400">
                          Item Total:{" "}
                          <span className="font-semibold text-gray-700 dark:text-slate-200">
                            {formatCurrency(
                              (Number(item.quantity) ||
                                0) *
                                (Number(item.price) ||
                                  0)
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GST / DISCOUNT */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      updateForm(
                        "gst",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

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
                      updateForm(
                        "discount",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* SUMMARY */}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                  Purchase Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-slate-300">
                    <span>Subtotal</span>

                    <span>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-slate-300">
                    <span>Discount</span>

                    <span>
                      - {formatCurrency(discountAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-slate-300">
                    <span>
                      GST ({Number(form.gst) || 0}%)
                    </span>

                    <span>
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

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    suppliers.length === 0 ||
                    products.length === 0
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchasePage;