import { useCallback, useEffect, useState } from "react";
import { api, type Category } from "../api";
import { useToast } from "../context/ToastContext";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useAuth } from "../auth/AuthContext";

export default function CategoriesPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = useCallback(() => {
    api<{ categories: Category[] } | Category[]>("/categories")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.categories;
        setCategories(data || []);
      })
      .catch((err) =>
        showToast(err.message || "Failed to load categories", "error"),
      );
  }, [showToast]);

  useEffect(loadData, [loadData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
          <BackButton />
          <h3 className="font-bold text-gray-900 text-base">Categories</h3>
        </div>

        <button
          onClick={() => navigate("/inventory/categories/add-category")}
          className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          Add New Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f4fa] text-gray-700 text-xs font-extrabold border-b border-gray-100">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">No of Products</th>
                {user?.role === "admin" && <th className="py-4 px-6">Shop</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {categories.length > 0 ? (
                categories.map((u: Category) => (
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
                      {u.description}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">
                      {u.noOfProducts || 0}
                    </td>
                    {user?.role === "admin" && (
                      <td className="py-4 px-6">{u.shop.name}</td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-400 text-sm font-medium"
                  >
                    No categories found.
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
