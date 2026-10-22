import { useCallback, useEffect, useState } from "react";
import { api, type Product } from "../api";
import { useToast } from "../context/ToastContext";
import { Plus, Users, XCircle, AlertTriangle, Search, ArrowUpDown, ChevronDown, Check, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useAuth } from "../auth/AuthContext";

export default function ProductsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  
  // Search, Sort, and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-high" | "price-low" | "qty-low">("name");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">("all");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

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

  // Filtering and Sorting logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isOutOfStock = p.availableQty === 0;
    const isLowStock =
      p.availableQty !== undefined &&
      p.minStockAllowed !== undefined &&
      p.availableQty > 0 &&
      p.availableQty < p.minStockAllowed;

    if (statusFilter === "out" && !isOutOfStock) return false;
    if (statusFilter === "low" && !isLowStock) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price-high") return Number(b.unitPrice) - Number(a.unitPrice);
    if (sortBy === "price-low") return Number(a.unitPrice) - Number(b.unitPrice);
    if (sortBy === "qty-low") return Number(a.availableQty) - Number(b.availableQty);
    return 0;
  });

  const totalColumns = user?.role === "admin" ? 7 : 6;

  return (
    <div className="flex flex-col gap-6 relative">
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

      {/* Search, Status Filter & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-500 font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative">
          
          {/* STATUS FILTER DROPDOWN */}
          <div className="relative">
            <div
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none"
            >
              <Filter size={16} className="text-gray-500" />
              <span>
                {statusFilter === "all" ? "All Status" : statusFilter === "low" ? "Low Stock" : "Out of Stock"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {isStatusOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-30">
                {[
                  { id: "all", label: "All Products" },
                  { id: "low", label: "Low Stock Only" },
                  { id: "out", label: "Out of Stock Only" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setStatusFilter(option.id as any);
                      setIsStatusOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between hover:bg-blue-50 text-gray-700 transition-colors cursor-pointer"
                  >
                    {option.label}
                    {statusFilter === option.id && <Check size={14} className="text-sello-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SORT BY DROPDOWN */}
          <div className="relative">
            <div
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsStatusOpen(false);
              }}
              className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none"
            >
              <ArrowUpDown size={16} className="text-gray-500" />
              <span>
                Sort: {sortBy === "name" ? "Name" : sortBy === "price-high" ? "Highest Price" : sortBy === "price-low" ? "Lowest Price" : "Lowest Qty"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-30">
                {[
                  { id: "name", label: "Alphabetical (A-Z)" },
                  { id: "price-high", label: "Highest Price" },
                  { id: "price-low", label: "Lowest Price" },
                  { id: "qty-low", label: "Lowest Available Qty" },
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((u: Product) => {
                  const isOutOfStock = u.availableQty === 0;
                  const isLowStock =
                    u.availableQty !== undefined &&
                    u.minStockAllowed !== undefined &&
                    u.availableQty > 0 &&
                    u.availableQty < u.minStockAllowed;

                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        isOutOfStock
                          ? "bg-red-50/40 hover:bg-red-50/70"
                          : isLowStock
                          ? "bg-amber-50/40 hover:bg-amber-50/70"
                          : "hover:bg-blue-50/30"
                      }`}
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
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-700"
                                : "text-gray-900"
                            }`}
                          >
                            {u.availableQty} {u.unit}
                          </span>

                          {isOutOfStock && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              <XCircle size={12} /> Out of Stock
                            </span>
                          )}

                          {isLowStock && !isOutOfStock && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              <AlertTriangle size={12} /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      {user?.role === "admin" && (
                        <td className="py-4 px-6 text-gray-700 font-semibold">
                          {u.shop?.name || "N/A"}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="py-8 text-center text-gray-400 text-sm font-medium"
                  >
                    No products found matching your search or filters.
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