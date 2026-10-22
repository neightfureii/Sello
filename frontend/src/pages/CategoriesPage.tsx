import { useCallback, useEffect, useState } from "react";
import { api, type Category } from "../api";
import { useToast } from "../context/ToastContext";
import { Plus, Users, Search, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useAuth } from "../auth/AuthContext";

export default function CategoriesPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "products-high" | "products-low">("name");
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "products-high") return (b.noOfProducts || 0) - (a.noOfProducts || 0);
    if (sortBy === "products-low") return (a.noOfProducts || 0) - (b.noOfProducts || 0);
    return 0;
  });

  const totalColumns = user?.role === "admin" ? 4 : 3;

  return (
    <div className="flex flex-col gap-6 relative">
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

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-500 font-medium transition-all"
          />
        </div>

        <div className="relative">
          <div
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none"
          >
            <ArrowUpDown size={16} className="text-gray-500" />
            <span>Sort: {sortBy === "name" ? "Name" : sortBy === "products-high" ? "Most Products" : "Fewest Products"}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-30">
              {[
                { id: "name", label: "Alphabetical (A-Z)" },
                { id: "products-high", label: "Most Products" },
                { id: "products-low", label: "Fewest Products" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id as any);
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between hover:bg-blue-50 text-gray-700 transition-colors cursor-pointer"
                >
                  {option.label}
                  {sortBy === option.id && <Check size={14} className="text-sello-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((u: Category) => (
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
                      <td className="py-4 px-6 font-bold">{u.shop?.name || "N/A"}</td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={totalColumns}
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