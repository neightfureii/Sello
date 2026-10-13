import { useState } from "react";
import { Search, Plus, Minus, Calendar } from "lucide-react";
import BackButton from "../components/BackButton";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export default function OwnerAccountPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange] = useState("02/07/2026 - 02/08/2026");

  const transactions: Transaction[] = [
    { id: "1", date: "05/07/2026", description: "New inventory stock", amount: 2000.00 },
    { id: "2", date: "06/07/2026", description: "Promotion sales", amount: 1500.00 },
    { id: "3", date: "07/07/2026", description: "Supplier payment", amount: -800.00 },
    { id: "4", date: "08/07/2026", description: "Cash sales", amount: 3000.00 },
    { id: "5", date: "09/07/2026", description: "Employee overtime", amount: -250.00 },
    { id: "6", date: "10/07/2026", description: "Daily sales income", amount: 4000.00 },
    { id: "7", date: "11/07/2026", description: "Utility expenses", amount: -500.00 },
    { id: "8", date: "12/07/2026", description: "Bank transfer sales", amount: 3500.00 },
    { id: "9", date: "13/07/2026", description: "Advertising campaign", amount: -2000.00 },
    { id: "10", date: "14/07/2026", description: "Cash sales", amount: 4500.00 },
    { id: "11", date: "15/07/2026", description: "Website maintenance", amount: -150.00 },
  ];

  const overallBalance = 225500.00; // As shown in mockup

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
          <BackButton />
          <h3 className="font-bold text-gray-900 text-base">Owner Account</h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Capital
          </button>
          <button className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer">
            <Minus size={16} /> Drawings
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#d9e4f7]/70 border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-500 font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#d9e4f7]/70 px-4 py-3 rounded-full text-sm font-semibold text-gray-700 cursor-pointer shrink-0">
          <Calendar size={16} className="text-sello-blue" />
          <span>{dateRange}</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f4fa] text-gray-700 text-xs font-extrabold border-b border-gray-100">
                <th className="py-3.5 px-6 rounded-l-xl">Date</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6 text-right rounded-r-xl">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6 text-gray-700 font-medium">{tx.date}</td>
                  <td className="py-4 px-6 text-gray-900 font-semibold">{tx.description}</td>
                  <td className={`py-4 px-6 text-right font-extrabold ${tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Balance Footer Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <span className="font-extrabold text-gray-900 text-base">Balance</span>
          <span className="font-extrabold text-emerald-600 text-lg">
            {overallBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}