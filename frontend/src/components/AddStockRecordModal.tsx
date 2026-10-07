import { useState } from "react";
import { X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentMethod: string) => void;
}

export default function AddStockRecordModal({
  isOpen,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const [method, setMethod] = useState<
    "shop_cash" | "shop_bank" | "owner_cash"
  >("shop_cash");
  if (!isOpen) return null;

  const options = [
    { id: "shop_cash", label: "Shop Cash" },
    { id: "shop_bank", label: "Shop Bank" },
    { id: "owner_cash", label: "Owner Cash" },
  ] as const;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
        <h2 className="text-lg font-extrabold text-gray-900 text-center">
          Select Payment Source
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((opt) => {
            const isSelected = method === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-sello-blue bg-blue-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-2xs"
                }`}
              >
                <input
                  type="radio"
                  name="paymentSource"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => setMethod(opt.id)}
                  className="w-4 h-4 text-sello-blue focus:ring-sello-blue"
                />
                <span className="font-bold text-gray-800 text-sm">
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              onComplete(method);
              onClose();
            }}
            className="flex-1 border border-[#8daff2] bg-white text-sello-blue font-semibold py-3.5 rounded-full hover:bg-blue-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onComplete(method);
              onClose();
            }}
            className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm"
          >
            Save Stock
          </button>
        </div>
      </div>
    </div>
  );
}
