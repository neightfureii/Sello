import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X size={16} />
        </button>

        {/* Warning Icon Banner */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-base">{title}</span>
            <span className="text-gray-500 text-xs font-medium mt-0.5">
              Please confirm your action
            </span>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-300 bg-white text-gray-700 font-semibold py-3 rounded-full hover:bg-gray-50 transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 transition-colors shadow-md shadow-red-200 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}