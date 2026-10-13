import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { api, type Product, type SaleRecord } from "../api";
import { useToast } from "../context/ToastContext";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatSignedPercent = (value: number) => {
  const rounded = Number.isFinite(value) ? value : 0;
  return `${rounded >= 0 ? "+" : ""}${percentFormatter.format(rounded)}%`;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api<{ sales: SaleRecord[] } | SaleRecord[]>("/sales"),
      api<{ products: Product[] } | Product[]>("/products"),
    ])
      .then(([salesResponse, productsResponse]) => {
        setSales(
          Array.isArray(salesResponse)
            ? salesResponse
            : salesResponse?.sales || [],
        );
        setProducts(
          Array.isArray(productsResponse)
            ? productsResponse
            : productsResponse?.products || [],
        );
      })
      .catch((err) => {
        showToast(err.message || "Failed to load analytics data", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const analyticsData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29);

    const previousEndDate = new Date(startDate);
    previousEndDate.setMilliseconds(previousEndDate.getMilliseconds() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousEndDate.getDate() - 29);

    const currentSales = sales.filter((sale) => {
      if (sale.status === "reverted") return false;
      const createdAt = new Date(sale.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });

    const previousSales = sales.filter((sale) => {
      if (sale.status === "reverted") return false;
      const createdAt = new Date(sale.createdAt);
      return createdAt >= previousStartDate && createdAt <= previousEndDate;
    });

    const currentRevenue = currentSales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount || 0),
      0,
    );
    const previousRevenue = previousSales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount || 0),
      0,
    );
    const revenueGrowth =
      previousRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    const currentProfit = currentSales.reduce((sum, sale) => {
      const costs = sale.saleItems.reduce((itemTotal, item) => {
        const unitCost = Number(item.stock?.unitCost || 0);
        return itemTotal + Number(item.quantity || 0) * unitCost;
      }, 0);
      return sum + (Number(sale.totalAmount || 0) - costs);
    }, 0);

    const previousProfit = previousSales.reduce((sum, sale) => {
      const costs = sale.saleItems.reduce((itemTotal, item) => {
        const unitCost = Number(item.stock?.unitCost || 0);
        return itemTotal + Number(item.quantity || 0) * unitCost;
      }, 0);
      return sum + (Number(sale.totalAmount || 0) - costs);
    }, 0);

    const profitGrowth =
      previousProfit === 0
        ? currentProfit > 0
          ? 100
          : 0
        : ((currentProfit - previousProfit) / previousProfit) * 100;

    const currentSalesCount = currentSales.length;
    const previousSalesCount = previousSales.length;
    const salesCountGrowth =
      previousSalesCount === 0
        ? currentSalesCount > 0
          ? 100
          : 0
        : ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100;

    const productRevenueMap = new Map<
      string,
      { name: string; revenue: number }
    >();
    currentSales.forEach((sale) => {
      sale.saleItems.forEach((item) => {
        const productName = item.stock?.product?.name || "Unknown product";
        const currentTotal = productRevenueMap.get(productName) || {
          name: productName,
          revenue: 0,
        };
        currentTotal.revenue +=
          Number(item.quantity || 0) * Number(item.unitPriceSold || 0);
        productRevenueMap.set(productName, currentTotal);
      });
    });

    const rawTopProducts = Array.from(productRevenueMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );

    const maxRevenue = Math.max(
      ...rawTopProducts.map((product) => product.revenue),
      0,
    );

    const topSellingProducts = rawTopProducts.slice(0, 4).map((product) => ({
      name: product.name,
      sales: formatCurrency(product.revenue),
      percentage:
        maxRevenue > 0
          ? `${Math.max(12, Math.round((product.revenue / maxRevenue) * 100))}%`
          : "0%",
    }));

    const soldProducts = new Set<string>(
      currentSales
        .flatMap((sale) => sale.saleItems)
        .map((item) => item.stock?.product?.name)
        .filter((name): name is string => Boolean(name)),
    );

    const lowPerformingProducts = products
      .filter((product) => !soldProducts.has(product.name))
      .slice(0, 2)
      .map((product) => ({
        name: product.name,
        subtitle: `${product.availableQty ?? 0} units available`,
      }));

    const dailyRevenueMap = new Map<string, number>();
    currentSales.forEach((sale) => {
      const dayKey = new Date(sale.createdAt).toISOString().slice(0, 10);
      dailyRevenueMap.set(
        dayKey,
        (dailyRevenueMap.get(dayKey) || 0) + Number(sale.totalAmount || 0),
      );
    });

    const peakRevenueDay = Array.from(dailyRevenueMap.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const monthlyTarget = 1000000;
    const targetProgress = (currentRevenue / monthlyTarget) * 100;
    const averageDailyRevenue = currentRevenue / 30;
    const previousAverageDailyRevenue = previousRevenue / 30;
    const averageDailyRevenueGrowth =
      previousAverageDailyRevenue === 0
        ? averageDailyRevenue > 0
          ? 100
          : 0
        : ((averageDailyRevenue - previousAverageDailyRevenue) /
            previousAverageDailyRevenue) *
          100;

    return {
      dateRangeLabel: `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`,
      currentRevenue,
      currentProfit,
      currentSalesCount,
      revenueGrowth,
      profitGrowth,
      salesCountGrowth,
      topSellingProducts,
      lowPerformingProducts:
        lowPerformingProducts.length > 0
          ? lowPerformingProducts
          : [
              {
                name: "No at-risk items",
                subtitle: "All products sold well this period",
              },
            ],
      peakRevenueDay: peakRevenueDay
        ? formatDateLabel(new Date(`${peakRevenueDay[0]}T00:00:00`))
        : "No sales yet",
      targetProgress,
      averageDailyRevenue,
      averageDailyRevenueGrowth,
    };
  }, [products, sales]);

  if (loading && sales.length === 0 && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm font-semibold text-gray-500">
        Loading analytics...
      </div>
    );
  }

  const {
    dateRangeLabel,
    currentRevenue,
    currentProfit,
    currentSalesCount,
    revenueGrowth,
    profitGrowth,
    salesCountGrowth,
    topSellingProducts,
    lowPerformingProducts,
    peakRevenueDay,
    targetProgress,
    averageDailyRevenue,
    averageDailyRevenueGrowth,
  } = analyticsData;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-base">Analytics</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f0f4fa] border border-blue-100/60 px-4 py-2 rounded-2xl text-sm font-bold text-gray-700 cursor-pointer">
            <Calendar size={16} className="text-sello-blue" />
            <span>{dateRangeLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-gray-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Revenue</span>
            <div className="p-2 bg-blue-50 text-sello-blue rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatCurrency(currentRevenue)}
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <ArrowUpRight size={14} />
            <span>{formatSignedPercent(revenueGrowth)}</span>
            <span className="text-gray-400 font-medium ml-1">
              vs last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-gray-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Profit</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatCurrency(currentProfit)}
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <ArrowUpRight size={14} />
            <span>{formatSignedPercent(profitGrowth)}</span>
            <span className="text-gray-400 font-medium ml-1">
              vs last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-gray-500 font-bold text-xs uppercase tracking-wider">
            <span>Total Sales</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown size={18} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {currentSalesCount}
          </span>
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
            <TrendingDown size={14} />
            <span>{formatSignedPercent(salesCountGrowth)}</span>
            <span className="text-gray-400 font-medium ml-1">
              vs last period
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Revenue Overview
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Daily performance trends
              </p>
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

          <div className="h-64 w-full bg-gradient-to-t from-blue-50/40 to-transparent rounded-2xl relative flex items-end px-4 pb-4 border-b border-gray-100">
            <svg
              className="absolute inset-0 w-full h-full p-4 overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 500 150"
            >
              <path
                d="M 0,120 Q 125,60 250,90 T 500,20"
                fill="none"
                stroke="#3770E6"
                strokeWidth="3"
              />
              <path
                d="M 0,135 Q 125,90 250,110 T 500,60"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
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

        <div className="flex flex-col gap-4">
          <div className="bg-[#f0f4fa] rounded-3xl p-5 border border-blue-100/60 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Revenue Growth
            </span>
            <span className="text-xl font-extrabold text-sello-blue">
              {formatSignedPercent(revenueGrowth)}
            </span>
            <span className="text-xs text-gray-600 font-medium">
              Compared to the previous period.
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-100 flex flex-col gap-1">
            <span className="text-xs font-bold text-emerald-700 uppercase">
              Peak Revenue Day
            </span>
            <span className="text-xl font-extrabold text-emerald-900">
              {peakRevenueDay}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              Highest revenue recorded this period.
            </span>
          </div>

          <div className="bg-amber-50/60 rounded-3xl p-5 border border-amber-100 flex flex-col gap-1">
            <span className="text-xs font-bold text-amber-700 uppercase">
              Monthly Target
            </span>
            <span className="text-xl font-extrabold text-amber-900">
              {`${Math.round(targetProgress)}%`}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              {formatCurrency(currentRevenue)} of {formatCurrency(1000000)}{" "}
              monthly target achieved.
            </span>
          </div>

          <div className="bg-gray-100 rounded-3xl p-5 border border-gray-200/60 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-600 uppercase">
              Average Daily Revenue
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              {formatSignedPercent(averageDailyRevenueGrowth)}
            </span>
            <span className="text-xs text-gray-600 font-medium">
              Average revenue stands at {formatCurrency(averageDailyRevenue)}{" "}
              this month.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Top Selling Products
            </h2>
            <div className="px-3 py-1.5 bg-[#f0f4fa] rounded-xl text-xs font-bold text-sello-blue cursor-pointer">
              This month
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {topSellingProducts.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-900">{product.name}</span>
                  <span className="text-gray-900">{product.sales}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sello-blue h-full rounded-full"
                    style={{ width: product.percentage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertCircle size={18} />
            <span>Low Performing</span>
          </div>

          <div className="flex flex-col gap-3 my-4">
            {lowPerformingProducts.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {product.subtitle}
                  </p>
                </div>
                <button className="px-3 py-1 bg-white border border-rose-200 text-rose-600 font-bold text-xs rounded-xl shadow-2xs cursor-pointer">
                  Review
                </button>
              </div>
            ))}
          </div>

          <button className="w-full border border-rose-500 text-rose-600 font-semibold py-3 rounded-full hover:bg-rose-50 transition-colors text-sm cursor-pointer">
            View All At-Risk Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
