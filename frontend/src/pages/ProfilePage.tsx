import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";
import { User, Store, Camera, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.imageUrl || null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update profile");

      showToast("Profile successfully updated!", "success");
      
      // Optional: reload to sync AuthContext state with updated user info
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Could not update profile", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-sello-blue flex items-center justify-center font-bold">
          <User size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Profile</h2>
          <p className="text-xs text-gray-500 font-medium">Manage your personal account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col gap-5"
        >
          <h3 className="text-sm font-extrabold text-gray-900">Edit Information</h3>

          {/* Profile Picture Uploader */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 relative group">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-gray-400" size={28} />
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Profile Photo</label>
              <p className="text-[11px] text-gray-400">Click image to upload a new avatar</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-sello-blue hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all"
            />
          </div>

          {/* Email (Readonly) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Email Address (Read-only)</label>
            <div className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-500 font-medium select-none">
              {user?.email}
            </div>
          </div>

          {/* Role (Readonly) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">System Role</label>
            <div className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-500 font-medium uppercase tracking-wider select-none">
              {user?.role}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>

        {/* RIGHT COLUMN: Shop Details Card */}
        <div className="bg-[#f0f4fa] rounded-3xl p-6 shadow-sm border border-blue-50 flex flex-col gap-4 h-fit">
          <div className="flex items-center gap-2.5 text-sello-blue">
            <Store size={20} />
            <h3 className="text-sm font-extrabold text-gray-900">Assigned Shop</h3>
          </div>

          {user?.shop ? (
            <div className="flex flex-col gap-3">
              {user.shop.imageUrl && (
                <div className="w-full h-32 rounded-2xl overflow-hidden shadow-xs">
                  <img src={user.shop.imageUrl} alt={user.shop.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Shop Name</span>
                <span className="text-sm font-bold text-gray-900">{user.shop.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Location</span>
                <span className="text-sm font-bold text-gray-800">{user.shop.location || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Shop Type</span>
                <span className="text-sm font-bold text-gray-800 capitalize">{user.shop.type}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No shop assigned to this account.</p>
          )}
        </div>

      </div>
    </div>
  );
}