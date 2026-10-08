import { Plus, Minus, Wallet, Building2 } from "lucide-react";

export default function AccountsPage() {
  const shopTransactions = [
    { date: "05/07/2026", desc: "Daily sales income", amount: "150.00", type: "pos" },
    { date: "05/07/2026", desc: "Staff training", amount: "-400.00", type: "neg" },
    { date: "06/07/2026", desc: "Cash sales", amount: "120.00", type: "pos" },
    { date: "06/07/2026", desc: "Office supplies", amount: "-75.00", type: "neg" },
    { date: "08/07/2026", desc: "Bank transfer sales", amount: "180.00", type: "pos" },
  ];

  const ownerTransactions = [
    { date: "08/04/2026", desc: "Office supplies purchase", amount: "-150.25", type: "neg" },
    { date: "10/04/2026", desc: "Client project payment received", amount: "1,200.00", type: "pos" },
    { date: "12/04/2026", desc: "Employee salary payment", amount: "-3,500.00", type: "neg" },
    { date: "15/04/2026", desc: "Marketing campaign expenses", amount: "-800.00", type: "neg" },
    { date: "18/04/2026", desc: "Monthly subscription software", amount: "-120.00", type: "neg" },
    { date: "20/04/2026", desc: "Received payment from partner", amount: "2,500.00", type: "pos" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-extrabold text-gray-900">Accounts</h1>

      {/* Top Balances Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase">
            <Wallet size={16} className="text-sello-blue" />
            <span>Cash</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Cash physically available in the business</p>
          <span className="text-3xl font-extrabold text-gray-900 mt-2">Rs. 1,000,000.00</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase">
            <Building2 size={16} className="text-sello-blue" />
            <span>Bank Account</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Business funds held in bank accounts.</p>
          <span className="text-3xl font-extrabold text-gray-900 mt-2">Rs. 800,000.00</span>
        </div>
      </div>

      {/* Side-by-Side Ledgers: Shop Account & Owner Account */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Shop Account Section */}
        <div className="bg-[#f0f4fa] rounded-3xl p-5 border border-blue-100/60 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Shop Account</h2>
            <button className="px-4 py-1.5 bg-white border border-blue-200 text-sello-blue rounded-full font-bold text-xs shadow-2xs cursor-pointer">
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 text-xs font-extrabold text-gray-700">
              July 2026
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
                {shopTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{tx.date}</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{tx.desc}</td>
                    <td className={`py-3 px-4 text-right font-bold ${tx.type === 'pos' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'pos' ? tx.amount : `-Rs.${tx.amount.replace('-', '')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-2 text-sm">
            <span className="font-extrabold text-gray-900">Total</span>
            <span className="font-extrabold text-rose-600">-15,600.00</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={16} />
              Add income
            </button>
            <button className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Minus size={16} />
              Add expense
            </button>
          </div>
        </div>

        {/* Owner Account Section */}
        <div className="bg-[#f0f4fa] rounded-3xl p-5 border border-blue-100/60 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Owner Account</h2>
            <button className="px-4 py-1.5 bg-white border border-blue-200 text-sello-blue rounded-full font-bold text-xs shadow-2xs cursor-pointer">
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
                {ownerTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{tx.date}</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{tx.desc}</td>
                    <td className={`py-3 px-4 text-right font-bold ${tx.type === 'pos' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-2 text-sm bg-white p-3.5 rounded-2xl border border-gray-100">
            <span className="font-extrabold text-gray-900">Balance</span>
            <span className="font-extrabold text-emerald-600">225,500.00</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={16} />
              Add capital
            </button>
            <button className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Minus size={16} />
              Owner Withdrawal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}