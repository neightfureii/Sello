import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Minus, Wallet, Building2 } from "lucide-react";
import { api, type SaleRecord, type StockRecord } from "../api";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import TransactionModal from "../components/TransactionModal";
import type { ModalType } from "../constants";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const labelFromSource = (source: string) =>
  source
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function AccountsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] =
    useState<ModalType | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api<{ sales: SaleRecord[] } | SaleRecord[]>("/sales"),
      api<{ stockRecords: StockRecord[] } | StockRecord[]>("/stock-records"),
    ])
      .then(([salesResponse, stockRecordsResponse]) => {
        setSales(
          Array.isArray(salesResponse)
            ? salesResponse
            : salesResponse?.sales || [],
        );
        setStockRecords(
          Array.isArray(stockRecordsResponse)
            ? stockRecordsResponse
            : stockRecordsResponse?.stockRecords || [],
        );
      })
      .catch((err) => {
        showToast(err.message || "Failed to load account data", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const accountSummary = useMemo(() => {
    const validSales = sales.filter((sale) => sale.status !== "reverted");
    const validStockRecords = stockRecords.filter(
      (record) => record.status !== "reverted",
    );

    const cashSales = validSales
      .filter((sale) => sale.paymentMethod === "cash")
      .reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);

    const bankSales = validSales
      .filter(
        (sale) =>
          sale.paymentMethod === "card" ||
          sale.paymentMethod === "bank_transfer",
      )
      .reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);

    const cashPurchases = validStockRecords
      .filter((record) => record.paymentSource === "shop_cash")
      .reduce((sum, record) => sum + Number(record.totalAmount || 0), 0);

    const bankPurchases = validStockRecords
      .filter((record) => record.paymentSource === "shop_bank")
      .reduce((sum, record) => sum + Number(record.totalAmount || 0), 0);

    const ownerCapital = validStockRecords
      .filter((record) => record.paymentSource === "owner_cash")
      .reduce((sum, record) => sum + Number(record.totalAmount || 0), 0);

    const shopTransactions = [
      ...validSales.map((sale) => ({
        date: formatDate(sale.createdAt),
        desc: `${labelFromSource(sale.paymentMethod || "cash")} sales`,
        amount: Number(sale.totalAmount || 0),
        type: "pos" as const,
      })),
      ...validStockRecords.map((record) => ({
        date: formatDate(record.createdAt),
        desc: `${labelFromSource(record.paymentSource || "shop_cash")} stock purchase`,
        amount: Number(record.totalAmount || 0),
        type: "neg" as const,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const ownerTransactions = validStockRecords
      .filter((record) => record.paymentSource === "owner_cash")
      .map((record) => ({
        date: formatDate(record.createdAt),
        desc: "Owner capital contribution",
        amount: Number(record.totalAmount || 0),
        type: "pos" as const,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const cashBalance = cashSales - cashPurchases;
    const bankBalance = bankSales - bankPurchases;
    const totalShopBalance = cashBalance + bankBalance;
    const totalOwnerBalance = ownerCapital;

    return {
      cashBalance,
      bankBalance,
      totalShopBalance,
      totalOwnerBalance,
      shopTransactions,
      ownerTransactions,
    };
  }, [sales, stockRecords]);

  if (loading && sales.length === 0 && stockRecords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm font-semibold text-gray-500">
        Loading account data...
      </div>
    );
  }

  const {
    cashBalance,
    bankBalance,
    totalShopBalance,
    totalOwnerBalance,
    shopTransactions,
    ownerTransactions,
  } = accountSummary;

  return (
    <div className="flex flex-col gap-6 w-full">
      <h3 className="font-bold text-gray-900 text-base">Accounts</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase">
            <Wallet size={16} className="text-sello-blue" />
            <span>Cash</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Cash physically available in the business
          </p>
          <span className="text-3xl font-extrabold text-gray-900 mt-2">
            {formatCurrency(cashBalance)}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase">
            <Building2 size={16} className="text-sello-blue" />
            <span>Bank Account</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Business funds held in bank accounts.
          </p>
          <span className="text-3xl font-extrabold text-gray-900 mt-2">
            {formatCurrency(bankBalance)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#f0f4fa] rounded-3xl p-5 border border-blue-100/60 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Shop Account</h2>
            <button
              onClick={() => navigate("shop-account")}
              className="px-4 py-1.5 bg-white border border-blue-200 text-sello-blue rounded-full font-bold text-xs shadow-2xs cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 text-xs font-extrabold text-gray-700">
              Recent Activity
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f4fa] text-gray-600 font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {shopTransactions.length > 0 ? (
                  shopTransactions.slice(0, 8).map((tx, idx) => (
                    <tr
                      key={`${tx.date}-${tx.desc}-${idx}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-600">{tx.date}</td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">
                        {tx.desc}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          tx.type === "pos"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {tx.type === "pos"
                          ? formatCurrency(tx.amount)
                          : `-${formatCurrency(tx.amount)}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      No shop transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-2 text-sm">
            <span className="font-extrabold text-gray-900">Total</span>
            <span
              className={`font-extrabold ${
                totalShopBalance >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(totalShopBalance)}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                setTransactionModalType("income");
                setTransactionModalOpen(true);
              }}
              className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Add income
            </button>
            <button
              onClick={() => {
                setTransactionModalType("expense");
                setTransactionModalOpen(true);
              }}
              className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Minus size={16} />
              Add expense
            </button>
          </div>
        </div>

        <div className="bg-[#f0f4fa] rounded-3xl p-5 border border-blue-100/60 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Owner Account</h2>
            <button
              onClick={() => navigate("owner-account")}
              className="px-4 py-1.5 bg-white border border-blue-200 text-sello-blue rounded-full font-bold text-xs shadow-2xs cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f4fa] text-gray-600 font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {ownerTransactions.length > 0 ? (
                  ownerTransactions.slice(0, 8).map((tx, idx) => (
                    <tr key={`${tx.date}-${idx}`} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{tx.date}</td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">
                        {tx.desc}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      No owner capital records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-2 text-sm bg-white p-3.5 rounded-2xl border border-gray-100">
            <span className="font-extrabold text-gray-900">Balance</span>
            <span className="font-extrabold text-emerald-600">
              {formatCurrency(totalOwnerBalance)}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                setTransactionModalType("capital");
                setTransactionModalOpen(true);
              }}
              className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Add capital
            </button>
            <button
              onClick={() => {
                setTransactionModalType("withdrawal");
                setTransactionModalOpen(true);
              }}
              className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Minus size={16} />
              Owner Withdrawal
            </button>
          </div>
        </div>
      </div>

      {transactionModalOpen && transactionModalType != null && (
        <TransactionModal
          isOpen={transactionModalOpen}
          type={transactionModalType}
          onClose={() => {
            setTransactionModalOpen(false);
            setTransactionModalType(null);
          }}
          onSubmit={function (data: {
            paymentMethod: string;
            amount: number;
            description: string;
          }): void {
            console.log(data);
          }}
        />
      )}
    </div>
  );
}
