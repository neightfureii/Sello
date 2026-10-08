import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertCircle, 
  ArrowUpRight 
} from "lucide-react";

export default function AnalyticsPage() {
  const [dateRange] = useState("Last 30 days");

  const topSellingProducts = [
    { name: "Chicken breast", sales: "Rs. 12,000.00", percentage: "100%" },
    { name: "White Egg", sales: "Rs. 10,000.00", percentage: "80%" },
    { name: "Chicken Leg", sales: "Rs. 9,000.00", percentage: "65%" },
    { name: "Red Egg", sales: "Rs. 7,000.00", percentage: "45%" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f0f4fa] border border-blue-100/60 px-4 py-2 rounded-2xl text-sm font-bold text-gray-700 cursor-pointer">
            <Calendar size={16} className="text-sello-blue" />
            <span>{dateRange}</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-gray-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Revenue</span>
            <div className="p-2 bg-blue-50 text-sello-blue rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Rs. 1,000,000.00
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <ArrowUpRight size={14} />
            <span>0.25%</span>
            <span className="text-gray-400 font-medium ml-1">vs last period</span>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-gray-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Profit</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Rs. 500,000.00
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <ArrowUpRight size={14} />
            <span>0.4%</span>
            <span className="text-gray-400 font-medium ml-1">vs last period</span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-gray-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Sales</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown size={18} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            105
          </span>
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
            <TrendingDown size={14} />
            <span>0.25%</span>
            <span className="text-gray-400 font-medium ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Overview & Side Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Overview Chart Panel */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Daily performance trends</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sello-blue inline-block"></span>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
                <span>Previous</span>
              </div>
            </div>
          </div>

          {/* Graphical Mock Container */}
          <div className="h-64 w-full bg-gradient-to-t from-blue-50/40 to-transparent rounded-2xl relative flex items-end px-4 pb-4 border-b border-gray-100">
            {/* SVG Wave Sim */}
            <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
              <path d="M 0,120 Q 125,60 250,90 T 500,20" fill="none" stroke="#3770E6" strokeWidth="3" />
              <path d="M 0,135 Q 125,90 250,110 T 500,60" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            <div className="flex justify-between w-full text-[11px] font-bold text-gray-400 z-10">
              <span>01 Nov</span>
              <span>08 Nov</span>
              <span>15 Nov</span>
              <span>22 Nov</span>
              <span>30 Nov</span>
            </div>
          </div>
        </div>

        {/* Side Performance Cards */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#f0f4fa] rounded-3xl p-5 border border-blue-100/60 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Revenue Growth</span>
            <span className="text-xl font-extrabold text-sello-blue">+18.4%</span>
            <span className="text-xs text-gray-600 font-medium">Compared to the previous period.</span>
          </div>

          <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-100 flex flex-col gap-1">
            <span className="text-xs font-bold text-emerald-700 uppercase">Peak Revenue Day</span>
            <span className="text-xl font-extrabold text-emerald-900">30 Nov</span>
            <span className="text-xs text-emerald-700 font-medium">Highest revenue recorded this month.</span>
          </div>

          <div className="bg-amber-50/60 rounded-3xl p-5 border border-amber-100 flex flex-col gap-1">
            <span className="text-xs font-bold text-amber-700 uppercase">Monthly Target</span>
            <span className="text-xl font-extrabold text-amber-900">92%</span>
            <span className="text-xs text-amber-700 font-medium">Rs.920K of Rs.1M monthly target achieved.</span>
          </div>

          <div className="bg-gray-100 rounded-3xl p-5 border border-gray-200/60 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-600 uppercase">Average Daily Revenue</span>
            <span className="text-xl font-extrabold text-gray-900">+ 8.2%</span>
            <span className="text-xs text-gray-600 font-medium">Average revenue stands at Rs.920K this month</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Selling & Low Performing */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
            <div className="px-3 py-1.5 bg-[#f0f4fa] rounded-xl text-xs font-bold text-sello-blue cursor-pointer">
              This month
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {topSellingProducts.map((p, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-900">{p.name}</span>
                  <span className="text-gray-900">{p.sales}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sello-blue h-full rounded-full" style={{ width: p.percentage }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Performing / At-Risk */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertCircle size={18} />
            <span>Low Performing</span>
          </div>

          <div className="flex flex-col gap-3 my-4">
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Curry powder</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">0 sales this week</p>
              </div>
              <button className="px-3 py-1 bg-white border border-rose-200 text-rose-600 font-bold text-xs rounded-xl shadow-2xs cursor-pointer">
                Review
              </button>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Chicken Liver</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">High return rate (4.2%)</p>
              </div>
              <button className="px-3 py-1 bg-white border border-rose-200 text-rose-600 font-bold text-xs rounded-xl shadow-2xs cursor-pointer">
                Review
              </button>
            </div>
          </div>

          <button className="w-full border border-rose-500 text-rose-600 font-semibold py-3 rounded-full hover:bg-rose-50 transition-colors text-sm cursor-pointer">
            View All At-Risk Inventory
          </button>
        </div>
      </div>
    </div>
  );
}