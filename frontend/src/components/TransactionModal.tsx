import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import type { ModalType } from "../constants";

interface TransactionModalProps {
  isOpen: boolean;
  type: ModalType;
  onClose: () => void;
  onSubmit: (data: {
    paymentMethod: string;
    amount: number;
    description: string;
  }) => void;
}

const MODAL_CONFIG = {
  income: {
    title: "Add Income",
    actionText: "Add",
    actionIcon: <Plus size={16} />,
    actionClass:
      "bg-sello-blue hover:bg-blue-700 shadow-md shadow-blue-200 text-white",
  },
  expense: {
    title: "Add Expense",
    actionText: "Add",
    actionIcon: <Minus size={16} />,
    actionClass:
      "bg-sello-blue hover:bg-blue-700 shadow-md shadow-blue-200 text-white",
  },
  capital: {
    title: "Add Capital",
    actionText: "Add",
    actionIcon: <Plus size={16} />,
    actionClass:
      "bg-sello-blue hover:bg-blue-700 shadow-md shadow-blue-200 text-white",
  },
  withdrawal: {
    title: "Owner Withdrawal",
    actionText: "Drawings",
    actionIcon: <Minus size={16} />,
    actionClass:
      "bg-sello-blue hover:bg-blue-700 shadow-md shadow-blue-200 text-white",
  },
};

export default function TransactionModal({
  isOpen,
  type,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const config = MODAL_CONFIG[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      paymentMethod,
      amount: Number(amount) || 0,
      description,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 lg:p-7 w-full max-w-md shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <h3 className="font-extrabold text-gray-900 text-lg text-center mt-1">
          {config.title}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-800">
              Payment method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("Cash")}
                className={`py-3 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  paymentMethod === "Cash"
                    ? // key={type}
                      "bg-[#3770E6] text-white border-[#3770E6] shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Bank Transfer")}
                className={`py-3 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  paymentMethod === "Bank Transfer"
                    ? "bg-[#3770E6] text-white border-[#3770E6] shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-800">Amount</label>
            <input
              type="number"
              step="0.01"
              placeholder="Rs. 6000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-[#d9e4f7]/70 border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium transition-all"
            />
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-800">
              Description
            </label>
            <input
              type="text"
              placeholder="Enter the reason"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-[#d9e4f7]/70 border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#3770E6] bg-white text-sello-blue font-semibold py-3.5 rounded-full hover:bg-blue-50 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 font-semibold py-3.5 rounded-full transition-colors text-sm flex items-center justify-center gap-1.5 cursor-pointer ${config.actionClass}`}
            >
              {config.actionIcon} {config.actionText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
