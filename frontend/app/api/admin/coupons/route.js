import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET - List all coupons
export async function GET() {
  try {
    const coupons = db.prepare("SELECT * FROM coupons ORDER BY id DESC").all();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount = 0,
      max_uses = null,
      is_active = 1,
      expires_at = null,
      coupon_category = "regular",
    } = body;

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: "Code, discount type, and discount value are required" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existing = db
      .prepare("SELECT id FROM coupons WHERE code = ?")
      .get(code.toUpperCase());
    if (existing) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const created_at = new Date().toISOString();

    const result = db
      .prepare(
        `
      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, is_active, expires_at, created_at, coupon_category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        code.toUpperCase(),
        discount_type,
        discount_value,
        min_order_amount,
        max_uses,
        is_active,
        expires_at,
        created_at,
        coupon_category
      );

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      code,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      is_active,
      expires_at,
      coupon_category = "regular",
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Check if coupon exists
    const existing = db.prepare("SELECT id FROM coupons WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    db.prepare(
      `
      UPDATE coupons 
      SET code = ?, discount_type = ?, discount_value = ?, 
          min_order_amount = ?, max_uses = ?, is_active = ?, expires_at = ?, coupon_category = ?
      WHERE id = ?
    `
    ).run(
      code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      is_active,
      expires_at,
      coupon_category,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    db.prepare("DELETE FROM coupons WHERE id = ?").run(id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
