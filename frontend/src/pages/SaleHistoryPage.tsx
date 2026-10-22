import { useCallback, useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { api, type SaleRecord } from "../api";
import { Search, Calendar, ChevronDown, ArrowUpDown, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import SaleRecordModal from "../components/SaleRecordModal";
import { useAuth } from "../auth/AuthContext";

export default function SaleHistoryPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saleRecordModalOpen, setSaleRecordModalOpen] = useState(false);
  const [selectedSaleRecord, setSelectedSaleRecord] =
    useState<SaleRecord | null>(null);

  // Filter & Sort States
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "month">("all");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const loadSales = useCallback(() => {
    setLoading(true);
    api<{ sales: SaleRecord[] } | SaleRecord[]>("/sales")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.sales;
        setSales(data || []);
      })
      .catch((err) => {
        showToast(err.message || "Failed to load sales records", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Filter sales based on search query, status, and date range
  const filteredSales = sales.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.billNo?.toLowerCase().includes(query) ||
      s.paymentMethod?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Date filtering logic
    if (dateFilter !== "all") {
      const saleDate = new Date(s.createdAt).getTime();
      const now = new Date().getTime();
      const diffDays = (now - saleDate) / (1000 * 60 * 60 * 24);

      if (dateFilter === "7days" && diffDays > 7) return false;
      if (dateFilter === "month" && diffDays > 30) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "highest") {
      return Number(b.totalAmount) - Number(a.totalAmount);
    }
    if (sortBy === "lowest") {
      return Number(a.totalAmount) - Number(b.totalAmount);
    }
    return 0;
  });

  const totalColumns = user?.role === "admin" ? 6 : 5;

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Sale Records</h3>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by bill number or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-500 font-medium transition-all"
          />
        </div>

        {/* Sort By & Date Range Dropdown Badges */}
        <div className="flex items-center gap-3 w-full sm:w-auto relative">
          
          {/* SORT BY DROPDOWN */}
          <div className="relative">
            <div
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsDateOpen(false);
              }}
              className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none"
            >
              <ArrowUpDown size={16} className="text-gray-500" />
              <span>
                Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "highest" ? "Highest Amount" : "Lowest Amount"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-30">
                {[
                  { id: "newest", label: "Newest First" },
                  { id: "oldest", label: "Oldest First" },
                  { id: "highest", label: "Highest Amount" },
                  { id: "lowest", label: "Lowest Amount" },
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

          {/* DATE RANGE FILTER DROPDOWN */}
          <div className="relative">
            <div
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none"
            >
              <Calendar size={16} className="text-gray-500" />
              <span>
                {dateFilter === "all" ? "All Time" : dateFilter === "7days" ? "Last 7 Days" : "Last 30 Days"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {isDateOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-30">
                {[
                  { id: "all", label: "All Time" },
                  { id: "7days", label: "Last 7 Days" },
                  { id: "month", label: "Last 30 Days" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setDateFilter(option.id as any);
                      setIsDateOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between hover:bg-blue-50 text-gray-700 transition-colors cursor-pointer"
                  >
                    {option.label}
                    {dateFilter === option.id && <Check size={14} className="text-sello-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sales Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#dce9fd] text-gray-800 text-xs font-extrabold border-b border-gray-200">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Bill No</th>
                <th className="py-4 px-6">Payment method</th>
                <th className="py-4 px-6 text-right">Amount (LKR)</th>
                <th className="py-4 px-6 text-right">Status</th>
                {user?.role === "admin" && (
                  <th className="py-4 px-6 text-right">Shop</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="py-8 text-center text-gray-400 font-medium"
                  >
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const isReverted = sale.status === "reverted";
                  const formattedDate = new Date(
                    sale.createdAt,
                  ).toLocaleDateString("en-GB");

                  return (
                    <tr
                      key={sale.id}
                      className={`transition-colors hover:cursor-pointer ${
                        isReverted
                          ? "bg-rose-50/60 hover:bg-rose-50"
                          : "hover:bg-blue-50/30"
                      }`}
                      onClick={() => {
                        setSaleRecordModalOpen(true);
                        setSelectedSaleRecord(sale);
                      }}
                    >
                      <td className="py-4 px-6 font-medium text-gray-800">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {sale.billNo}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700 font-medium capitalize">
                          {sale.paymentMethod?.replace("_", " ")}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-extrabold ${
                          isReverted
                            ? "text-gray-400 line-through"
                            : "text-emerald-600"
                        }`}
                      >
                        {Number(sale.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-bold capitalize px-2 py-1 rounded-md text-xs ${
                            isReverted ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      {user?.role === "admin" && (
                        <td className="py-4 px-6 text-right font-bold text-gray-900">
                          {sale.shop?.name || "N/A"}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="py-8 text-center text-gray-400 font-medium"
                  >
                    No sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {saleRecordModalOpen && selectedSaleRecord && (
        <SaleRecordModal
          saleRecord={selectedSaleRecord}
          onClose={() => {
            setSaleRecordModalOpen(false);
            setSelectedSaleRecord(null);
          }}
          onRevertSuccess={() => {
            loadSales();
          }}
          isOpen={saleRecordModalOpen}
        />
      )}
    </div>
  );
}