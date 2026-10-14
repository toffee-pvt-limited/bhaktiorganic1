const db = require("./lib/db");
const fs = require("fs");
const path = require("path");

try {
  console.log("Checking schema...");
  const variantsInfo = db.prepare("PRAGMA table_info(variants)").all();
  // Check if variant_sizes table exists first
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='variant_sizes'"
    )
    .get();

  let variantSizesInfo = [];
  if (tables) {
    variantSizesInfo = db.prepare("PRAGMA table_info(variant_sizes)").all();
  }

  const output = {
    variants_columns: variantsInfo.map((c) => c.name),
    variant_sizes_exists: !!tables,
    variant_sizes_columns: variantSizesInfo.map((c) => c.name),
  };

  const outPath = path.join(process.cwd(), "schema_status.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log("Schema wrote to " + outPath);
} catch (e) {
  console.error(e);
  fs.writeFileSync("schema_error.txt", e.toString());
}
