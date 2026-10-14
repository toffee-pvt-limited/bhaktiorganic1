import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import { writeFile } from "fs/promises";
import path from "path";

// App Router: Configure larger body size (for image uploads)
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds

export async function POST(req) {
  try {
    const formData = await req.formData();

    const productId = formData.get("productId");
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const flavor = formData.get("flavor");
    const variantSizes = formData.get("variant_sizes"); // Expecting JSON string

    // Extract remaining fields
    const tag = formData.get("tag");
    const size = formData.get("size");
    const description2 = formData.get("description2");
    const description3 = formData.get("description3");
    const discount = formData.get("discount");
    const servingSize = formData.get("servingSize");
    const servingsPerContainer = formData.get("servingsPerContainer");
    const calories = formData.get("calories");
    const totalFat = formData.get("totalFat");
    const saturatedFat = formData.get("saturatedFat");
    const sodium = formData.get("sodium");
    const totalCarbohydrate = formData.get("totalCarbohydrate");
    const dietaryFiber = formData.get("dietaryFiber");
    const protein = formData.get("protein");
    const ingredients = formData.get("ingredients");

    const file = formData.get("image"); // Need to get the file object if present

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate variant_sizes
    if (!variantSizes) {
      return NextResponse.json(
        { error: "At least one size with price is required" },
        { status: 400 }
      );
    }

    // Parse and validate sizes
    let parsedSizes;
    try {
      parsedSizes = JSON.parse(variantSizes);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid sizes format" },
        { status: 400 }
      );
    }

    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
      return NextResponse.json(
        { error: "At least one size with price is required" },
        { status: 400 }
      );
    }

    // Check each size has valid size name and price
    const invalidSize = parsedSizes.find(
      (s) => !s.size || !s.price || s.price <= 0
    );
    if (invalidSize) {
      return NextResponse.json(
        { error: "All sizes must have a valid name and price greater than 0" },
        { status: 400 }
      );
    }

    let imagePath = null;
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      // Ensure uploads directory exists
      const fs = await import("fs");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uploadPath = path.join(uploadsDir, filename);

      await writeFile(uploadPath, buffer);
      console.log("✅ Image saved to:", uploadPath);
      imagePath = `/api/uploads/${filename}`;
    }

    // Insert variant
    const info = db
      .prepare(
        `
      INSERT INTO variants
      (product_id, name, description, price, image, tag, size, description2, description3, discount, servingSize, servingsPerContainer, calories, totalFat, saturatedFat, sodium, totalCarbohydrate, dietaryFiber, protein, ingredients, flavor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        productId || 1,
        name,
        description,
        price,
        imagePath,
        tag,
        size,
        description2,
        description3,
        discount,
        servingSize,
        servingsPerContainer,
        calories,
        totalFat,
        saturatedFat,
        sodium,
        totalCarbohydrate,
        dietaryFiber,
        protein,
        ingredients,
        flavor
      );

    const variantId = info.lastInsertRowid;

    // Handle multiple sizes
    if (variantSizes) {
      try {
        const parsedSizes = JSON.parse(variantSizes); // [{size: "100g", price: 100}, ...]
        const insertSize = db.prepare(
          "INSERT INTO variant_sizes (variant_id, size, price, is_default) VALUES (?, ?, ?, ?)"
        );
        for (const s of parsedSizes) {
          if (s.size && s.price) {
            insertSize.run(variantId, s.size, s.price, s.is_default || 0);
          }
        }
      } catch (e) {
        console.error("Error parsing variant sizes:", e);
      }
    }

    // Gallery images
    const galleryFiles = formData.getAll("gallery_images");
    if (galleryFiles && galleryFiles.length > 0) {
      const insertStart = db.prepare(
        "INSERT INTO variant_images (variant_id, image_url) VALUES (?, ?)"
      );

      for (const gFile of galleryFiles) {
        if (gFile && typeof gFile !== "string") {
          const bytes = await gFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-gallery-${gFile.name.replace(
            /\s+/g,
            "-"
          )}`;
          const uploadPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            filename
          );

          await writeFile(uploadPath, buffer);
          const giaPath = `/api/uploads/${filename}`;
          insertStart.run(variantId, giaPath);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database or Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request: " + error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get("productName");

  let query = `
    SELECT variants.id, variants.product_id, variants.name, variants.description, variants.price, variants.image, variants.tag, variants.size, variants.description2, variants.description3, variants.discount, variants.servingSize, variants.servingsPerContainer, variants.calories, variants.totalFat, variants.saturatedFat, variants.sodium, variants.totalCarbohydrate, variants.dietaryFiber, variants.protein, variants.ingredients, variants.flavor
    FROM variants
    WHERE (variants.is_deleted = 0 OR variants.is_deleted IS NULL)
  `;

  const params = [];

  if (productName) {
    query += ` AND variants.product_id IN (SELECT id FROM products WHERE name LIKE ? AND (is_deleted = 0 OR is_deleted IS NULL))`;
    params.push(`%${productName}%`);
  }

  const variants = db.prepare(query).all(...params);

  // Fetch multiple sizes for each variant
  const getSizes = db.prepare(
    "SELECT id, size, price, stock,is_default FROM variant_sizes WHERE variant_id = ?"
  );

  // Fetch gallery images for each variant
  const getGalleryImages = db.prepare(
    "SELECT image_url FROM variant_images WHERE variant_id = ?"
  );

  // Helper function to convert old /uploads/ paths to /api/uploads/
  const fixImagePath = (imgPath) => {
    if (imgPath && imgPath.startsWith("/uploads/")) {
      return imgPath.replace("/uploads/", "/api/uploads/");
    }
    return imgPath;
  };

  const variantsWithDetails = variants.map((v) => {
    const mainImage = fixImagePath(v.image);
    const galleryImages = getGalleryImages
      .all(v.id)
      .map((img) => fixImagePath(img.image_url));

    return {
      ...v,
      image: mainImage,
      images: [mainImage, ...galleryImages].filter(Boolean), // Combined array for editing
      available_sizes: getSizes.all(v.id),
    };
  });

  return NextResponse.json(variantsWithDetails);
}

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // This might not work if the ID is not in the path like /api/admin/variants/123

    // Better way to get ID when it's passed in the URL path segment (e.g. /api/admin/variants/[id])
    // But since this is a route.js in api/admin/variants, we might need dynamic route folder
    // checking file structure... c:\nareshaenterprises\frontend\app\api\admin\variants\route.js
    // This file seems to handle /api/admin/variants.
    // For /api/admin/variants/:id, we need a separate route file in [id] folder OR handle it here if it's passed differently.

    // WAIT, the frontend calls `/api/admin/variants/${editingId}`
    // This means there SHOULD be a folder `app/api/admin/variants/[id]`
    // Let me check the directory structure first.
    return NextResponse.json(
      { error: "Method not implemented in this file" },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
