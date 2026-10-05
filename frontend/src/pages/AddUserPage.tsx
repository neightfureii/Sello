import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import BackButton from "../components/BackButton";
import { useToast } from "../context/ToastContext";
import { api, type Role, type Shop } from "../api";
import { Image as ImageIcon } from "lucide-react";

export default function AddUserPage() {
  const navigate = useNavigate();
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
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadShops = useCallback(() => {
    api<{ shops: Shop[] } | Shop[]>("/shops")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.shops;
        setShops(data || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(loadShops, [loadShops]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Could not create user account");
      }

      showToast(
        `Staff account for ${form.fullName} created successfully!`,
        "success",
      );
      navigate(-1); // Go back to the users list
    } catch (err: any) {
      setError(err.message || "Could not create staff account");
      showToast(err.message || "Could not create staff account", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Add New User</h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 lg:p-8 flex flex-col gap-5"
      >
        {/* Profile Image Preview & Uploader */}
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

        <InputField
          label="Full Name"
          placeholder="A.B.C. Perera"
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />

        <InputField
          label="Email Address"
          placeholder="staff@sello.com"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <InputField
          label="Password (min 8 chars)"
          placeholder="••••••••"
          type="password"
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {/* System Role Selection */}
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

        {/* Assigned Shop Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">
            Assigned Shop
          </label>
          <select
            value={form.shop}
            onChange={(e) => setForm({ ...form, shop: e.target.value })}
            required
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all cursor-pointer"
          >
            <option value="">Select Shop</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
