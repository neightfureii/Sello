import { useCallback, useEffect, useState } from "react";
import { api, type Product, type Category } from "../api";
import { useAuth } from "../auth/AuthContext";
import { Search, Plus, LayoutGrid } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function InventoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(() => {
    // Fetch products
    api<{ products: Product[] } | Product[]>("/products")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.products;
        setProducts(data || []);
      })
      .catch((err) => setError(err.message));

    // Fetch categories from your backend API
    api<{ categories: Category[] } | Category[]>("/categories")
      .then((d) => {
        // Handles both { categories: [...] } or direct [...] responses
        const data = Array.isArray(d) ? d : d?.categories;
        setCategories(data || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(loadData, [loadData]);

  // Filter products based on search query
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || (p as any).categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* --- TOP SUMMARY CARDS --- */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock Records Card */}
          <div className="bg-[#f0f4fa] rounded-3xl p-4 flex flex-col justify-between border border-blue-100/60 shadow-sm">
            <div>
              <span className="text-sm font-bold text-gray-500">
                Stock Records
              </span>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                1,560
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                Latest Update: 21/07/2026
              </div>
            </div>
            <Button
              className="mt-6 flex items-center justify-center gap-2 text-sm"
              onClick={() => navigate("/products/add-stock")}
            >
              <Plus size={18} /> Add Stock
            </Button>
          </div>

          {/* Products Card */}
          <div className="bg-[#f0f4fa] rounded-3xl p-4 flex flex-col justify-between border border-blue-100/60 shadow-sm">
            <div>
              <span className="text-sm font-bold text-gray-500">Products</span>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                {products.length || 245}
              </div>
              <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-500 font-medium">
                <span>
                  Active Products:{" "}
                  <strong className="text-gray-800">230</strong>
                </span>
                <span>
                  Low Stock Products:{" "}
                  <strong className="text-red-600">15</strong>
                </span>
              </div>
            </div>
            <Button
              className="mt-6 flex items-center justify-center gap-2 text-sm"
              onClick={() => navigate("/products/add-product")}
            >
              <Plus size={18} /> Add New Product
            </Button>
          </div>

          {/* Product Categories Card */}
          <div className="bg-[#f0f4fa] rounded-3xl p-4 flex flex-col justify-between border border-blue-100/60 shadow-sm">
            <div>
              <span className="text-sm font-bold text-gray-500">
                Product Categories
              </span>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                {categories.length || 0}
              </div>
              <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-500 font-medium">
                <span>
                  Active Categories:{" "}
                  <strong className="text-gray-800">16</strong>
                </span>
                <span>
                  Empty Categories: <strong className="text-gray-800">2</strong>
                </span>
              </div>
            </div>
            <Button
              className="mt-6 flex items-center justify-center gap-2 text-sm"
              onClick={() => navigate("/products/add-category")}
            >
              <Plus size={18} /> Add New Category
            </Button>
          </div>
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="sticky top-0 py-3 z-30 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue focus:ring-1 focus:ring-sello-blue outline-none rounded-full py-3.5 pl-12 pr-4 text-sm transition-all text-gray-800 placeholder-gray-500 font-medium shadow-sm"
          />
        </div>
      </div>

      {/* --- PRODUCT CATEGORIES --- */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Product Category
        </h2>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className="flex flex-col items-center gap-2 min-w-[72px] transition-all"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all ${activeCategory === cat.name ? "bg-blue-100 border-blue-200 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"}`}
              >
                {cat.imageUrl && (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover p-1 rounded-[14px]"
                  />
                )}
              </div>
              <span
                className={`text-[13px] font-semibold ${activeCategory === cat.name ? "text-sello-blue" : "text-gray-700"}`}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID SECTION --- */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">
          {activeCategory}{" "}
          <span className="text-gray-500 text-sm font-normal">
            ({filteredProducts.length || "10"})
          </span>
        </h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-32 w-full bg-gray-100 relative">
                <img
                  src={
                    (p as any).imageUrl ||
                    "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3.5 flex flex-col flex-1 gap-2">
                <span className="font-bold text-gray-900 text-sm leading-tight">
                  {p.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-gray-900 text-[14px]">
                    Rs. {Number(p.unitPrice || 0).toFixed(2)}
                  </span>
                  <span className="text-gray-900 font-extrabold text-[11px]">
                    /Kg
                  </span>
                </div>
                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-medium">
                    Available Qty:
                  </span>
                  {/* <span
                    className={`font-bold ${p.stockQty <= p.reorderLevel ? "text-red-600" : "text-gray-800"}`}
                  >
                    {p.stockQty}kg
                  </span> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">
              No products found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
