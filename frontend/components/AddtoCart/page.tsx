"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CartPopup from "@/components/Ui/Cartpop/CartPopup";

type AddToCartButtonProps = {
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    size?: string;
    sizeId?: number; // variant_sizes table ID for backend verification
    quantity?: number;
  };
  className?: string;
};

export default function AddToCartButton({
  item,
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent double clicks
    if (isAdding) return;

    try {
      setIsAdding(true);

      addToCart({
        ...item,
        quantity: item.quantity ?? 1,
      });

      setShowPopup(true);

      // Reset button state after animation
      setTimeout(() => {
        setIsAdding(false);
      }, 600);

      // Auto close popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`
          flex items-center justify-center gap-1 rounded-xl bg-[#4D2A17] text-white font-semibold 
          transition-all duration-200 hover:bg-amber-800 
          active:scale-95 disabled:opacity-80   text-sm
          ${isAdding ? "animate-pulse" : ""}
          ${className}
        `}
      >
        {isAdding ? (
          <>
            <svg
              className="w-4 h-4 animate-spin "
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Adding...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </>
        )}
      </button>

      <CartPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        item={item}
      />
    </>
  );
}
