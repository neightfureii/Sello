import { useCallback, useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { api } from "../api";
import { Search, Calendar, ChevronDown, ArrowUpDown } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface SaleRecord {
  id: string;
  billNo: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function StocksPage() {
  const { showToast } = useToast();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Filter sales based on search query (invoice no or payment method)
  const filteredSales = sales.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.billNo?.toLowerCase().includes(query) ||
      s.paymentMethod?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Stock Records</h3>
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
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-500 font-medium transition-all"
          />
        </div>

        {/* Sort By & Date Range Dropdown Badges */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none">
            <ArrowUpDown size={16} className="text-gray-500" />
            <span>Sort by</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>

          <div className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none">
            <Calendar size={16} className="text-gray-500" />
            <span>02/07/2026 - 02/08/2026</span>
            <ChevronDown size={16} className="text-gray-500" />
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
                <th className="py-4 px-6">Invoice No</th>
                <th className="py-4 px-6">Payment method</th>
                <th className="py-4 px-6 text-right">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
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
                      className={`transition-colors ${
                        isReverted
                          ? "bg-rose-50/60 hover:bg-rose-50"
                          : "hover:bg-blue-50/30"
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-gray-800">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {sale.billNo}
                      </td>
                      <td className="py-4 px-6">
                        {isReverted ? (
                          <span className="text-rose-600 font-bold">
                            Reverted
                          </span>
                        ) : (
                          <span className="text-gray-700 font-medium capitalize">
                            {sale.paymentMethod?.replace("_", " ")}
                          </span>
                        )}
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
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
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
    </div>
  );
}
