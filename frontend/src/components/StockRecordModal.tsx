import { useState } from "react";
import { X, AlertCircle, Apple, CheckCircle2 } from "lucide-react";
import { apiUrl, type Stock, type StockRecord } from "../api";

interface StockRecordModalProps {
  stockRecord: StockRecord;
  isOpen: boolean;
  onClose: () => void;
  onRevertSuccess?: () => void;
}

export default function StockRecordModal({
  stockRecord,
  isOpen,
  onClose,
  onRevertSuccess,
}: StockRecordModalProps) {
  const [step, setStep] = useState<"details" | "confirm" | "success">(
    "details",
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Format date safely if available
  const formattedDate = stockRecord.createdAt
    ? new Date(stockRecord.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const isReverted = stockRecord.status === "reverted";

  const handleRevertSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/stock-records/${stockRecord.id}/revert`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to revert stock record");
      }

      setStep("success");
      if (onRevertSuccess) onRevertSuccess();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* --- STEP 1: SALES INVOICE DETAILS --- */}
        {step === "details" && (
          <>
            {/* Close Button[cite: 2] */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header Title[cite: 2] */}
            <h2 className="text-xl font-extrabold text-gray-900 pr-8">
              Stock Record Information
            </h2>

            {/* Invoice Metadata Grid[cite: 2] */}
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="grid grid-cols-[130px_15px_1fr] items-center">
                <span className="font-bold text-gray-900">Ref No</span>
                <span className="text-gray-500 font-bold">:</span>
                <span className="font-bold text-gray-900">
                  {stockRecord.stockReference}
                </span>
              </div>
              <div className="grid grid-cols-[130px_15px_1fr] items-center">
                <span className="font-bold text-gray-900">Purchase Date</span>
                <span className="text-gray-500 font-bold">:</span>
                <span className="text-gray-700 font-medium">
                  {formattedDate}
                </span>
              </div>
              <div className="grid grid-cols-[130px_15px_1fr] items-center">
                <span className="font-bold text-gray-900">Payment Source</span>
                <span className="text-gray-500 font-bold">:</span>
                <span className="text-gray-700 font-medium capitalize">
                  {stockRecord.paymentSource?.replace("_", " ")}
                </span>
              </div>
              <div className="grid grid-cols-[130px_15px_1fr] items-center">
                <span className="font-bold text-gray-900">Added By</span>
                <span className="text-gray-500 font-bold">:</span>
                <span className="text-gray-700 font-medium capitalize">
                  {stockRecord.user.fullName}
                </span>
              </div>
            </div>

            {/* Items List Container[cite: 2] */}
            <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
              {stockRecord.stocks && stockRecord.stocks.length > 0 ? (
                stockRecord.stocks.map((item: Stock, idx: number) => {
                  const product = item.product;
                  return (
                    <div
                      key={item.id || idx}
                      className="bg-[#f0f4fa] rounded-2xl p-3 flex items-center justify-between gap-3 border border-blue-50"
                    >
                      <div className="flex items-center gap-3">
                        {product?.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name || "Product"}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <Apple />
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {product?.name || "Product Item"}
                          </span>
                          <span className="text-gray-500 text-xs font-medium">
                            Rs.{Number(item.unitCost || 0).toFixed(2)} /
                            {product?.unit || "unit"} &nbsp;&nbsp; Qty :{" "}
                            {item.quantityReceived}
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900 text-sm">
                        Rs.{" "}
                        {(
                          Number(item.quantityReceived) *
                          Number(item.unitCost || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#f0f4fa] rounded-2xl p-4 text-center text-xs text-gray-500">
                  Item details loaded from transaction record.
                </div>
              )}
            </div>

            <hr className="border-gray-200 my-1" />

            {/* Totals Summary[cite: 2] */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center text-gray-600 font-semibold text-xs">
                <span>Product Count</span>
                <span className="text-gray-900 font-bold">
                  {String(stockRecord.stocks?.length || 1).padStart(2, "0")}
                </span>
              </div>
              {/* <div className="flex justify-between items-center text-gray-600 font-semibold text-xs">
                <span>Discount</span>
                <span className="text-gray-900 font-bold">
                  Rs.{Number(stockRecord. || 0).toFixed(2)}
                </span>
              </div> */}
              <div className="flex justify-between items-center pt-1">
                <span className="font-extrabold text-gray-900 text-base">
                  Sub total
                </span>
                <span className="font-extrabold text-gray-900 text-lg">
                  Rs. {Number(stockRecord.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons[cite: 2] */}
            <div className="flex gap-3 pt-2">
              {!isReverted && (
                <button
                  onClick={() => setStep("confirm")}
                  className="flex-1 border border-rose-400 bg-white text-rose-600 font-semibold py-3.5 rounded-full hover:bg-rose-50 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertCircle size={16} />
                  Revert Stock Record
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* --- STEP 2: REVERT STOCK RECORD CONFIRMATION MODAL --- */}
        {step === "confirm" && (
          <div className="flex flex-col gap-5 py-2">
            <button
              onClick={() => setStep("details")}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Revert Stock Record
              </h2>
              <p className="text-sm font-semibold text-gray-700">
                Are you sure you want to revert this stock record?
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-900">
                Reverting this stock record will:
              </span>
              <ul className="text-xs text-gray-700 font-medium flex flex-col gap-1.5 list-disc pl-4">
                <li>Remove all added items from inventory.</li>
                <li>Update the related financial records.</li>
                <li>
                  Mark this stock record as{" "}
                  <strong className="text-rose-600">Reverted</strong>.
                </li>
              </ul>
              <span className="text-xs font-bold text-gray-900 mt-1">
                This action cannot be undone.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("details")}
                className="flex-1 border border-rose-400 bg-white text-rose-600 font-semibold py-3.5 rounded-full hover:bg-rose-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleRevertSubmit}
                className="flex-1 bg-rose-600 text-white font-semibold py-3.5 rounded-full hover:bg-rose-700 transition-colors shadow-md shadow-rose-200 text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Reverting..." : "Yes, Revert Stock Record"}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: SUCCESS POPUP --- */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-5 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Stock Record Reverted Successfully
              </h2>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                The stock record has been reverted successfully. Stock
                quantities and financial records have been updated.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-full hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 text-sm cursor-pointer mt-2"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
