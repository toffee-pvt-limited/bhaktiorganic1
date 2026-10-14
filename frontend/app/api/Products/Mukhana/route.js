import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req,Request) {
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get("productName");

  let query = `
    SELECT 
      products.id as productId,
      products.name as productName,
      variants.id as variantId,
      variants.name as variantName,
      variants.price,
      variants.description,
      variants.image,
      variants.tag
    FROM products
    JOIN variants ON products.id = variants.product_id
  `;

  const params = [];

  if (productName) {
    query += ` WHERE products.name LIKE ?`;
    params.push(`%${productName}%`);
  }

  const rows = db.prepare(query).all(...params);

  return NextResponse.json(rows);
}
