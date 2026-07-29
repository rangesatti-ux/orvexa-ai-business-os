import { useState } from "react";
import { toast } from "react-toastify";

import InventoryForm from "./InventoryForm";
import InventoryTable from "./InventoryTable";

import { exportToPDF } from "../../utils/exportPDF";
import { exportToExcel } from "../../utils/exportExcel";

function InventoryPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Laptop",
      category: "Electronics",
      quantity: 20,
      price: 50000,
      supplier: "Dell",
    },
    {
      id: 2,
      name: "Printer",
      category: "Office",
      quantity: 5,
      price: 12000,
      supplier: "HP",
    },
  ]);

  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const saveProduct = (product) => {
    if (isEditing) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? { ...product, id: editingProduct.id }
            : item
        )
      );

      toast.success("Product updated successfully!");

      setEditingProduct(null);
      setIsEditing(false);
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...product,
        },
      ]);

      toast.success("Product added successfully!");
    }
  };

  const deleteProduct = (id) => {
    setProducts((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.error("Product deleted successfully!");
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = products.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const totalValue = products.reduce(
    (sum, item) =>
      sum + Number(item.quantity) * Number(item.price),
    0
  );

  const lowStock = products.filter(
    (item) => Number(item.quantity) < 10
  ).length;

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Inventory Management
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToPDF(filteredProducts, "Inventory_Report")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredProducts, "Inventory_Report")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            📊 Export Excel
          </button>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5">
          <h3>Total Products</h3>
          <p className="text-3xl font-bold">
            {products.length}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5">
          <h3>Total Stock</h3>
          <p className="text-3xl font-bold">
            {totalStock}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5">
          <h3>Low Stock</h3>
          <p className="text-3xl font-bold">
            {lowStock}
          </p>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5">
          <h3>Total Value</h3>
          <p className="text-3xl font-bold">
            ₹{totalValue.toLocaleString()}
          </p>
        </div>

      </div>

      <InventoryForm
        saveProduct={saveProduct}
        editingProduct={editingProduct}
        isEditing={isEditing}
      />

      <input
        type="text"
        placeholder="Search Product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg p-3"
      />

      <InventoryTable
        products={filteredProducts}
        deleteProduct={deleteProduct}
        editProduct={editProduct}
      />

    </div>
  );
}

export default InventoryPage;