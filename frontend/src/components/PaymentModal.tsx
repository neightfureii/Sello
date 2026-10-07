import { useState } from "react";
import { X } from "lucide-react";
import {
  Payment_Method,
  PAYMENT_METHOD_DETAILS,
  type PaymentMethodType,
} from "../constants";

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  onClose: () => void;
  onComplete: (paymentMethod: string, printBill?: boolean) => void;
}

export default function PaymentModal({
  isOpen,
  totalAmount,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodType>(Payment_Method.cash);
  const [cashGiven, setCashGiven] = useState("");

  if (!isOpen) return null;

  const cashBalance = Number(cashGiven || 0) - totalAmount;
  const cashStatusText = cashBalance >= 0 ? "Change Due" : "Balance Due";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>

        <h2 className="text-lg font-extrabold text-gray-900 text-center">
          Payment
        </h2>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-700">
            Payment method
          </span>
          <div className="grid grid-cols-3 gap-2 bg-[#f0f4fa] p-1 rounded-2xl">
            {PAYMENT_METHOD_DETAILS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:cursor-pointer ${method === m.value ? "bg-sello-blue text-white shadow-xs" : "text-gray-600 hover:text-gray-900 bg-white"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {method === Payment_Method.cash && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Cash</label>
              <input
                type="number"
                placeholder="Enter the amount you get"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                {cashStatusText}
              </label>
              <div className="bg-[#f0f4fa] rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                Rs. {Math.abs(cashBalance).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {method === Payment_Method.card && (
          <div className="bg-[#f0f4fa] rounded-2xl p-4 flex flex-col gap-2 border border-blue-100/60">
            <span className="text-xs font-extrabold text-gray-900 mb-0.5">
              Card Payment
            </span>
            <p className="text-xs text-gray-600 leading-5">
              Process the card payment on the terminal and continue with the sale.
            </p>
          </div>
        )}

        {method === Payment_Method.bank_transfer && (
          <div className="bg-[#f0f4fa] rounded-2xl p-4 flex flex-col gap-2 border border-blue-100/60">
            <span className="text-xs font-extrabold text-gray-900 mb-0.5">
              Bank Details
            </span>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Account No</span>
              <span className="font-bold text-gray-800">9376563210</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Name</span>
              <span className="font-bold text-gray-800">A.B.C.Gunapala</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Bank</span>
              <span className="font-bold text-gray-800">Commercial Bank</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Branch</span>
              <span className="font-bold text-gray-800">Galle City</span>
            </div>
          </div>
        )}

        <div className="bg-[#f0f4fa] rounded-2xl p-4 flex items-center justify-between border border-blue-100/60">
          <span className="font-extrabold text-gray-900 text-sm">Total</span>
          <span className="font-extrabold text-gray-900 text-lg">
            Rs. {totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              onComplete(method, true);
              onClose();
            }}
            className="flex-1 border border-[#8daff2] bg-white hover:cursor-pointer text-sello-blue font-semibold py-3.5 rounded-full hover:bg-blue-50 transition-colors text-sm"
          >
            Print Bill
          </button>
          <button
            onClick={() => {
              onComplete(method, false);
              onClose();
            }}
            className="flex-1 bg-sello-blue text-white hover:cursor-pointer font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm"
          >
            Skip Bill
          </button>
        </div>
      </div>
    </div>
  );
}
