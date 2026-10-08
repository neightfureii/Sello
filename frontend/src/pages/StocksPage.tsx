import { useCallback, useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { api, type StockRecord } from "../api";
import { Search, Calendar, ChevronDown, ArrowUpDown } from "lucide-react";
import { useToast } from "../context/ToastContext";
import StockRecordModal from "../components/StockRecordModal";
import { useAuth } from "../auth/AuthContext";

export default function StocksPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockRecordModalOpen, setStockRecordModalOpen] = useState(false);
  const [selectedStockRecord, setSelectedStockRecord] =
    useState<StockRecord | null>(null);

  const loadStockRecords = useCallback(() => {
    setLoading(true);
    api<{ stockRecords: StockRecord[] } | StockRecord[]>("/stock-records")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.stockRecords;
        setStockRecords(data || []);
      })
      .catch((err) => {
        showToast(err.message || "Failed to load stock records", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadStockRecords();
  }, [loadStockRecords]);

  // Filter stock records based on search query (invoice no or payment method)
  const filteredStockRecords = stockRecords.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.stockReference?.toLowerCase().includes(query) ||
      s.paymentSource?.toLowerCase().includes(query)
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
            placeholder="Search by Ref No"
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

      {/* Stock Records Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#dce9fd] text-gray-800 text-xs font-extrabold border-b border-gray-200">
                <th className="py-4 px-6">Date Acquired</th>
                <th className="py-4 px-6">Ref No</th>
                <th className="py-4 px-6">Payment source</th>
                <th className="py-4 px-6 text-right">Amount (LKR)</th>
                <th className="py-4 px-6">Status</th>
                {user?.role === "admin" && <th className="py-4 px-6">Shop</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-400 font-medium"
                  >
                    Loading stock records...
                  </td>
                </tr>
              ) : filteredStockRecords.length > 0 ? (
                filteredStockRecords.map((stockRecord) => {
                  const isReverted = stockRecord.status === "reverted";
                  const formattedDate = new Date(
                    stockRecord.createdAt,
                  ).toLocaleDateString("en-GB");

                  return (
                    <tr
                      key={stockRecord.id}
                      onClick={() => {
                        setStockRecordModalOpen(true);
                        setSelectedStockRecord(stockRecord);
                      }}
                      className={`transition-colors hover:cursor-pointer ${
                        isReverted
                          ? "bg-rose-50/60 hover:bg-rose-50"
                          : "hover:bg-blue-50/30"
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-gray-800">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {stockRecord.stockReference}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700 font-medium capitalize">
                          {stockRecord.paymentSource?.replace("_", " ")}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-extrabold ${
                          isReverted
                            ? "text-gray-400 line-through"
                            : "text-emerald-600"
                        }`}
                      >
                        {Number(stockRecord.totalAmount).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`font-bold ${isReverted ?? "text-rose-600"}`}
                        >
                          {stockRecord.status}
                        </span>
                      </td>
                      {user?.role === "admin" && (
                        <td className="py-4 px-6 text-gray-900">
                        {stockRecord.shop.name}
                      </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-400 font-medium"
                  >
                    No stock records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stockRecordModalOpen && selectedStockRecord && (
        <StockRecordModal
          stockRecord={selectedStockRecord}
          onClose={() => {
            setStockRecordModalOpen(false);
            setSelectedStockRecord(null);
          }}
          onRevertSuccess={() => {
            loadStockRecords();
          }}
          isOpen={stockRecordModalOpen}
        />
      )}
    </div>
  );
}
