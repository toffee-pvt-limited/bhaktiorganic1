const db = require("./lib/db");

try {
  console.log("--- Tables ---");
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  console.log(tables.map((t) => t.name));

  console.log("\n--- Variants Columns ---");
  const vCols = db.prepare("PRAGMA table_info(variants)").all();
  console.log(
    vCols.map((c) => c.name).includes("flavor")
      ? "✅ Flavor column exists"
      : "❌ Flavor column MISSING"
  );

  console.log("\n--- Variant Sizes Table ---");
  if (tables.find((t) => t.name === "variant_sizes")) {
    console.log("✅ variant_sizes table exists");
    const vsCols = db.prepare("PRAGMA table_info(variant_sizes)").all();
    console.log(
      "Columns:",
      vsCols.map((c) => c.name)
    );
  } else {
    console.log("❌ variant_sizes table MISSING");
  }

  console.log("\n--- Products ---");
  const products = db.prepare("SELECT * FROM products").all();
  console.log("Product count:", products.length);
  if (products.length > 0) console.log("First product:", products[0]);
} catch (error) {
  console.error("DB Check Failed:", error);
}
