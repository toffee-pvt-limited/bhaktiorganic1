"use client";
import { useEffect } from "react";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ShoppingCart() {
  const { cart } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-black">
        Your Shopping Cart
      </h1>
      <p className="mt-1 text-sm sm:text-base text-gray-500">
        You have{" "}
        <span className="font-semibold text-[#4a2612]">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>{" "}
        in your cart ready for checkout.
      </p>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <Link
                href="/products"
                className="inline-block bg-[#4D2A17] text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-800 transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            cart.map((item) => <CartItem key={item.id + item.size} {...item} />)
          )}

          {cart.length > 0 && (
            <Link
              href="/products"
              className="inline-block text-sm font-medium text-[#4D2A17] hover:underline"
            >
              ← Continue Shopping
            </Link>
          )}
        </div>

        {/* Order Summary - Sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
