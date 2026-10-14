const db = require("./db");

// Clear old data (important)
db.prepare("DELETE FROM variants").run();
db.prepare("DELETE FROM products").run();

// Insert product
const product = db
  .prepare("INSERT INTO products (name) VALUES (?)")
  .run("Makhana");

// Get product ID
const productId = product.lastInsertRowid;

// Insert variants
const insert = db.prepare(`
  INSERT INTO variants 
  (product_id, name, description, price, image, tag)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insert.run(
  productId,
  "Classic Salted",
  "Classic Salted",
  299,
  "/makhana1.png",
  "Bestseller"
);
insert.run(
  productId,
  "Peri Peri Punch",
  "Peri Peri Punch",
  299,
  "/makhana2.png",
  null
);
insert.run(
  productId,
  "Cream & Onion",
  "Cream & Onion",
  299,
  "/makhana3.png",
  null
);

console.log("✅ Database created & data inserted");
