import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import BackButton from "../components/BackButton";
import { api, apiUrl, type Category } from "../api";
import { useToast } from "../context/ToastContext";
import { Image as ImageIcon } from "lucide-react";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minStock, setMinStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    formData.append("minStockAllowed", minStock);
    formData.append("unitPrice", unitPrice);
    formData.append("unit", unit);
    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await fetch(apiUrl("/products"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      showToast("Product added successfully!", "success");
      navigate("/inventory/products");
    } catch (err: any) {
      setError("Could not save product");
      showToast(err.message || "Could not save product", "error");
    } finally {
      setLoading(false);
    }
  }

  const loadData = useCallback(() => {
    api<{ categories: Category[] } | Category[]>("/categories")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.categories;
        setCategories(data || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(loadData, [loadData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Add New Product</h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col gap-5"
      >
        {/* Product Image Preview & Uploader */}
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
              Product Image
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
          label="Product Name"
          placeholder="Enter product name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full bg-[#f0f4fa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-xl px-4 py-3 text-sm text-gray-800 font-medium transition-all cursor-pointer"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Minimum Stock Allowed"
          placeholder="Enter minimum stock allowed"
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          required
        />
        <InputField
          label="Unit Price"
          placeholder="Enter unit price"
          type="text"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          required
        />
        <InputField
          label="Unit"
          placeholder="Enter unit (e.g. kg, pcs)"
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Adding Product..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
}
