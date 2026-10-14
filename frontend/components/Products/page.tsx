"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddToCart from "../AddtoCart/page";
import Link from "next/link";

interface ProductItem {
  id: number;
  name: string;
  desc: string;
  img: string;
  tag: string | null;
  available_sizes: {
    id: number;
    size: string;
    price: number;
    is_default: number;
  }[];
  discount: number | null;
}

export default function Products({
  category = "Makhana",
}: {
  category?: string;
}) {
  const router = useRouter();
  const [itemss, setItems] = useState<ProductItem[]>([]);
  const [qty, setQty] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    fetch(`/api/admin/variants?productName=${category}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          desc: item.description,
          img: item.image,
          tag: item.tag || null,
          available_sizes: item.available_sizes || [],
          discount: item.discount || null,
        }));

        setItems(formatted);
        setQty(formatted.map(() => 1));
        setSelectedSizes(
          formatted.map(
            (p: any) =>
              p.available_sizes.find((s: any) => s.is_default === 1) ||
              p.available_sizes[0]
          )
        );
      });
  }, [category]);

  const changeQty = (i: number, val: number) => {
    setQty((q) => q.map((x, idx) => (idx === i ? Math.max(1, x + val) : x)));
  };

  const getFinalPrice = (price: number, discount: number | null) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Our Best Selling {category}</h2>
        <Link href="/products" className="text-sm text-[#4a2612] font-medium">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ">
        {itemss.slice(0, 4).map((p, i) => {
          const unitPrice = getFinalPrice(selectedSizes[i]?.price, p.discount);
          const totalPrice = unitPrice * qty[i];

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden  "
            >
              <div
                className="relative cursor-pointer"
                onClick={() => router.push(`/product/${p.id}`)}
              >
                <img
                  src={p.img}
                  className="h-56 w-full object-cover"
                  alt={p.name}
                />
                {p.tag && (
                  <span className="absolute top-3 right-3 font-bold bg-white text-xs px-3 py-1 rounded-full shadow text-black">
                    {p.tag}
                  </span>
                )}
              </div>

              <div className="py-4 px-4">
                <h3 className="font-semibold text-black capitalize">
                  {p.name}
                </h3>
                <p className="text-sm text-[#897961]">{p.desc}</p>

                {/* Size + Quantity */}
                <div className="flex items-center gap-3 mt-4 text-black ">
                  <select
                    className="border rounded-md px-2 py-1  w-[100px] md:w-full text-sm   "
                    value={selectedSizes[i]?.id}
                    onChange={(e) => {
                      const sizeId = Number(e.target.value);
                      const newSize = p.available_sizes.find(
                        (s) => s.id === sizeId
                      );

                      setSelectedSizes((prev) =>
                        prev.map((s, idx) => (idx === i ? newSize : s))
                      );

                      setQty((q) => q.map((x, idx) => (idx === i ? 1 : x)));
                    }}
                  >
                    {p.available_sizes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.size}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center border rounded-md px-2">
                    <button onClick={() => changeQty(i, -1)} className="px-2">
                      −
                    </button>
                    <span className="px-2">{qty[i]}</span>
                    <button onClick={() => changeQty(i, 1)} className="px-2">
                      +
                    </button>
                  </div>
                </div>

                {/* Price + Cart */}
                <div className="flex justify-between items-center mt-4 ">
                  <div>
                    {p.discount ? (
                      <>
                        <div className="flex gap-2 items-center">
                          <span className="text-sm font-semibold text-black ">
                            ₹{totalPrice.toLocaleString()}
                          </span>
                          {/* <span className="text-sm text-gray-400 line-through br">
                            ₹
                            {(
                              selectedSizes[i]?.price * qty[i]
                            ).toLocaleString()}
                          </span> */}
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {p.discount}%
                          </span>
                        </div>
                        {qty[i] > 1 && (
                          <p className="text-xs text-gray-400">
                            ₹ {unitPrice} × {qty[i]}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-semibold text-black">
                          ₹ {totalPrice}
                        </span>
                        {qty[i] > 1 && (
                          <p className="text-xs text-gray-400">
                            ₹ {selectedSizes[i]?.price} × {qty[i]}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <AddToCart
                    item={{
                      id: p.id.toString(), // variant ID (not composite)
                      name: p.name,
                      image: p.img,
                      price: unitPrice, // ✅ unit price
                      size: selectedSizes[i]?.size,
                      sizeId: selectedSizes[i]?.id, // variant_sizes ID for backend verification
                      quantity: qty[i],
                    }}
                    className="px-2 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
