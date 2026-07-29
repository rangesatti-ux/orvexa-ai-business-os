import { useEffect, useState } from "react";

function InventoryForm({
  saveProduct,
  editingProduct,
  isEditing,
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
        name: editingProduct.name,
        category: editingProduct.category,
        quantity: editingProduct.quantity,
        price: editingProduct.price,
        supplier: editingProduct.supplier,
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
      !formData.name ||
      !formData.category ||
      !formData.supplier
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (quantity < 0 || price < 0) {
      alert("Quantity and Price cannot be negative.");
      return;
    }

    saveProduct({
      name: formData.name,
      category: formData.category,
      quantity,
      price,
      supplier: formData.supplier,
    });

    setFormData({
      name: "",
      category: "",
      quantity: "",
      price: "",
      supplier: "",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Update Product" : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border rounded-lg p-3"
            min="0"
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border rounded-lg p-3"
            min="0"
            required
          />

          <input
            type="text"
            name="supplier"
            placeholder="Supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="border rounded-lg p-3 md:col-span-2"
            required
          />

        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          {isEditing ? "Update Product" : "Add Product"}
        </button>

      </form>

    </div>
  );
}

export default InventoryForm;