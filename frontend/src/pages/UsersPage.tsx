import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, type Role, type Shop } from "../api";
import { useToast } from "../context/ToastContext";
import { UserPlus, Image as ImageIcon } from "lucide-react";

export default function UsersPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "cashier" as Role,
    shop: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("fullName", form.fullName);
    formData.append("password", form.password);
    formData.append("role", form.role);
    formData.append("shopId", form.shop);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/users", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      showToast(
        `Staff account for ${form.fullName} created successfully!`,
        "success",
      );
      setForm({
        email: "",
        fullName: "",
        password: "",
        role: "cashier",
        shop: "",
      });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      showToast(err.message || "Could not create staff account", "error");
    } finally {
      setLoading(false);
    }
  }

  const loadData = useCallback(() => {
    api<{ shops: Shop[] } | Shop[]>("/shops")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.shops;
        setShops(data || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(loadData, [loadData]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-sello-blue flex items-center justify-center font-bold">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Create Staff Account
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Add a new cashier or manager to your shop
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col gap-5"
      >
        {/* Profile Image Upload */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="text-gray-400" size={24} />
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-bold text-gray-700">
              Staff Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-sello-blue hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="A.B.C. Perera"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium transition-all"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="staff@sello.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium transition-all"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">
            Password (min 8 chars)
          </label>
          <input
            type="password"
            placeholder="••••••••"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-medium transition-all"
          />
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">System Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all cursor-pointer"
          >
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Shop</label>
          <select
            value={form.shop}
            onChange={(e) => setForm({ ...form, shop: e.target.value })}
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all cursor-pointer"
          >
            <option value="">Select Shop</option>
            {shops.map((s) => (
              <option value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-sello-blue text-white font-semibold py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
