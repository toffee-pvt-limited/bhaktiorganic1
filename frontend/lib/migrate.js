const db = require("./db");

console.log("🚀 Running DB migration...");

// Helper function to safely add a column
function addColumn(table, column, type) {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
    console.log(`✅ Added ${column} to ${table}`);
  } catch (error) {
    if (error.message.includes("duplicate column")) {
      console.log(`ℹ️ ${column} already exists in ${table}`);
    } else {
      console.error(`❌ Error adding ${column}:`, error.message);
    }
  }
}

// Add missing columns to variants table
addColumn("variants", "flavor", "TEXT");
addColumn("variants", "description2", "TEXT");
addColumn("variants", "description3", "TEXT");
addColumn("variants", "discount", "TEXT");
addColumn("variants", "servingSize", "TEXT");
addColumn("variants", "servingsPerContainer", "TEXT");
addColumn("variants", "calories", "TEXT");
addColumn("variants", "totalFat", "TEXT");
addColumn("variants", "saturatedFat", "TEXT");
addColumn("variants", "sodium", "TEXT");
addColumn("variants", "totalCarbohydrate", "TEXT");
addColumn("variants", "dietaryFiber", "TEXT");
addColumn("variants", "protein", "TEXT");
addColumn("variants", "ingredients", "TEXT");

// Add is_default column to variant_sizes
addColumn("variant_sizes", "is_default", "INTEGER DEFAULT 0");

// Add soft delete columns to products
addColumn("products", "is_deleted", "INTEGER DEFAULT 0");
addColumn("products", "deleted_at", "TEXT");

// Add soft delete columns to variants
addColumn("variants", "is_deleted", "INTEGER DEFAULT 0");
addColumn("variants", "deleted_at", "TEXT");

// =========================
// ORDERS TABLE
// =========================
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    subtotal REAL,
    tax REAL,
    total REAL,
    created_at TEXT
  )
`
).run();

// Add coupon columns to orders table (after table is created)
addColumn("orders", "coupon_code", "TEXT");
addColumn("orders", "discount_amount", "REAL DEFAULT 0");

// =========================
// ORDER ITEMS TABLE
// =========================
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_name TEXT,
    size TEXT,
    price REAL,
    quantity INTEGER
  )
`
).run();

// =========================
// COUPONS TABLE
// =========================
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_at TEXT
  )
`
).run();

console.log("✅ Migration completed!");
