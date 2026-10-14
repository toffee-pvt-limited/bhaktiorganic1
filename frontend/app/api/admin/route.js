import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function POST(req) {
  const body = await req.json();

  const {
    productId,
    name,
    description,
    price,
    image,
    tag,
  } = body;

  // Insert variant
  db.prepare(`
    INSERT INTO variants
    (product_id, name, description, price, image, tag)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    productId,
    name,
    description,
    price,
    image,
    tag
  );

  return NextResponse.json({ success: true });
}
