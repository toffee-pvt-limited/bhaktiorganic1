"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const addProduct = async () => {
    if (!newProductName.trim()) return;
    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({ name: newProductName }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setNewProductName("");
      fetchProducts();
    }
  };

  const deleteProduct = async (id: number) => {
    if (
      !confirm(
        "Are you sure? This will delete the product and all its variants.",
      )
    )
      return;

    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      fetchProducts();
    } else {
      alert("Failed to delete product");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-6  ">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div>
          <button
            // onClick={handleLogout}
            onClick={() => router.push("/admin/coupons")}
            className="text-sm text-blue-600 mr-5 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            Coupons
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div className="space-y-6  ">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-4 cursor-pointer ">
              <Link
                href={`/admin/variants?productId=${product.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {product.name}
              </Link>
            </div>

            <div className="flex items-center gap-4 ">
              <Link
                href={`/admin/variants?productId=${product.id}`}
                className="text-sm text-blue-600 border px-3 py-1 rounded hover:bg-blue-50"
              >
                + Add / Manage Variants
              </Link>

              <button
                onClick={() => deleteProduct(product.id)}
                className="text-sm text-red-600 border px-3 py-1 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD PRODUCT */}
      <div className="mt-10 p-6 bg-gray-50 rounded-xl border  ">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Add New Product
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Product Name (e.g. Walnuts)"
            className="flex-1 border rounded px-4 py-2 text-black capitalize"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
          />
          <button
            onClick={addProduct}
            className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
