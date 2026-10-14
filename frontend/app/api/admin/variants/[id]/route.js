import { NextResponse } from "next/server";
import db from "../../../../../lib/db";
import { writeFile, unlink } from "fs/promises";

import path from "path";

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "10mb", // increase limit
//     },
//   },
// };

// Helper function to convert old /uploads/ paths to /api/uploads/
const fixImagePath = (imgPath) => {
  if (imgPath && imgPath.startsWith("/uploads/")) {
    return imgPath.replace("/uploads/", "/api/uploads/");
  }
  return imgPath;
};

// GET SINGLE VARIANT
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Join with products table to get product name
    const variant = db
      .prepare(
        `
      SELECT v.*, p.name as product_name 
      FROM variants v 
      LEFT JOIN products p ON v.product_id = p.id 
      WHERE v.id = ?
    `
      )
      .get(id);

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Fetch gallery images
    const galleryImages = db
      .prepare("SELECT image_url FROM variant_images WHERE variant_id = ?")
      .all(id);

    // Fetch sizes (include id for cart verification)
    const availableSizes = db
      .prepare(
        "SELECT id, size, price, is_default FROM variant_sizes WHERE variant_id = ?"
      )
      .all(id);

    // Combine main image and gallery images (with path fix)
    variant.image = fixImagePath(variant.image);
    variant.images = [
      variant.image,
      ...galleryImages.map((img) => fixImagePath(img.image_url)),
    ].filter(Boolean);

    variant.available_sizes = availableSizes;

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Get error:", error);
    return NextResponse.json(
      { error: "Failed to get variant" },
      { status: 500 }
    );
  }
}

// SOFT DELETE VARIANT
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Soft delete the variant (keep related records intact)
    db.prepare(
      "UPDATE variants SET is_deleted = 1, deleted_at = datetime('now') WHERE id = ?"
    ).run(id);

    return NextResponse.json({
      success: true,
      message: "Variant soft deleted",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}

// RESTORE VARIANT
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Restore the variant
    db.prepare(
      "UPDATE variants SET is_deleted = 0, deleted_at = NULL WHERE id = ?"
    ).run(id);

    return NextResponse.json({ success: true, message: "Variant restored" });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore variant" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const formData = await req.formData();

    const productId = formData.get("productId");
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const tag = formData.get("tag");
    const file = formData.get("image");

    // New fields
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

    // Gallery images
    const galleryFiles = formData.getAll("gallery_images");

    // Images to delete
    const imagesToDelete = formData.get("images_to_delete");
    const deleteMainImage = formData.get("delete_main_image");

    const flavor = formData.get("flavor");
    const variantSizes = formData.get("variant_sizes"); // Expecting JSON string

    // Handle gallery image deletions
    if (imagesToDelete) {
      try {
        const imagesToDeleteArray = JSON.parse(imagesToDelete);
        for (const imgUrl of imagesToDeleteArray) {
          // Delete from database
          db.prepare(
            "DELETE FROM variant_images WHERE variant_id = ? AND image_url = ?"
          ).run(id, imgUrl);
        }
      } catch (e) {
        console.error("Error deleting images:", e);
      }
    }

    // 1. Check if variant exists
    const existing = db
      .prepare("SELECT image FROM variants WHERE id = ?")
      .get(id);
    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    let imagePath = existing.image; // Default to keep old image

    // Handle main image deletion
    if (deleteMainImage === "true") {
      imagePath = null; // Clear the main image
    }

    // 2. Handle new main image upload
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const uploadPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        filename
      );

      await writeFile(uploadPath, buffer);
      imagePath = `/api/uploads/${filename}`;
    }

    // 3. Update database (Variant details)
    db.prepare(
      `
      UPDATE variants SET
        product_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image = ?,
        tag = ?,
        size = ?,
        description2 = ?,
        description3 = ?,
        discount = ?,
        servingSize = ?,
        servingsPerContainer = ?,
        calories = ?,
        totalFat = ?,
        saturatedFat = ?,
        sodium = ?,
        totalCarbohydrate = ?,
        dietaryFiber = ?,
        protein = ?,
        ingredients = ?,
        flavor = ?
      WHERE id = ?
    `
    ).run(
      productId,
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
      flavor,
      id
    );

    // 3.5 Handle multiple sizes (Replace logic)
    if (variantSizes) {
      try {
        const parsedSizes = JSON.parse(variantSizes); // [{size: "100g", price: 100}, ...]

        // Transaction to ensure atomicity
        const updateSizes = db.transaction(() => {
          db.prepare("DELETE FROM variant_sizes WHERE variant_id = ?").run(id);
          const insertSize = db.prepare(
            "INSERT INTO variant_sizes (variant_id, size, price, is_default) VALUES (?, ?, ?, ?)"
          );
          for (const s of parsedSizes) {
            if (s.size && s.price) {
              insertSize.run(id, s.size, s.price, s.is_default || 0);
            }
          }
        });
        updateSizes();
      } catch (e) {
        console.error("Error updating variant sizes:", e);
      }
    }

    // 4. Handle Gallery Images Upload
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
          insertStart.run(id, giaPath);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

//get bests
