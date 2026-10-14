import { NextResponse } from "next/server";
import db from "@/lib/db";

// POST - Validate coupon code
export async function POST(req) {
  try {
    const body = await req.json();
    const { code, cartTotal, isExtraDiscount = false } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    // Find coupon by code
    const coupon = db
      .prepare("SELECT * FROM coupons WHERE code = ?")
      .get(code.toUpperCase());

    // Check if coupon exists
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Check if this is an 'extra' category coupon being used in manual input (not allowed)
    // But if isExtraDiscount is true, it's being applied from the extra discount section (allowed)
    if (coupon.coupon_category === "extra" && !isExtraDiscount) {
      return NextResponse.json({
        valid: false,
        message: "This coupon code is not valid ",
      });
    }

    // Check if trying to use a 'regular' coupon in the extra discount section (not allowed)
    if (coupon.coupon_category !== "extra" && isExtraDiscount) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is not an extra discount coupon",
      });
    }

    // Check if coupon is active
    if (coupon.is_active !== 1) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is no longer active",
      });
    }

    // Check if coupon is expired
    if (coupon.expires_at) {
      const expiryDate = new Date(coupon.expires_at);
      const now = new Date();
      if (now > expiryDate) {
        return NextResponse.json({
          valid: false,
          message: "This coupon has expired",
        });
      }
    }

    // Check minimum order amount
    if (cartTotal < coupon.min_order_amount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount is ₹${coupon.min_order_amount}`,
      });
    }

    // Check usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round((cartTotal * coupon.discount_value) / 100);
    } else {
      // Fixed amount discount
      discountAmount = coupon.discount_value;
    }

    // Make sure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return NextResponse.json({
      valid: true,
      discount: discountAmount,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      minOrderAmount: coupon.min_order_amount,
      couponId: coupon.id,
      message: `Coupon applied! You save ₹${discountAmount}`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
