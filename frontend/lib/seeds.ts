import db from "./db";

// Insert product
const product = db
  .prepare("INSERT INTO products (name, category, image) VALUES (?, ?, ?)")
  .run("Makhana", "Dry Fruits", "/makhana-cover.png");

const productId = product.lastInsertRowid;

// Insert variants
const insertVariant = db.prepare(`
  INSERT INTO variants (product_id, name, description, price, image, tag)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertVariant.run(productId, "Classic Salted", "The original crunch, simply salted.", 299, "/makhana1.png", "Bestseller");
insertVariant.run(productId, "Peri Peri Punch", "Spicy kick for the bold snacker.", 299, "/makhana2.png", null);
insertVariant.run(productId, "Cream & Onion", "Savory delight with herbs.", 299, "/makhana3.png", null);
insertVariant.run(productId, "Turmeric Gold", "Immunity booster blend.", 299, "/makhana4.png", null);

console.log("Makhana variants added!");
