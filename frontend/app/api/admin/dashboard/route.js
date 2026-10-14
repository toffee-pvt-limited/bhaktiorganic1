import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET() {
  const products = db.prepare(`
    SELECT * FROM products
  `).all();

  const variants = db.prepare(`
    SELECT * FROM variants
  `).all();

  // attach variants to products
  const result = products.map((product) => ({
    ...product,
    variants: variants.filter(
      (v) => v.product_id === product.id
    ),
  }));

  return NextResponse.json(result);
}
