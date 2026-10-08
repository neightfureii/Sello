import { useState, useEffect } from "react";
import { X, Camera, User2 } from "lucide-react";
import { apiUrl, ROLE_OPTIONS, type Role, type User } from "../api";

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEditComplete: () => void;
}

export default function EditUserModal({
  user,
  isOpen,
  onClose,
  onEditComplete,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<Role | null>(
    (user?.role as Role | null) || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.imageUrl || null,
  );
  const [loading, setLoading] = useState(false);

  // Sync state if user prop changes or modal opens
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setRole((user.role as Role | null) || null);
      setPreviewUrl(user.imageUrl || null);
      setImageFile(null);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    if (role) formData.append("role", role);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(apiUrl(`/auth/users/${user?.id}`), {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update user details");
      }

      if (onEditComplete) onEditComplete();
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* User Image Upload Preview Section */}
        <div className="flex flex-col items-center gap-2">
          <label className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shadow-xs">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="User Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User2 className="text-gray-400" size={32} />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera size={20} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <span className="text-[11px] font-semibold text-gray-500">
            Click to change logo
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-base">
            Edit User Details
          </span>
          <span className="text-gray-500 text-xs font-medium">
            Update your user profile information
          </span>
        </div>

        {/* User Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700">User Name</label>
          <input
            type="text"
            placeholder="Enter user name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>

        {/* User email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700">email</label>
          <input
            type="text"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>

        {/* User Role Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700">User Role</label>
          <select
            value={role || ""}
            onChange={(e) =>
              setRole(e.target.value ? (e.target.value as Role) : null)
            }
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all cursor-pointer"
          >
            <option value="" disabled>
              Select a type
            </option>
            {ROLE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            disabled={loading}
            onClick={onClose}
            className="flex-1 border border-[#8daff2] bg-white text-sello-blue font-semibold py-3.5 rounded-full hover:bg-blue-50 transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleEditSubmit}
            className="flex-1 bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}