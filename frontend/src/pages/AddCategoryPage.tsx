import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import BackButton from "../components/BackButton";

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Package text and file data into FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (file) {
      formData.append("image", file); // 'image' matches upload.single('image') in backend
    }

    try {
      const response = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        body: formData, // Do NOT set 'Content-Type' header manually; browser handles it
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      navigate("/products");
    } catch (err) {
      setError("Could not save category");
    }
  }

  return (
    <div className="rounded-3xl">
      <div className="flex items-center gap-4 mb-6 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">
          Add New Category
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <InputField
          label="Category Image"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit">Add Category</Button>
      </form>
    </div>
  );
}
