import { useCallback, useEffect, useState } from "react";
import {
  api,
  apiUrl,
  type Category,
  type Product,
  type CartItem,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import {
  Search,
  History,
  X,
  ShoppingBag,
  User2,
  LayoutGrid,
} from "lucide-react";
import ProductModal from "../components/ProductModal";
import PaymentModal from "../components/PaymentModal";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const unitLabel = (unit?: string) => unit?.replace(/[0-9]/g, "") ?? "";

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // TODO: replace with the real next bill number from your backend
  const [billNo, setBillNo] = useState(1);

  const loadData = useCallback(() => {
    api<{ products: Product[] } | Product[]>("/products")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.products;
        setProducts(data || []);
      })
      .catch((err) =>
        showToast(err.message || "Failed to load products", "error"),
      );

    api<{ categories: Category[] } | Category[]>("/categories")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.categories;
        setCategories(data || []);
      })
      .catch((err) =>
        showToast(err.message || "Failed to load categories", "error"),
      );
  }, [showToast]);

  useEffect(loadData, [loadData]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || p.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCategoryName =
    activeCategory === "All"
      ? "All"
      : categories.find((c) => c.id === activeCategory)?.name || "Products";

  const getNormalizedQuantity = (
    quantity: number,
    unit: string,
    productUnit: string,
  ) => {
    if (unit === "g" && productUnit === "kg") return quantity / 1000;
    if (unit === "kg" && productUnit === "g") return quantity * 1000;
    return quantity;
  };

  const handleAddToCart = (
    quantity: number,
    unit: string,
    discount: number,
  ) => {
    if (!selectedProduct) return;

    const normalizedNewQty = getNormalizedQuantity(
      quantity,
      unit,
      selectedProduct.unit,
    );

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === selectedProduct.id,
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];

        updated[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + normalizedNewQty,
          discount: Number(existingItem.discount || 0) + Number(discount || 0),
          // Optionally keep the latest display unit or keep the base unit
          displayUnit: selectedProduct.unit,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: `${selectedProduct.id}-${Date.now()}`,
          product: selectedProduct,
          quantity: normalizedNewQty,
          displayUnit: selectedProduct.unit,
          discount,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalDiscount = cartItems.reduce(
    (acc, item) => acc + Number(item.discount || 0),
    0,
  );

  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal =
      item.quantity * Number(item.product.unitPrice || 0) - item.discount;
    return acc + Math.max(0, itemTotal);
  }, 0);

  const handleCompletePayment = async (
    paymentMethod: string,
    printBill = false,
  ) => {
    const payload = {
      paymentMethod,
      totalAmount: subtotal,
      discount: totalDiscount,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.unitPrice,
      })),
    };

    try {
      const response = await fetch(apiUrl("/sales"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to complete sale");

      showToast(
        printBill
          ? "Order placed and bill queued for printing."
          : "Order placed and payment successfully recorded!",
        "success",
      );
      setCartItems([]);
      setBillNo((n) => n + 1);
      setPaymentModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Could not complete order", "error");
    }
  };

  const shopAvatar = (className: string) =>
    user?.shop?.imageUrl ? (
      <img
        src={user.shop.imageUrl}
        alt="Shop Avatar"
        className={`rounded-full object-cover shadow-sm border border-gray-200 shrink-0 ${className}`}
      />
    ) : (
      <ShoppingBag className="shrink-0" />
    );

  return (
    <div className="flex flex-col lg:flex-row lg:h-full gap-5 lg:gap-6 overflow-hidden">
      {/* ───────────── LEFT COLUMN: products ───────────── */}
      <div className="lg:flex-1 shrink-0 lg:shrink min-w-0 lg:min-h-0 flex flex-col gap-4 lg:gap-5 scrollbar-hide">
        {/* Desktop shop header */}
        <div className="hidden lg:flex items-center gap-4">
          {shopAvatar("w-12 h-12")}
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.shop?.name}
          </h1>
        </div>

        {/* Search row: avatar + search + history on mobile, search only on desktop */}
        <div className="flex items-center gap-3 w-full">
          <div className="lg:hidden">{shopAvatar("w-11 h-11")}</div>

          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"
              size={18}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#d9e4f7] border border-transparent focus:bg-white focus:border-sello-blue focus:ring-1 focus:ring-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm transition-all text-gray-800 placeholder-gray-700 font-medium"
            />
          </div>

          <button
            onClick={() => navigate("/sale-history")}
            aria-label="Sale history"
            className="lg:hidden w-11 h-11 bg-[#d9e4f7] rounded-full flex items-center justify-center text-sello-blue hover:bg-blue-100 transition-colors shrink-0"
          >
            <History size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <h2 className="hidden lg:block text-[17px] font-bold text-gray-900">
            Product Category
          </h2>

          <div className="flex items-center gap-2.5 lg:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setActiveCategory("All")}
              className={`flex flex-col items-center justify-end gap-1 shrink-0 w-[60px] h-[62px] lg:w-[72px] lg:h-[84px] rounded-xl lg:rounded-2xl p-1 pb-1.5 shadow-sm border transition-all cursor-pointer ${
                activeCategory === "All"
                  ? "border-blue-200 bg-blue-100 text-sello-blue"
                  : "border-gray-100 bg-white text-gray-700"
              }`}
            >
              <span
                className={`flex-1 w-full flex items-center justify-center rounded-lg lg:rounded-xl ${
                  activeCategory === "All" ? "bg-blue-200/70" : "bg-gray-50"
                }`}
              >
                <LayoutGrid className="w-5 h-5 lg:w-7 lg:h-7" />
              </span>
              <span className="text-[11px] lg:text-[13px] font-bold leading-none">
                All
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-end gap-1 shrink-0 w-[60px] h-[62px] lg:w-[72px] lg:h-[84px] rounded-xl lg:rounded-2xl p-1 pb-1.5 shadow-sm border transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "border-blue-200 bg-blue-100"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex-1 w-full rounded-lg lg:rounded-xl overflow-hidden">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className={`w-full h-full object-cover ${
                      activeCategory === cat.id ? "opacity-80" : ""
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] lg:text-[13px] font-bold leading-none ${
                    activeCategory === cat.id
                      ? "text-sello-blue"
                      : "text-gray-800"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products: horizontal scroller on mobile, grid on desktop */}
        <div className="flex flex-col gap-3 lg:flex-1 lg:min-h-0">
          <h2 className="hidden lg:block text-[17px] font-bold text-gray-900">
            {activeCategoryName}{" "}
            <span className="text-gray-500 text-sm font-normal">
              ({filteredProducts.length.toString().padStart(2, "0")})
            </span>
          </h2>

          <div className="flex gap-3 overflow-x-auto snap-x pb-2 -mx-1 px-1 scrollbar-hide lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:auto-rows-max lg:gap-4 lg:snap-none lg:overflow-x-hidden lg:overflow-y-auto lg:flex-1 lg:min-h-0 lg:content-start lg:pb-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setProductModalOpen(true);
                }}
                className="snap-start shrink-0 w-[112px] lg:w-auto bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-md lg:shadow-sm overflow-hidden flex flex-col text-left hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="h-[72px] lg:h-32 w-full bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 lg:p-3 flex flex-col flex-1 gap-3 lg:gap-4 w-full">
                  <span className="font-bold text-gray-900 text-[11px] lg:text-[13px] leading-tight">
                    {product.name}
                  </span>
                  <span className="mt-auto font-bold text-gray-900 text-[10px] lg:text-[13px] whitespace-nowrap">
                    Rs. {Number(product.unitPrice || 0).toFixed(2)}
                    <span className="text-[9px] lg:text-[11px]">
                      /{unitLabel(product.unit)}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-sm">No products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ───────────── RIGHT COLUMN: order details ───────────── */}
      <div className="w-full lg:w-[380px] flex-1 lg:flex-none min-h-0 shrink-0 lg:shrink-0 flex flex-col gap-5">
        {/* Desktop user header */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User2 />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-[15px] leading-tight">
                {user?.fullName || "A.B.C.Perera"}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {user?.role || "Employee"}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/sale-history")}
            aria-label="Sale history"
            className="w-11 h-11 bg-[#d9e4f7] rounded-full flex items-center justify-center text-sello-blue hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <History size={20} />
          </button>
        </div>

        {/* Order panel */}
        <div className="bg-[#e9effa] rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col shadow-sm border border-blue-100/60 flex-1 min-h-0">
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">
            Order Details
          </h2>

          {/* Items */}
          <div className="flex flex-col gap-2 overflow-y-auto min-h-[110px] max-h-[320px] lg:max-h-none lg:flex-1 lg:min-h-[200px] pr-0.5">
            {cartItems.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">
                No items added yet.
              </p>
            )}

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#d9e4f7] rounded-lg p-1.5 pr-2.5 flex items-center gap-2.5"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-11 h-11 rounded-md object-cover shrink-0"
                />

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-gray-900 text-[13px] truncate">
                    {item.product.name}
                  </span>
                  <div className="flex items-center gap-4 mt-0.5 text-gray-700 text-[10px] font-medium">
                    <span className="whitespace-nowrap">
                      Rs.{Number(item.product.unitPrice || 0).toFixed(2)} /
                      {item.product.unit}
                    </span>
                    <span className="whitespace-nowrap">
                      Qty : {item.quantity} {unitLabel(item.product.unit)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.product.name}`}
                    className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                  <span className="font-bold text-gray-900 text-[13px] whitespace-nowrap">
                    Rs.{" "}
                    {(
                      Number(item.quantity) *
                      Number(item.product.unitPrice || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-gray-400/70 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-600 font-semibold">
                <span className="lg:hidden">Bill No</span>
                <span className="hidden lg:inline">Invoice No</span>
              </span>
              <span className="text-gray-600 font-bold">
                {String(billNo).padStart(4, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-600 font-semibold">Product Count</span>
              <span className="text-gray-600 font-bold">
                {cartItems.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-600 font-semibold">Discount</span>
              <span className="text-gray-600 font-bold">
                Rs.{totalDiscount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-0.5 mb-4">
              <span className="text-gray-900 font-extrabold text-[13px]">
                Sub total
              </span>
              <span className="text-gray-900 font-extrabold text-[16px]">
                Rs.{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCartItems([])}
                disabled={cartItems.length === 0}
                className="flex-1 border border-[#3770E6] bg-transparent text-sello-blue font-semibold py-2.5 rounded-full hover:bg-blue-50 transition-colors text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => setPaymentModalOpen(true)}
                disabled={cartItems.length === 0}
                className="flex-1 bg-[#3770E6] text-white font-semibold py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {productModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setProductModalOpen(false);
            setSelectedProduct(null);
          }}
          isOpen={productModalOpen}
          onAdd={handleAddToCart}
        />
      )}

      {paymentModalOpen && (
        <PaymentModal
          totalAmount={subtotal}
          onClose={() => setPaymentModalOpen(false)}
          isOpen={paymentModalOpen}
          onComplete={handleCompletePayment}
        />
      )}
    </div>
  );
}
