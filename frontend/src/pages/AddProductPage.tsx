import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import BackButton from "../components/BackButton";
import { api, type Category } from "../api";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(""); // 1. Added categoryId state
  const [minStock, setMinStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Package text and file data into FormData matching backend fields
    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId); // 2. Appended categoryId
    formData.append("minStockAllowed", minStock); // 3. Match backend name `minStockAllowed`
    formData.append("unitPrice", unitPrice);
    formData.append("unit", unit);
    if (file) {
      formData.append("image", file); 
    }

    try {
      const response = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData, 
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      navigate("/inventory/products");
    } catch (err) {
      setError("Could not save product");
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
    <div className="rounded-3xl">
      <div className="flex items-center gap-4 mb-6 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Add New Product</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Product Name"
          placeholder="Enter product name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        {/* 4. Hooked up category dropdown to state */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Category</label>
          <select 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-sello-blue"
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
          placeholder="Enter unit"
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />
        <InputField
          label="Product Image"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit">Add Product</Button>
      </form>
    </div>
  );
}