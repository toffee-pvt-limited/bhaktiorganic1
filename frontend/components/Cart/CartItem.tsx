"use client";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import DeleteIcon from "@/assets/deleteicon.svg";

export interface CartItemProps {
  id: string;
  name: string;
  description?: string;
  image: string;
  size?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
}

export default function CartItem({
  id,
  name,
  description,
  image,
  size,
  quantity,
  price,
  originalPrice,
}: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();

  const handleIncrease = () => {
    updateQuantity(id, size, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(id, size, quantity - 1);
    }
  };

  const totalPrice = price * quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      {/* Image */}
      <div className="relative h-32 sm:h-24 w-full sm:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col sm:flex-row sm:justify-between gap-4 text-black">
        {/* Product Info */}
        <div className="flex-1 ">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {size && (
              <span className="rounded-md border px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50">
                {size}
              </span>
            )}

            <div className="flex items-center border rounded-md    ">
              <button
                onClick={handleDecrease}
                className="px-3  text-gray-600 hover:bg-gray-100 transition font-medium"
              >
                −
              </button>
              <span className="px-3  text-sm font-medium border-x">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition font-medium"
              >
                +
              </button>
            </div>

            {/* <span className="text-xs text-gray-400">
              ₹{price.toLocaleString()} each
            </span> */}
            {/* mobile remove button */}
            <button
              className=" block sm:hidden text-xs sm:text-sm text-red-500 hover:text-red-600 border border-red-200 rounded-md px-3 py-1  transition-colors hover:border-red-400 hover:bg-red-50"
              onClick={() => removeFromCart(id, size)}
            >
              <Image src={DeleteIcon} alt="Remove" />
            </button>
          </div>
        </div>

        {/* Price & Remove */}
        <div className="   flex  flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-2">
          <span className="font-bold text-lg sm:text-xl text-[#4D2A17]">
            {/* ₹{totalPrice.toLocaleString()} */}
          </span>
          <button
            className=" hidden sm:block text-xs sm:text-sm text-red-500 hover:text-red-600 border border-red-200 rounded-md px-3 py-1 transition-colors hover:border-red-400 hover:bg-red-50"
            onClick={() => removeFromCart(id, size)}
          >
            <Image src={DeleteIcon} alt="Remove" />
          </button>
          <div className="text-right">
            <span className="font-bold text-lg sm:text-xl text-[#4D2A17]">
              ₹{(price * quantity).toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <div className="flex items-center gap-2 justify-end mt-1">
                <span className="text-sm text-gray-400 line-through">
                  ₹{(originalPrice * quantity).toLocaleString()}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                  {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                  OFF
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
