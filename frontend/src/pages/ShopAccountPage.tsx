import { useState } from "react";
import { Search, Plus, Minus, Calendar } from "lucide-react";
import BackButton from "../components/BackButton";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface MonthlyGroup {
  month: string;
  transactions: Transaction[];
  total: number;
}

export default function ShopAccountPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange] = useState("June 2026 - July 2026");

  // Sample data mirroring your mockup
  const groups: MonthlyGroup[] = [
    {
      month: "July 2026",
      transactions: [
        { id: "1", date: "05/07/2026", description: "New inventory stock", amount: 2000.00 },
        { id: "2", date: "13/07/2026", description: "Advertising campaign", amount: -2000.00 },
        { id: "3", date: "15/07/2026", description: "Website maintenance", amount: -150.00 },
        { id: "4", date: "15/07/2026", description: "Website maintenance", amount: -150.00 },
      ],
      total: -15000.00, // as shown in mockup
    },
    {
      month: "June 2026",
      transactions: [
        { id: "5", date: "05/06/2026", description: "New inventory stock", amount: 2000.00 },
        { id: "6", date: "13/06/2026", description: "Advertising campaign", amount: -2000.00 },
        { id: "7", date: "15/06/2026", description: "Website maintenance", amount: -150.00 },
        { id: "8", date: "15/06/2026", description: "Website maintenance", amount: -150.00 },
      ],
      total: -15000.00,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
          <BackButton />
          <h3 className="font-bold text-gray-900 text-base">Shop Account</h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Add income
          </button>
          <button className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer">
            <Minus size={16} /> Add expense
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

      {/* Tables Section */}
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.month} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h4 className="font-extrabold text-gray-900 text-base">{group.month}</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4fa] text-gray-700 text-xs font-extrabold border-b border-gray-100 rounded-xl">
                    <th className="py-3.5 px-6 rounded-l-xl">Date</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6 text-right rounded-r-xl">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {group.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 px-6 text-gray-700 font-medium">{tx.date}</td>
                      <td className="py-4 px-6 text-gray-900 font-semibold">{tx.description}</td>
                      <td className={`py-4 px-6 text-right font-extrabold ${tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-50/60 font-extrabold">
                    <td className="py-4 px-6 text-gray-900">Total</td>
                    <td className="py-4 px-6"></td>
                    <td className="py-4 px-6 text-right text-rose-600">
                      {group.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}