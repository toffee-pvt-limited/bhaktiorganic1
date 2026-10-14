import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const info = db.prepare("INSERT INTO products (name) VALUES (?)").run(name);

    return NextResponse.json({
      success: true,
      id: info.lastInsertRowid,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// ✅ FETCH ALL PRODUCTS (only non-deleted)
export async function GET() {
  try {
    const products = db
      .prepare(
        "SELECT id, name FROM products WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY id ASC"
      )
      .all();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ✅ SOFT DELETE PRODUCT
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Soft delete related variants
    db.prepare(
      "UPDATE variants SET is_deleted = 1, deleted_at = datetime('now') WHERE product_id = ?"
    ).run(id);

    // Soft delete product
    db.prepare(
      "UPDATE products SET is_deleted = 1, deleted_at = datetime('now') WHERE id = ?"
    ).run(id);

    return NextResponse.json({
      success: true,
      message: "Product soft deleted",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

// ✅ RESTORE PRODUCT (new endpoint)
export async function PATCH(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Restore product
    db.prepare(
      "UPDATE products SET is_deleted = 0, deleted_at = NULL WHERE id = ?"
    ).run(id);

    // Restore related variants
    db.prepare(
      "UPDATE variants SET is_deleted = 0, deleted_at = NULL WHERE product_id = ?"
    ).run(id);

    return NextResponse.json({ success: true, message: "Product restored" });
  } catch (error) {
    console.error("Restore product error:", error);
    return NextResponse.json(
      { error: "Failed to restore product" },
      { status: 500 }
    );
  }
}
