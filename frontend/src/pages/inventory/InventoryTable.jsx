import { Pencil, Trash2 } from "lucide-react";

function InventoryTable({
  products,
  deleteProduct,
  editProduct,
  lowStockThreshold = 10,
}) {
  const currency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Product Name & Code</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Stock Value</th>
              <th className="p-4">Supplier</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-gray-500 dark:text-slate-400">
                  No Products Found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const qty = Number(product.quantity || 0);
                const price = Number(product.price || 0);
                const isLowStock = qty <= lowStockThreshold;

                return (
                  <tr
                    key={product.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="p-4 text-sm font-medium text-gray-800 dark:text-white">
                      #{product.id}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {product.product_name || product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {product.product_code || "—"}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-gray-600 dark:text-slate-300">
                      {product.category}
                    </td>

                    <td className="p-4 text-center text-sm font-semibold text-gray-800 dark:text-white">
                      {qty}
                    </td>

                    <td className="p-4 text-right text-sm text-gray-700 dark:text-slate-300">
                      {currency(price)}
                    </td>

                    <td className="p-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {currency(qty * price)}
                    </td>

                    <td className="p-4 text-sm text-gray-600 dark:text-slate-300">
                      {product.supplier}
                    </td>

                    <td className="p-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        {editProduct && (
                          <button
                            type="button"
                            onClick={() => editProduct(product)}
                            className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700"
                            title="Edit product"
                          >
                            <Pencil size={18} />
                          </button>
                        )}

                        {deleteProduct && (
                          <button
                            type="button"
                            onClick={() => deleteProduct(product.id)}
                            className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700"
                            title="Delete product"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;