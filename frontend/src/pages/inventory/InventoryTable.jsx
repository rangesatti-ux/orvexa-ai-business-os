import { Pencil, Trash2 } from "lucide-react";

function InventoryTable({
  products,
  deleteProduct,
  editProduct,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-center">Quantity</th>
            <th className="p-4 text-right">Price</th>
            <th className="p-4 text-left">Supplier</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>

          {products.length === 0 ? (

            <tr>
              <td
                colSpan="8"
                className="text-center py-8 text-gray-500"
              >
                No Products Found
              </td>
            </tr>

          ) : (

            products.map((product) => (

              <tr
                key={product.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {product.id}
                </td>

                <td className="p-4 font-medium">
                  {product.name}
                </td>

                <td className="p-4">
                  {product.category}
                </td>

                <td className="p-4 text-center font-semibold">
                  {product.quantity}
                </td>

                <td className="p-4 text-right">
                  ₹{Number(product.price).toLocaleString()}
                </td>

                <td className="p-4">
                  {product.supplier}
                </td>

                <td className="p-4 text-center">

                  {Number(product.quantity) < 10 ? (

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Low Stock
                    </span>

                  ) : (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      In Stock
                    </span>

                  )}

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => editProduct(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default InventoryTable;