import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import BackButton from "../components/BackButton";
import { useToast } from "../context/ToastContext";
import { Image as ImageIcon } from "lucide-react";
import { apiUrl } from "../api";

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    formData.append("description", description);
    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await fetch(apiUrl("/categories"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      showToast("Category added successfully!", "success");
      navigate("/inventory/categories");
    } catch (err: any) {
      setError("Could not save category");
      showToast(err.message || "Could not save category", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4 z-10">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">Add New Category</h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col gap-5"
      >
        {/* Category Image Preview & Uploader */}
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
              Category Image
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
          label="Category Name"
          placeholder="Enter category name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <InputField
          label="Description"
          placeholder="Enter category description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Adding Category..." : "Add Category"}
        </Button>
      </form>
    </div>
  );
}