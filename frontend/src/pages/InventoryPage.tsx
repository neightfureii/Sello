import { useCallback, useEffect, useState } from "react";
import { api, type Product, type Category, type StockRecord } from "../api";
import { useAuth } from "../auth/AuthContext";
import {
  Search,
  Plus,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function InventoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(() => {
    api<{ stockRecords: StockRecord[] } | StockRecord[]>("/stock-records")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.stockRecords;
        setStockRecords(data || []);
      })
      .catch((err) => setError(err.message));

    api<{ products: Product[] } | Product[]>("/products")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.products;
        setProducts(data || []);
      })
      .catch((err) => setError(err.message));

    api<{ categories: Category[] } | Category[]>("/categories")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.categories;
        setCategories(data || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(loadData, [loadData]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || p.categoryId === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const activeCategoryName =
    activeCategory === "All"
      ? "All Products"
      : categories.find((c) => c.id === activeCategory)?.name || "Products";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* --- TOP SUMMARY CARDS --- */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock Records Card */}
          <div
            onClick={() => navigate("/inventory/stocks")}
            className="group bg-gradient-to-br from-blue-50/50 to-[#f0f4fa] rounded-3xl p-6 flex flex-col justify-between border border-blue-100 shadow-sm hover:shadow-md hover:border-sello-blue transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Stock Records
                </span>
                <div className="text-4xl font-extrabold text-gray-900 mt-2">
                  {stockRecords.length}
                </div>
              </div>
              <span className="text-xs font-semibold text-sello-blue flex items-center gap-1 group-hover:underline">
                View all records <ArrowRight size={14} />
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-blue-100/80">
              <Button
                className="text-xs py-2 px-4 shadow-none flex items-center gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/inventory/stocks/add-stock");
                }}
              >
                <Plus size={16} /> Add Stock
              </Button>
            </div>
          </div>

          {/* Products Card */}
          <div
            onClick={() => navigate("/inventory/products")}
            className="group bg-gradient-to-br from-indigo-50/40 to-[#f0f4fa] rounded-3xl p-6 flex flex-col justify-between border border-indigo-100/80 shadow-sm hover:shadow-md hover:border-sello-blue transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Products
                </span>
                <div className="text-4xl font-extrabold text-gray-900 mt-2">
                  {products.length || 0}
                </div>
              </div>
              <span className="text-xs font-semibold text-sello-blue flex items-center gap-1 group-hover:underline">
                Manage inventory <ArrowRight size={14} />
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-indigo-100/60">
              <Button
                className="text-xs py-2 px-4 shadow-none flex items-center gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/inventory/products/add-product");
                }}
              >
                <Plus size={16} /> Add Product
              </Button>
            </div>
          </div>

          {/* Product Categories Card */}
          <div
            onClick={() => navigate("/inventory/categories")}
            className="group bg-gradient-to-br from-sky-50/40 to-[#f0f4fa] rounded-3xl p-6 flex flex-col justify-between border border-sky-100/80 shadow-sm hover:shadow-md hover:border-sello-blue transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Product Categories
                </span>
                <div className="text-4xl font-extrabold text-gray-900 mt-2">
                  {categories.length || 0}
                </div>
              </div>
              <span className="text-xs font-semibold text-sello-blue flex items-center gap-1 group-hover:underline">
                View categories <ArrowRight size={14} />
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-sky-100/60">
              <Button
                className="text-xs py-2 px-4 shadow-none flex items-center gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/inventory/categories/add-category");
                }}
              >
                <Plus size={16} /> Add Category
              </Button>
            </div>
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
            placeholder="Search products..."
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
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex flex-col items-center justify-center min-w-[72px] h-[76px] transition-all rounded-2xl p-1 pb-2 shadow-sm border cursor-pointer ${
              activeCategory === "All"
                ? "border-blue-200 bg-blue-100 text-sello-blue"
                : "border-gray-100 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <LayoutGrid />
            <span className="text-[12px] font-bold">All</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center gap-1.5 min-w-[72px] transition-all rounded-2xl p-1 pb-2 shadow-sm border cursor-pointer ${
                activeCategory === cat.id
                  ? "border-blue-200 bg-blue-100"
                  : "border-gray-100 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="w-16 h-12 rounded-xl overflow-hidden">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className={`w-full h-full object-cover ${activeCategory === cat.id ? "opacity-80" : ""}`}
                />
              </div>
              <span
                className={`text-[12px] font-semibold ${activeCategory === cat.id ? "text-sello-blue" : "text-gray-700"}`}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID SECTION --- */}
      <div className="flex flex-col gap-4">
        <h2 className="hidden lg:block text-lg font-bold text-gray-900">
          {activeCategoryName}{" "}
          <span className="text-gray-500 text-sm font-normal">
            ({filteredProducts.length.toString().padStart(2, "0")})
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
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
