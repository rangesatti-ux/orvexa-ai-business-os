import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import InventoryForm from "./InventoryForm";
import InventoryTable from "./InventoryTable";

function InventoryPage() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("inventory");

    return saved
      ? JSON.parse(saved)
      : [
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
        ];
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "inventory",
      JSON.stringify(products)
    );
  }, [products]);

  const addProduct = (product) => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...product,
      },
    ]);

    toast.success("Product Added Successfully");
  };

  const deleteProduct = (id) => {
    setProducts((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.error("Product Deleted");
  };

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = products.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalValue = products.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const lowStock = products.filter(
    (item) => item.quantity < 10
  ).length;

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Inventory Management
      </h1>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-500 text-white rounded-xl p-5 shadow">
          <h3>Total Products</h3>

          <p className="text-3xl font-bold">
            {products.length}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-5 shadow">
          <h3>Total Stock</h3>

          <p className="text-3xl font-bold">
            {totalStock}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow">
          <h3>Low Stock</h3>

          <p className="text-3xl font-bold">
            {lowStock}
          </p>
        </div>

        <div className="bg-red-500 text-white rounded-xl p-5 shadow">
          <h3>Total Value</h3>

          <p className="text-3xl font-bold">
            ₹{totalValue.toLocaleString()}
          </p>
        </div>

      </div>

      {/* Add Product Form */}

      <InventoryForm
        addProduct={addProduct}
      />

      {/* Search */}

      <input
        type="text"
        placeholder="Search Product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
      />

      {/* Inventory Table */}

      <InventoryTable
        products={filteredProducts}
        deleteProduct={deleteProduct}
      />

    </div>
  );
}

export default InventoryPage;