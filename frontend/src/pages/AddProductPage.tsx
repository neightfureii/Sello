import { useCallback, useState, type FormEvent } from "react";
import { api, type Product } from "../api";
import { Button } from "../components/Button";
import BackButton from "../components/BackButton";
import { InputField } from "../components/InputField";

const emptyForm = {
  sku: "",
  name: "",
  price: "",
  stockQty: "0",
  reorderLevel: "0",
};
const AddProductPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const load = useCallback(() => {
    api<{ products: Product[] }>("/products")
      .then((d) => setProducts(d.products))
      .catch((err) => setError(err.message));
  }, []);

  const set =
    (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          price: form.price,
          stockQty: Number(form.stockQty),
          reorderLevel: Number(form.reorderLevel),
        }),
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add product");
    }
  }

  return (
    <div className="rounded-3xl">
      <div className="flex items-center gap-4 mb-6 top-0 sticky backdrop-blur-sm bg-white/80 rounded-full p-4">
        <BackButton />
        <h3 className="font-bold text-gray-900 text-base">
          Add New Product Form
        </h3>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        ***Cloudinary image upload widget can be integrated here for product images.
        <InputField
          label="Product Name"
          placeholder="Enter product name"
          type="text"
          value={form.name}
          onChange={set("name")}
          required
        />
        <InputField
          label="Product SKU"
          placeholder="Enter product SKU"
          type="text"
          value={form.sku}
          onChange={set("sku")}
          required
        />
        <InputField
          label="Price"
          placeholder="Enter product price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={set("price")}
          required
        />
        <InputField
          label="Stock Quantity"
          placeholder="Enter stock quantity"
          type="number"
          min="0"
          step="1"
          value={form.stockQty}
          onChange={set("stockQty")}
        />
        <InputField
          label="Reorder Level"
          placeholder="Enter reorder level"
          type="number"
          min="0"
          step="1"
          value={form.reorderLevel}
          onChange={set("reorderLevel")}
        />
        <Button className="mt-6 flex items-center justify-center gap-2 text-sm">
          Add Product
        </Button>
      </form>
    </div>
  );
};

export default AddProductPage;
