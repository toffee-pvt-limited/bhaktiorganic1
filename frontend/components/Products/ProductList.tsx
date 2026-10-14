"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";

export type Product = {
  id: number; // variant id
  product_id: number; // product id
  name: string; // flavor name
  flavor: string;
  category: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  tag: string[];
  description: string;
  available_sizes: {
    id: number;
    size: string;
    price: number;
    stock?: number;
    is_default?: number; // Added field
  }[];
};

type MainProduct = {
  id: number;
  name: string;
};

const ITEMS_PER_PAGE = 9;

export default function ProductListing() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MainProduct[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [flavors, setFlavors] = useState<string[]>([]);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const resVariants = await fetch("/api/admin/variants");
        const variantsData: Product[] = await resVariants.json();
        setProducts(variantsData);

        const flavorList = variantsData
          .map((item) => item.name)
          .filter(Boolean);
        setFlavors(Array.from(new Set(flavorList)));

        const resProducts = await fetch("/api/admin/products");
        const productData: MainProduct[] = await resProducts.json();
        setCategories(productData);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchAll();
  }, []);

  // ---------------- FILTER LOGIC ----------------
  const filteredProducts = products.filter((p) => {
    const matchProduct =
      selectedProductId === null || p.product_id === selectedProductId;

    const matchFlavor = !selectedFlavor || p.name === selectedFlavor;

    return matchProduct && matchFlavor;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ---------------- UI ----------------
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 text-black">
      {/* Header */}
      <div className="flex  flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 sm:pb-6 mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black">Our Collection</h1>
          <p className="text-[#896F61] mt-1 text-sm sm:text-base">
            Premium Fox Nuts for healthy, guilt-free snacking.
          </p>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden mb-6 space-y-4">
        {/* Products Filter - Horizontal Scroll */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Products</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => {
                setSelectedProductId(null);
                setSelectedFlavor("");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border whitespace-nowrap text-sm ${
                selectedProductId === null
                  ? "bg-amber-50 border-amber-500 text-amber-700"
                  : "text-gray-600"
              }`}
            >
              All
            </button>
            {categories.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProductId(
                    selectedProductId === product.id ? null : product.id,
                  );
                  setSelectedFlavor("");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full border whitespace-nowrap text-sm ${
                  selectedProductId === product.id
                    ? "bg-amber-50 border-amber-500 text-amber-700"
                    : "text-gray-600"
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>

        {/* Flavors Filter - Horizontal Scroll */}
        {flavors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Flavors</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => {
                  setSelectedFlavor("");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full border whitespace-nowrap text-sm ${
                  selectedFlavor === ""
                    ? "bg-orange-50 border-orange-500 text-orange-700"
                    : "text-gray-600"
                }`}
              >
                All Flavors
              </button>
              {flavors.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedFlavor(item);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full border whitespace-nowrap text-sm ${
                    selectedFlavor === item
                      ? "bg-orange-50 border-orange-500 text-orange-700"
                      : "text-gray-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-10 py-6 lg:py-12">
        {/* SIDEBAR - Desktop Only */}
        <aside className="hidden lg:block w-72 shrink-0">
          <h3 className="text-lg font-semibold mb-4">Products</h3>

          <div className="space-y-3">
            {/* All Products Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProductId === null}
                onChange={() => {
                  setSelectedProductId(null);
                  setSelectedFlavor("");
                  setCurrentPage(1);
                }}
                className="accent-amber-900 w-4 h-4"
              />
              <span
                className={selectedProductId === null ? "font-semibold" : ""}
              >
                All Products
              </span>
            </label>

            {categories.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedProductId === product.id}
                  onChange={() => {
                    setSelectedProductId(
                      selectedProductId === product.id ? null : product.id,
                    );
                    setSelectedFlavor("");
                    setCurrentPage(1);
                  }}
                  className="accent-amber-900 w-4 h-4"
                />
                {product.name}
              </label>
            ))}
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-4">Flavours</h3>
          <div className="flex flex-wrap gap-3">
            {flavors.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setSelectedFlavor(item);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full border ${
                  selectedFlavor === item
                    ? "bg-orange-50 border-orange-500 text-orange-700"
                    : "text-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* PRODUCTS */}
        <div className="w-full ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {paginatedProducts.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          {/* Empty State */}
          {paginatedProducts.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>No products found matching your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 sm:gap-3 mt-8 sm:mt-12 items-center">
              {/* Previous Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base rounded-full border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center justify-center"
                aria-label="Previous Page"
              >
                &lt;
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`   w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base rounded-full border ${
                    currentPage === i + 1
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base rounded-full border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center justify-center"
                aria-label="Next Page"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
