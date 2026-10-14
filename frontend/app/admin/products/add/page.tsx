"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const submit = async () => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Product created! Redirecting to add variants...");
        // Redirect to the variants page with the new product ID
        router.push(`/admin/variants?productId=${data.id}`);
      } else {
        alert("Failed to create product");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating product");
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 mt-10 border rounded-xl shadow-sm bg-white">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

      <p className="text-sm text-gray-500 mb-4">
        First, give your product a name (e.g. "Cashews"). Then you can add
        different flavors/variants for it.
      </p>

      <input
        placeholder="Product Name  "
        className="border p-3 w-full mb-6 rounded "
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={submit}
        className=" bg-black text-white px-4 py-2 w-full rounded font-semibold hover:bg-gray-800"
      >
        Create & Add Variants →
      </button>
    </div>
  );
}
