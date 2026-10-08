import { useCallback, useEffect, useState } from "react";
import { api, type Product } from "../api";
import { useToast } from "../context/ToastContext";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useAuth } from "../auth/AuthContext";

export default function ProductsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  const loadData = useCallback(() => {
    api<{ products: Product[] } | Product[]>("/products")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.products;
        setProducts(data || []);
      })
      .catch((err) =>
        showToast(err.message || "Failed to load products", "error"),
      );
  }, [showToast]);

  useEffect(loadData, [loadData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
          <BackButton />
          <h3 className="font-bold text-gray-900 text-base">Products</h3>
        </div>

        <button
          onClick={() => navigate("/inventory/products/add-product")}
          className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f4fa] text-gray-700 text-xs font-extrabold border-b border-gray-100">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Min Stock Allowed</th>
                <th className="py-4 px-6">Unit</th>
                <th className="py-4 px-6">Unit Price</th>
                <th className="py-4 px-6">Available Qty</th>
                {user?.role === "admin" && <th className="py-4 px-6">Shop</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.length > 0 ? (
                products.map((u: any) => (
                  <tr
                    key={u.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {u.imageUrl ? (
                          <img
                            src={u.imageUrl}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users size={16} className="text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{u.name}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {u.category?.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-50 text-sello-blue font-bold text-xs rounded-full uppercase tracking-wide">
                        {u.minStockAllowed}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">
                      {u.unit}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">
                      Rs. {Number(u.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-gray-900">
                      {u.availableQty} {u.unit}
                    </td>
                    {user?.role === "admin" && (
                      <td className="py-4 px-6 text-gray-700 font-semibold">
                        {u.shop?.name}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-400 text-sm font-medium"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
