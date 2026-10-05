import { useCallback, useEffect, useState } from "react";
import { api, type Category, type Product, type StockCartItem } from "../api";
import { useToast } from "../context/ToastContext";
import { Search, History, X, LayoutGrid } from "lucide-react";
import BackButton from "../components/BackButton";
import ProductStockModal from "../components/ProductStockModal";
import AddStockRecordModal from "../components/AddStockRecordModal";

export default function AddStockPage() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [productStockModalOpen, setProductStockModalOpen] = useState(false);
  const [addStockRecordModalOpen, setAddStockRecordModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cartItems, setCartItems] = useState<StockCartItem[]>([]);

  const loadData = useCallback(() => {
    // Fetch products
    api<{ products: Product[] } | Product[]>("/products")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.products;
        setProducts(data || []);
      })
      .catch((err) => showToast(err.message || "Failed to load products", "error"));

    // Fetch categories from your backend API
    api<{ categories: Category[] } | Category[]>("/categories")
      .then((d) => {
        // Handles both { categories: [...] } or direct [...] responses
        const data = Array.isArray(d) ? d : d?.categories;
        setCategories(data || []);
      })
      .catch((err) => showToast(err.message || "Failed to load categories", "error"));
  }, [showToast]);

  useEffect(loadData, [loadData]);

  // Filter products based on search query
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
      ? "All Products"
      : categories.find((c) => c.id === activeCategory)?.name || "Products";

  const getNormalizedQuantity = (
    quantity: number,
    unit: string,
    productUnit: string,
  ) => {
    if (unit === "g" && productUnit === "kg") {
      return quantity / 1000;
    } else if (unit === "kg" && productUnit === "g") {
      return quantity * 1000;
    }
    return quantity;
  };

  const handleAddToCart = (
    quantity: number,
    unit: string,
    discount: number,
    unitCost: number,
  ) => {
    if (!selectedProduct) return;

    setCartItems((prev) => [
      ...prev,
      {
        id: `${selectedProduct.id}-${Date.now()}`,
        product: selectedProduct,
        quantity: getNormalizedQuantity(quantity, unit, selectedProduct.unit),
        displayUnit: unit,
        discount,
        unitCost,
      },
    ]);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal =
      item.quantity * Number(item.product.unitPrice || 0) - item.discount;
    return acc + Math.max(0, itemTotal);
  }, 0);

  const handleAddStockRecord = async (paymentMethod: string) => {
    // Map cart items into the shape expected by the backend
    const payload = {
      paymentSource: paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    };

    try {
      const response = await fetch("http://localhost:4000/api/stock-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save stock record");

      // Reset cart and close modal upon success
      setCartItems([]);
      setAddStockRecordModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Could not complete restock operation", "error");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* LEFT COLUMN: Products Section */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4">
          <BackButton />
          <h3 className="font-bold text-gray-900 text-base">Add New Stock</h3>
        </div>

        {/* Unified Search Row (Adapts for Mobile) */}
        <div className="flex items-center gap-3 w-full">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue focus:ring-1 focus:ring-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm transition-all text-gray-800 placeholder-gray-500 font-medium"
            />
          </div>

          {/* Mobile History Button */}
          <button className="lg:hidden w-11 h-11 bg-[#e5edfa] rounded-full flex items-center justify-center text-sello-blue hover:bg-blue-100 transition-colors shrink-0">
            <History size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex flex-col items-center justify-center min-w-[72px] h-[76px] transition-all rounded-2xl p-1 pb-2 shadow-sm border ${
              activeCategory === "All"
                ? "border-blue-200 bg-blue-100 text-sello-blue"
                : "border-gray-100 text-gray-700"
            }`}
          >
            <LayoutGrid />
            <span className="text-[12px] font-bold">All</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center gap-1.5 min-w-[72px] transition-all rounded-2xl p-1 pb-2 shadow-sm border ${
                activeCategory === cat.id
                  ? "border-blue-200 bg-blue-100"
                  : "border-gray-100"
              }`}
            >
              <div className="w-16 h-12 rounded-xl overflow-hidden">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className={`w-full h-full object-cover ${activeCategory === cat.id ? "opacity-80" : ""}`}
                />
              </div>
              <span
                className={`text-[12px] font-semibold ${activeCategory === cat.id ? "text-sello-blue" : "text-gray-700"}`}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="hidden lg:block text-lg font-bold text-gray-900">
            {activeCategoryName}{" "}
            <span className="text-gray-500 text-sm font-normal">
              ({filteredProducts.length.toString().padStart(2, "0")})
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setProductStockModalOpen(true);
                  setSelectedProduct(product);
                }}
              >
                <div className="h-28 w-full bg-gray-100 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="font-bold text-gray-900 text-[13px] mb-2 leading-tight">
                    {product.name}
                  </span>
                  <div className="mt-auto flex items-baseline gap-1">
                    <span className="font-extrabold text-gray-900 text-[13px]">
                      Rs. {product.unitPrice}
                    </span>
                    <span className="text-gray-900 font-extrabold text-[11px]">
                      /{product.unit?.replace(/[0-9]/g, "")}
                    </span>
                  </div>
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

      {/* RIGHT COLUMN: Order Details */}
      <div className="w-full lg:w-[380px] flex flex-col gap-6">
        {/* Order Details Panel */}
        <div className="bg-[#f0f4fa] h-full rounded-3xl p-4 lg:p-5 flex flex-col shadow-sm border border-blue-50/50">
          <h2 className="text-[17px] font-bold text-gray-900 mb-4">
            Stock Details
          </h2>

          {/* Cart Items List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] lg:flex-1 lg:max-h-none lg:min-h-[250px] pr-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#e5ecf6] rounded-2xl p-2 pr-3 flex items-center gap-3 relative"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-gray-900 text-[13px]">
                    {item.product.name}
                  </span>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-gray-600 text-[10px] font-medium">
                      Rs.{item.product.unitPrice} /{item.product.unit}
                    </span>
                    <span className="text-gray-700 text-[11px] font-semibold">
                      Qty : {item.quantity}{" "}
                      {item.product.unit?.replace(/[0-9]/g, "")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[75px]">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-gray-700 transition-colors bg-white rounded-full p-0.5 border border-gray-200"
                  >
                    <X size={12} />
                  </button>
                  <span className="font-extrabold text-gray-900 text-[12px] mt-1">
                    Rs.{" "}
                    {(
                      Number(item.quantity) * Number(item.unitCost || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="mt-5 pt-4 border-t border-gray-300 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-semibold text-[13px]">
                Product Count
              </span>
              <span className="text-gray-700 font-bold text-[13px]">
                {cartItems.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-semibold text-[13px]">
                Discount
              </span>
              <span className="text-gray-700 font-bold text-[13px]">
                Rs.0.00
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 mb-5">
              <span className="text-gray-900 font-extrabold text-[14px]">
                Sub total
              </span>
              {/* Dynamic total calculation based on mock data */}
              <span className="text-gray-900 font-extrabold text-[16px]">
                Rs.
                {cartItems
                  .reduce(
                    (acc, item) =>
                      acc + item.quantity * Number(item.unitCost || 0),
                    0,
                  )
                  .toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 border border-[#8daff2] bg-white text-sello-blue font-semibold py-3 rounded-full hover:bg-blue-50 transition-colors text-[15px]">
                Cancel
              </button>
              <button
                onClick={() => setAddStockRecordModalOpen(true)}
                disabled={cartItems.length === 0}
                className="flex-1 bg-[#3770E6] text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-[15px]"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {productStockModalOpen && selectedProduct && (
        <ProductStockModal
          product={selectedProduct}
          onClose={() => {
            setProductStockModalOpen(false);
            setSelectedProduct(null);
          }}
          isOpen={productStockModalOpen}
          onAdd={handleAddToCart}
        />
      )}

      {/* Payment Modal */}
      {addStockRecordModalOpen && (
        <AddStockRecordModal
          totalAmount={subtotal}
          onClose={() => {
            setAddStockRecordModalOpen(false);
          }}
          isOpen={addStockRecordModalOpen}
          onComplete={handleAddStockRecord}
        />
      )}
    </div>
  );
}
