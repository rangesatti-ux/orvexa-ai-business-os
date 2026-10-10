import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Pencil,
  X,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

import api from "../../services/api";

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] =
    useState([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("product_name");
  const [lowStockThreshold, setLowStockThreshold] =
    useState(10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] = useState({
    product_code: "",
    product_name: "",
    category: "",
    quantity: "",
    price: "",
    supplier: "",
  });

  // --------------------------------------------------
  // Load products
  // --------------------------------------------------

  const loadProducts = async () => {
    const response = await api.get(
      "/products/?page=1&limit=100"
    );

    setProducts(response.data?.products || []);
  };

  // --------------------------------------------------
  // Load low-stock products
  // --------------------------------------------------

  const loadLowStockProducts = async () => {
    const response = await api.get(
      `/products/low-stock/?threshold=${Number(
        lowStockThreshold
      )}&page=1&limit=100`
    );

    setLowStockProducts(
      response.data?.products || []
    );
  };

  // --------------------------------------------------
  // Load sorted products
  // --------------------------------------------------

  const loadSortedProducts = async () => {
    const response = await api.get(
      `/products/sorted/?sort_by=${encodeURIComponent(
        sortBy
      )}&page=1&limit=100`
    );

    setProducts(response.data?.products || []);
  };

  // --------------------------------------------------
  // Load all inventory data
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadProducts(),
        loadLowStockProducts(),
      ]);
    } catch (err) {
      console.error(
        "Inventory loading error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to load inventory data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Reload low-stock when threshold changes
  // --------------------------------------------------

  useEffect(() => {
    if (!loading) {
      loadLowStockProducts().catch((err) => {
        console.error(
          "Low stock loading error:",
          err
        );
      });
    }
  }, [lowStockThreshold]);

  // --------------------------------------------------
  // Handle input
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  const resetForm = () => {
    setFormData({
      product_code: "",
      product_name: "",
      category: "",
      quantity: "",
      price: "",
      supplier: "",
    });

    setEditingProduct(null);
    setShowForm(false);
  };

  // --------------------------------------------------
  // Start editing
  // --------------------------------------------------

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      product_code: product.product_code || "",
      product_name: product.product_name || "",
      category: product.category || "",
      quantity:
        product.quantity !== undefined
          ? String(product.quantity)
          : "",
      price:
        product.price !== undefined
          ? String(product.price)
          : "",
      supplier: product.supplier || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // Create / Update product
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_code.trim()) {
      toast.error("Product code is required.");
      return;
    }

    if (!formData.product_name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0
    ) {
      toast.error("Enter a valid quantity.");
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      toast.error("Enter a valid price.");
      return;
    }

    if (!formData.supplier.trim()) {
      toast.error("Supplier is required.");
      return;
    }

    const payload = {
      product_code:
        formData.product_code.trim(),
      product_name:
        formData.product_name.trim(),
      category: formData.category.trim(),
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      supplier: formData.supplier.trim(),
    };

    try {
      setSaving(true);

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          payload
        );

        toast.success(
          "Product updated successfully."
        );
      } else {
        await api.post("/products/", payload);

        toast.success(
          "Product added successfully."
        );
      }

      resetForm();

      await Promise.all([
        loadProducts(),
        loadLowStockProducts(),
      ]);
    } catch (err) {
      console.error(
        "Product save error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to save product.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete product
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      toast.success(
        "Product deleted successfully."
      );

      await Promise.all([
        loadProducts(),
        loadLowStockProducts(),
      ]);
    } catch (err) {
      console.error(
        "Product delete error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to delete product.";

      toast.error(message);
    }
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.product_code,
        product.product_name,
        product.category,
        product.supplier,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [products, search]);

  // --------------------------------------------------
  // Inventory calculations
  // --------------------------------------------------

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0),
    0
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity || 0) *
        Number(product.price || 0),
    0
  );

  const currency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Inventory Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage products, stock and suppliers.
          </p>
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
            <RefreshCw
              size={20}
              className="animate-spin"
            />
            Loading inventory...
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Inventory Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage products, stock and suppliers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {showForm ? (
              <X size={18} />
            ) : (
              <Plus size={18} />
            )}

            {showForm
              ? "Close Form"
              : "Add Product"}
          </button>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Dashboard cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Products
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {products.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Package size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalStock}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Package size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Low Stock
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {lowStockProducts.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <AlertTriangle size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Stock Value
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {currency(totalValue)}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <IndianRupee size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Product Form */}

      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {editingProduct
                ? "Update the product information."
                : "Add a new product to your inventory."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Product code */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Product Code
                </label>

                <input
                  type="text"
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleChange}
                  placeholder="e.g. PRD003"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Product name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Product Name
                </label>

                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  placeholder="Product name"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Quantity */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Price */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Supplier */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Supplier
                </label>

                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Supplier name"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Low Stock */}

      <div className="rounded-2xl bg-white shadow-sm dark:bg-slate-800">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Low Stock Products
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Products at or below the selected stock
              threshold.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 dark:text-slate-400">
              Threshold
            </label>

            <input
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) =>
                setLowStockThreshold(
                  Number(e.target.value)
                )
              }
              className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-400">
              No low-stock products found.
            </div>
          ) : (
            <table className="min-w-[800px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left dark:border-slate-700 dark:bg-slate-900/50">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Supplier
                  </th>
                </tr>
              </thead>

              <tbody>
                {lowStockProducts.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 dark:border-slate-700"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {product.product_name}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {product.product_code}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {product.category}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            Number(
                              product.quantity
                            ) <= 0
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {product.supplier}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Product List */}

      <div className="rounded-2xl bg-white shadow-sm dark:bg-slate-800">
        <div className="border-b border-gray-100 p-5 dark:border-slate-700">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Product Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {products.length} product
                {products.length !== 1
                  ? "s"
                  : ""}{" "}
                in inventory
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-64 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Sort */}

              <select
                value={sortBy}
                onChange={async (e) => {
                  const value = e.target.value;

                  setSortBy(value);

                  try {
                    const response =
                      await api.get(
                        `/products/sorted/?sort_by=${encodeURIComponent(
                          value
                        )}&page=1&limit=100`
                      );

                    setProducts(
                      response.data?.products ||
                        []
                    );
                  } catch (err) {
                    console.error(
                      "Product sorting error:",
                      err
                    );

                    toast.error(
                      "Unable to sort products."
                    );
                  }
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="product_name">
                  Sort by Name
                </option>

                <option value="category">
                  Sort by Category
                </option>

                <option value="quantity">
                  Sort by Quantity
                </option>

                <option value="price">
                  Sort by Price
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Product table */}

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left dark:border-slate-700 dark:bg-slate-900/50">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Product
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Quantity
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Price
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Stock Value
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Supplier
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <Package
                      size={40}
                      className="mx-auto text-gray-300 dark:text-slate-600"
                    />

                    <p className="mt-3 font-medium text-gray-600 dark:text-slate-300">
                      No products found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (product) => {
                    const quantity =
                      Number(
                        product.quantity || 0
                      );

                    const price =
                      Number(
                        product.price || 0
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {product.product_name}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {product.product_code}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                          {product.category}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              quantity <=
                              lowStockThreshold
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {quantity}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-slate-300">
                          {currency(price)}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                          {currency(
                            quantity * price
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                          {product.supplier}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30"
                              title="Edit product"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  product.id
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                              title="Delete product"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;