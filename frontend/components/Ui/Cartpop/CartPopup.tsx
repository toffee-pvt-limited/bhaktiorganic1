"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Image from "next/image";

type CartPopupProps = {
  show: boolean;
  onClose: () => void;
  item: {
    name: string;
    image: string;
    price: number;
    size?: string;
    quantity?: number;
  } | null;
};

export default function CartPopup({ show, onClose, item }: CartPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount check for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle visibility for animation
  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!mounted) return null;
  if (!isVisible && !show) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-24 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Popup Card - Slides down from top */}
      <div
        className={`
          relative bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-2xl
          transform transition-all duration-400 ease-out z-10 pointer-events-auto
          ${
            show
              ? "translate-y-0 opacity-100 scale-100"
              : "-translate-y-8 opacity-0 scale-95"
          }
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex items-start gap-4">
          {/* Animated Checkmark */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce-once">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
                className="animate-draw-check"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Added to Cart!</h3>

            {item && (
              <div className="mt-2 flex items-center gap-3">
                {/* Product Image */}
                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-[#4D2A17]">
                      ₹{item.price}
                    </span>
                    {item.size && (
                      <>
                        <span>•</span>
                        <span>{item.size}</span>
                      </>
                    )}
                    {item.quantity && item.quantity > 1 && (
                      <>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Continue
              </button>
              <a
                href="/cart"
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-[#4D2A17] text-white hover:bg-amber-800 transition-colors text-center"
              >
                View Cart →
              </a>
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full bg-green-500 transition-all ease-linear ${
              show ? "animate-progress" : ""
            }`}
            style={{ width: show ? "0%" : "100%" }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
