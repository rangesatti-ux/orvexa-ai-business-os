import { useEffect, useState } from "react";

function InventoryForm({
  saveProduct,
  editingProduct,
  isEditing,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    supplier: "",
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        category: editingProduct.category || "",
        quantity: editingProduct.quantity ?? "",
        price: editingProduct.price ?? "",
        supplier: editingProduct.supplier || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        quantity: "",
        price: "",
        supplier: "",
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = Number(formData.quantity);
    const price = Number(formData.price);

    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.supplier.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (quantity < 0 || price < 0) {
      alert("Quantity and Price cannot be negative.");
      return;
    }

    saveProduct({
      name: formData.name.trim(),
      category: formData.category.trim(),
      quantity,
      price,
      supplier: formData.supplier.trim(),
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? "Update Product" : "Add Product"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Fill in the inventory product details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Wireless Mouse"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Electronics"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              placeholder="0"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              min="0"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              placeholder="e.g. TechCorp Distributors"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventoryForm;