import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Fetch available coupons for nudge messages
// Returns coupons with min_order_amount that user can potentially unlock
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cartTotal = parseFloat(searchParams.get("cartTotal") || "0");

    // Get active 'extra' category coupons with min_order_amount > 0
    // These are threshold-based coupons shown in the extra discount section
    const coupons = db
      .prepare(
        `
        SELECT id, code, discount_type, discount_value, min_order_amount 
        FROM coupons 
        WHERE is_active = 1 
          AND min_order_amount > 0
          AND (coupon_category = 'extra' OR coupon_category IS NULL AND min_order_amount >= 500)
          AND (expires_at IS NULL OR expires_at > datetime('now'))
          AND (max_uses IS NULL OR used_count < max_uses)
        ORDER BY min_order_amount ASC
      `
      )
      .all();

    // Find the next coupon user can unlock
    let nudge = null;

    for (const coupon of coupons) {
      if (cartTotal < coupon.min_order_amount) {
        // User hasn't reached this coupon's threshold yet
        const amountNeeded = Math.ceil(coupon.min_order_amount - cartTotal);
        const discountText =
          coupon.discount_type === "percentage"
            ? `${coupon.discount_value}% off`
            : `₹${coupon.discount_value} off`;

        nudge = {
          code: coupon.code,
          amountNeeded,
          minOrderAmount: coupon.min_order_amount,
          discountText,
          message: `Add ₹${amountNeeded} more to use code ${coupon.code} and get ${discountText}!`,
        };
        break; // Show only the nearest unlockable coupon
      }
    }

    // Also find if user has already unlocked a coupon they can use
    let unlocked = null;
    for (const coupon of coupons) {
      if (cartTotal >= coupon.min_order_amount) {
        const discountText =
          coupon.discount_type === "percentage"
            ? `${coupon.discount_value}% off`
            : `₹${coupon.discount_value} off`;

        unlocked = {
          code: coupon.code,
          discountText,
          message: `🎉 You unlocked code ${coupon.code} for ${discountText}!`,
        };
        // Continue to find the best unlocked coupon (highest min_order_amount that's unlocked)
      }
    }

    return NextResponse.json({
      nudge,
      unlocked,
    });
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
