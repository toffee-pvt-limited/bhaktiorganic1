"use client";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import CustomerDetailsModal from "../Ui/CustomerDetailsModal";
import { useOrderModal } from "@/context/OrderModalContext";
import DeleteIcon from "@/assets/deleteicon.svg";
import Image from "next/image";

interface CouponNudge {
  nudge: {
    code: string;
    amountNeeded: number;
    minOrderAmount: number;
    discountText: string;
    message: string;
  } | null;
  unlocked: {
    code: string;
    discountText: string;
    message: string;
  } | null;
}

export default function OrderSummary() {
  const { openModal } = useOrderModal();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
    couponId: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Extra discount coupon state (for threshold-based coupons)
  const [extraCoupon, setExtraCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
    minOrderAmount: number;
  } | null>(null);
  const [extraCouponLoading, setExtraCouponLoading] = useState(false);

  // Coupon nudge state
  const [couponNudge, setCouponNudge] = useState<CouponNudge | null>(null);

  // Original total (before product/variant discounts)
  const originalTotal = cart.reduce(
    (total, item) => total + (item.originalPrice || item.price) * item.quantity,
    0
  );

  // Current subtotal (after product/variant discounts, before coupons)
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Product discount (difference between original and current)
  const productDiscount = originalTotal - subtotal;

  const shipping = 0;

  // Regular coupon discount
  const regularDiscount = appliedCoupon?.discount || 0;

  // Extra discount (after regular discount)
  const extraDiscount = extraCoupon?.discount || 0;

  // Total coupon discount = regular + extra
  const totalCouponDiscount = regularDiscount + extraDiscount;

  const subtotalAfterCoupons = subtotal - totalCouponDiscount;
  const tax = subtotalAfterCoupons * 0.05; // Tax calculated AFTER discount
  const total = subtotalAfterCoupons + tax + shipping;

  // Fetch available coupons for nudge message
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      if (subtotal === 0) {
        setCouponNudge(null);
        return;
      }

      try {
        const res = await fetch(`/api/coupons/available?cartTotal=${subtotal}`);
        const data = await res.json();
        setCouponNudge(data);
      } catch (error) {
        console.error("Error fetching available coupons:", error);
      }
    };

    fetchAvailableCoupons();
  }, [subtotal]);

  // Auto-remove extra coupon if cart total falls below minimum requirement
  // Also recalculate discount amount when subtotal changes
  // Both coupons apply on the same subtotal (not cascaded)
  useEffect(() => {
    if (!extraCoupon) return;

    // Check minimum order against subtotal (not after regular discount)
    // If subtotal is now below the minimum required for this coupon, remove it
    if (subtotal < extraCoupon.minOrderAmount) {
      setExtraCoupon(null);
    } else {
      // Recalculate discount based on subtotal (same base as regular coupon)
      let newDiscount = 0;
      if (extraCoupon.discountType === "percentage") {
        newDiscount = Math.round((subtotal * extraCoupon.discountValue) / 100);
      } else {
        newDiscount = extraCoupon.discountValue;
      }
      // Cap discount at subtotal
      if (newDiscount > subtotal) newDiscount = subtotal;

      // Only update if discount changed
      if (newDiscount !== extraCoupon.discount) {
        setExtraCoupon((prev) =>
          prev ? { ...prev, discount: newDiscount } : null
        );
      }
    }
  }, [subtotal]);

  // Auto-recalculate regular coupon discount when subtotal changes
  useEffect(() => {
    if (!appliedCoupon) return;

    // Recalculate discount based on new subtotal
    let newDiscount = 0;
    if (appliedCoupon.discountType === "percentage") {
      newDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      newDiscount = appliedCoupon.discountValue;
    }
    // Cap discount at subtotal
    if (newDiscount > subtotal) newDiscount = subtotal;

    // Only update if discount changed
    if (newDiscount !== appliedCoupon.discount) {
      setAppliedCoupon((prev) =>
        prev ? { ...prev, discount: newDiscount } : null
      );
    }
  }, [subtotal]);
  // Apply coupon handler
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: subtotal,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: data.discount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          couponId: data.couponId,
          message: data.message,
        });
        setCouponError("");
      } else {
        setCouponError(data.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Coupon error:", error);
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };
  // Remove coupon handler
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Apply extra discount coupon handler
  const applyExtraCoupon = async (code: string) => {
    setExtraCouponLoading(true);
    try {
      // Both coupons apply on the same subtotal (not cascaded)
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          cartTotal: subtotal, // Use subtotal, same as regular coupon
          isExtraDiscount: true, // This allows extra category coupons
        }),
      });
      const data = await res.json();
      if (data.valid) {
        // Get the minimum order amount from the nudge data
        const minAmount =
          couponNudge?.unlocked?.code === code.toUpperCase()
            ? couponNudge?.nudge?.minOrderAmount || subtotal
            : subtotal;

        setExtraCoupon({
          code: code.toUpperCase(),
          discount: data.discount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderAmount: data.minOrderAmount || minAmount,
        });
      } else {
        alert(data.message || "Failed to apply extra discount");
      }
    } catch (error) {
      console.error("Extra coupon error:", error);
      alert("Failed to apply extra discount");
    } finally {
      setExtraCouponLoading(false);
    }
  };

  // Remove extra coupon handler
  const removeExtraCoupon = () => {
    setExtraCoupon(null);
  };
  const placeOrder = async (customerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: customerData,
          cartItems: cart,
          totalAmount: total,
          couponCode: appliedCoupon?.code || null, // Send regular coupon code
          extraCouponCode: extraCoupon?.code || null, // Send extra discount coupon code
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        alert("Failed to place order");
        return;
      }
      alert("Order placed successfully! 📩");
      clearCart();
      setAppliedCoupon(null);
      setCouponCode("");
      setExtraCoupon(null);
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm text-black">
        <h2 className="mb-4 text-base sm:text-lg font-semibold">
          Order Summary
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          {/* Show original total if there's a product discount */}
          {productDiscount > 0 && (
            <div className="flex justify-between">
              <span>Original Total</span>
              <span className="font-medium line-through text-gray-400">
                ₹{originalTotal.toFixed(2)}
              </span>
            </div>
          )}

          {/* Show product discount if exists */}
          {productDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Product Discount</span>
              <span className="font-medium">
                -₹{productDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>{productDiscount > 0 ? "Subtotal" : "Subtotal"}</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>

          {/* Show regular coupon discount if applied */}
          {appliedCoupon && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({appliedCoupon.code})</span>
              <span className="font-medium">
                -₹{appliedCoupon.discount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Show extra discount if applied */}
          {extraCoupon && (
            <div className="flex justify-between text-green-600">
              <span>🎁 Extra Discount ({extraCoupon.code})</span>
              <span className="font-medium">
                -₹{extraCoupon.discount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Show subtotal after coupons if any coupon discount applied */}
          {(appliedCoupon || extraCoupon) && (
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-medium">Subtotal after coupons</span>
              <span className="font-semibold text-green-700">
                ₹{subtotalAfterCoupons.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        {/* Coupon Input Section */}
        <div className="my-5">
          <label className="mb-2 block text-xs font-semibold text-gray-500">
            DISCOUNT CODE
          </label>

          {appliedCoupon ? (
            // Show applied coupon
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <div>
                <span className="font-mono font-bold text-green-700">
                  {appliedCoupon.code}
                </span>
                <span className="text-green-600 text-sm ml-2">
                  -₹{appliedCoupon.discount}
                </span>
              </div>
              <button
                onClick={removeCoupon}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                <Image src={DeleteIcon} alt="Remove" />
              </button>
            </div>
          ) : (
            // Show coupon input
            <>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-md border px-3 py-2 text-sm outline-none"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="rounded-md bg-gray-100 px-4 text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-xs mt-1">{couponError}</p>
              )}
            </>
          )}
        </div>
        <div className="flex justify-between">
          <span>Tax (5% GST)</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-semibold text-sm sm:text-base">
            Total Amount
          </span>
          <span className="text-xl sm:text-2xl font-bold text-[#4D2A17]">
            ₹{total.toFixed(2)}
          </span>
        </div>

        {/* Total Savings Message */}
        {(productDiscount > 0 || totalCouponDiscount > 0) && (
          <div className="   mt-3 bg-green-50 border border-green-200 rounded-lg p-1 ">
            <span className="text-green-700 font-medium text-sm">
              🎉 You&apos;re saving{" "}
              <strong className="text-green-800">
                ₹{(productDiscount + totalCouponDiscount).toFixed(2)}
              </strong>{" "}
              on this purchase!
            </span>
          </div>
        )}

        {/* Coupon Nudge Message - Shows how much more to add to unlock extra discount */}
        {!extraCoupon && couponNudge?.nudge && (
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <div className="text-sm">
                <span className="text-amber-800">
                  Add <strong>₹{couponNudge.nudge.amountNeeded}</strong> more to
                  get extra <strong>{couponNudge.nudge.discountText}</strong>{" "}
                  with code{" "}
                  <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1 rounded">
                    {couponNudge.nudge.code}
                  </span>
                  !
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Extra Discount Coupon with Apply Button - Shows when user qualifies */}
        {!extraCoupon && couponNudge?.unlocked && (
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <div className="text-sm">
                  <span className="text-green-800">
                    You unlocked{" "}
                    <span className="font-mono font-bold text-green-900 bg-green-100 px-1 rounded">
                      {couponNudge.unlocked.code}
                    </span>{" "}
                    for <strong>{couponNudge.unlocked.discountText}</strong>!
                  </span>
                </div>
              </div>
              <button
                onClick={() => applyExtraCoupon(couponNudge.unlocked!.code)}
                disabled={extraCouponLoading}
                className="ml-2 rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {extraCouponLoading ? "..." : "Apply"}
              </button>
            </div>
          </div>
        )}

        {/* Show applied extra coupon with remove button */}
        {extraCoupon && (
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <div className="text-sm">
                  <span className="text-green-800">
                    Extra discount{" "}
                    <span className="font-mono font-bold text-green-900 bg-green-100 px-1 rounded">
                      {extraCoupon.code}
                    </span>{" "}
                    applied: <strong>-₹{extraCoupon.discount}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={removeExtraCoupon}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                <Image src={DeleteIcon} alt="Remove" />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={openModal}
          disabled={loading || cart.length === 0}
          className="mt-5 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4D2A17] py-3 font-semibold text-white text-sm sm:text-base hover:bg-amber-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Placing Order...
            </>
          ) : (
            <>Place Order →</>
          )}
        </button>
        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Secure Checkout
        </div>
      </div>
      {/* Customer Details Modal */}
      <CustomerDetailsModal onSubmit={placeOrder} />
    </>
  );
}
