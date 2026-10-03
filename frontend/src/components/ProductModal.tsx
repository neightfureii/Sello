import { useState } from "react";
import { X } from "lucide-react";
import { type Product } from "../api";

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (quantity: number, unit: string, discount: number) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAdd }: ProductModalProps) {
  const [qty, setQty] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(product.unit || "kg");
  const [discount, setDiscount] = useState("");

  if (!isOpen) return null;

  const handleQuickQty = (val: string) => {
    // Strips out text like "500g" -> "0.5" or "1kg" -> "1" for calculation purposes
    const numericVal = val.includes("g") ? (parseInt(val) / 1000).toString() : parseInt(val).toString();
    setQty(numericVal);
  };

  const normalizedQty = (qty: string) => {
    let normqty = Number(qty || 0);
    if (selectedUnit === "g" && product.unit === "kg") {
      normqty = normqty / 1000;
    } else if (selectedUnit === "kg" && product.unit === "g") {
      normqty = Number(qty || 0) * 1000;
    }
    return normqty;
  };

  const calculatedTotal = (normalizedQty(qty) * Number(product.unitPrice || 0)) - Number(discount || 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors">
          <X size={16} />
        </button>

        {/* Header Item Details */}
        <div className="flex items-center gap-3.5 pr-8">
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=200&q=80"} 
            alt={product.name} 
            className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-xs"
          />
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-base">{product.name}</span>
            <span className="text-gray-600 font-semibold text-xs mt-0.5">Rs. {Number(product.unitPrice).toFixed(2)} / {product.unit}</span>
            <span className="text-gray-400 text-[11px] font-medium mt-0.5">Available Qty : 42.5kg</span>
          </div>
        </div>

        {/* Quantity Input Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700">Qty</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Enter quantity here"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="flex-1 bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium"
            />
            <div className="flex bg-[#f0f4fa] p-1 rounded-xl gap-1">
              <button 
                onClick={() => setSelectedUnit("g")} 
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedUnit === "g" ? "bg-sello-blue text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
              >
                g
              </button>
              <button 
                onClick={() => setSelectedUnit("kg")} 
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedUnit === "kg" ? "bg-sello-blue text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
              >
                kg
              </button>
            </div>
          </div>

          {/* Quick Increment Buttons */}
          {/* <div className="grid grid-cols-4 gap-2 mt-1">
            {["500g", "1kg", "2kg", "5kg"].map((preset) => (
              <button 
                key={preset}
                onClick={() => handleQuickQty(preset)}
                className="border border-gray-200 hover:border-sello-blue text-gray-700 font-semibold py-2 rounded-xl text-xs transition-colors bg-white shadow-2xs"
              >
                {preset}
              </button>
            ))}
          </div> */}
        </div>

        {/* Discount Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700">Discount</label>
          <input 
            type="number" 
            placeholder="Enter discount amount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>

        {/* Total Summary Box */}
        <div className="bg-[#f0f4fa] rounded-2xl p-4 flex items-center justify-between border border-blue-100/60">
          <span className="font-extrabold text-gray-900 text-sm">Total</span>
          <span className="font-extrabold text-gray-900 text-lg">Rs. {Math.max(0, calculatedTotal).toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <button 
            onClick={onClose}
            className="flex-1 border border-[#8daff2] bg-white text-sello-blue font-semibold py-3.5 rounded-full hover:bg-blue-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onAdd(Number(qty || 0), selectedUnit, Number(discount || 0));
              onClose();
            }}
            className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm"
          >
            Add
          </button>
        </div>

      </div>
    </div>
  );
}