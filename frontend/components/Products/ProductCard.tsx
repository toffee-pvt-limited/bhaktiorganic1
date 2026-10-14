"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddtoCart from "@/components/AddtoCart/page";
import { Product } from "./ProductList";

interface ProductCardProps {
  item: Product;
}

export default function ProductCard({ item }: ProductCardProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Get discount from item
  const discount = (item as any).discount || 0;

  useEffect(() => {
    // Find default size
    if (item.available_sizes && item.available_sizes.length > 0) {
      const defaultSize = item.available_sizes.find((s) => s.is_default === 1);
      setSelectedSize(defaultSize || item.available_sizes[0]);
    }
  }, [item.available_sizes]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sizeId = Number(e.target.value);
    const newSize = item.available_sizes.find((s) => s.id === sizeId);
    setSelectedSize(newSize);
    setQuantity(1); // Reset quantity on size change
  };

  const changeQty = (val: number) => {
    setQuantity((q) => Math.max(1, q + val));
  };

  // Calculate prices
  const getFinalPrice = (price: number, discount: number) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };

  const unitPrice = getFinalPrice(selectedSize?.price || 0, discount);
  const totalPrice = unitPrice * quantity;

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden  ">
      {/* Image */}
      <div
        className="relative cursor-pointer"
        onClick={() => router.push(`/product/${item.id}`)}
      >
        {item.image ? (
          <img
            src={item.image}
            className="h-56 w-full object-cover"
            alt={item.name}
          />
        ) : (
          <div className="h-56 w-full bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {item.tag && (
          <span className="absolute top-3 right-3 font-bold bg-white text-xs px-3 py-1 rounded-full shadow text-black">
            {item.tag}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-black capitalize">{item.name}</h3>
        <p className="text-sm text-[#897961] capitalize">{item.description}</p>

        {/* Size + Quantity */}
        <div className="flex items-center gap-3 mt-4 text-black">
          <select
            className="border rounded-md px-2 py-1 w-[100px] md:w-full text-sm"
            value={selectedSize?.id || ""}
            onChange={handleSizeChange}
          >
            {item.available_sizes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.size}
              </option>
            ))}
          </select>

          <div className="flex items-center border rounded-md px-2">
            <button onClick={() => changeQty(-1)} className="px-2 py-1">
              −
            </button>
            <span className="px-2">{quantity}</span>
            <button onClick={() => changeQty(1)} className="px-2 py-1">
              +
            </button>
          </div>
        </div>

        {/* Price + Cart */}
        <div className="flex justify-between items-center mt-4">
          <div>
            {discount ? (
              <>
                <div className="flex gap-3 items-center">
                  <span className="text-sm font-semibold text-black">
                    ₹ {totalPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{selectedSize?.price * quantity}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-1 py-1 rounded">
                    {discount}%
                  </span>
                </div>
                {quantity > 1 && (
                  <p className="text-xs text-gray-400">
                    ₹ {unitPrice} × {quantity}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-black">
                  ₹ {totalPrice}
                </span>
                {quantity > 1 && (
                  <p className="text-xs text-gray-400">
                    ₹ {selectedSize?.price} × {quantity}
                  </p>
                )}
              </>
            )}
          </div>

          <AddtoCart
            item={{
              id: item.id.toString(),
              name: item.name,
              image: item.image,
              price: unitPrice,
              originalPrice: discount > 0 ? selectedSize?.price : undefined,
              size: selectedSize?.size || item.size,
              sizeId: selectedSize?.id,
              quantity: quantity,
            }}
            className="px-2 py-2"
          />
        </div>
      </div>
    </div>
  );
}
