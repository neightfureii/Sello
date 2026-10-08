import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import BackButton from "../components/BackButton";
import { useToast } from "../context/ToastContext";
import { Image as ImageIcon } from "lucide-react";
import { SHOP_TYPE_DETAILS, type ShopType } from "../constants";
import { apiUrl } from "../api";

export default function AddShopPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    location: "",
    name: "",
    type: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    formData.append("location", form.location);
    formData.append("name", form.name);
    formData.append("type", form.type);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(apiUrl("/shops"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Could not create shop");
      }

      showToast(`Shop ${form.name} created successfully!`, "success");
      navigate(-1);
    } catch (err: any) {
      setError(err.message || "Could not create shop");
      showToast(err.message || "Could not create shop", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Add New Shop</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 lg:p-8 flex flex-col gap-5">
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
            <label className="text-xs font-bold text-gray-700">Shop Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-sello-blue hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        <InputField
          label="Shop Name"
          placeholder="A.B.C. Perera"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <InputField
          label="Location"
          placeholder="123, First Lane, Colombo"
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Type</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as ShopType })
            }
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all cursor-pointer"
          >
            <option value="">Select a type</option>

            {SHOP_TYPE_DETAILS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating Shop..." : "Create Shop"}
        </Button>
      </form>
    </div>
  );
}
