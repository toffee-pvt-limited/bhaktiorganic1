import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer, cartItems, couponCode, extraCouponCode } = body;

    if (!customer || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    let calculatedTotal = 0;

    // 🔐 BACKEND VERIFIED ITEMS
    const verifiedItems = [];

    for (const item of cartItems) {
      let variant;
      let finalPrice;
      let verifiedSize;
      let verifiedName;

      if (!item.quantity || item.quantity <= 0) {
        throw new Error("Invalid quantity");
      }

      // If sizeId is provided, verify from variant_sizes table (new cart items)
      if (item.sizeId) {
        const sizeData = db
          .prepare(
            `
            SELECT vs.id, vs.size, vs.price, v.discount, v.name, p.name as product_name
            FROM variant_sizes vs
            JOIN variants v ON v.id = vs.variant_id
            JOIN products p ON p.id = v.product_id
            WHERE vs.id = ?
          `
          )
          .get(item.sizeId);

        if (!sizeData) {
          throw new Error(`Invalid product size (sizeId: ${item.sizeId})`);
        }

        const basePrice = sizeData.price;
        const discount = sizeData.discount || 0;
        finalPrice =
          discount > 0
            ? Math.round(basePrice - (basePrice * discount) / 100)
            : basePrice;
        verifiedSize = sizeData.size;
        verifiedName = sizeData.name || sizeData.product_name;
      } else {
        // Fallback: verify from variants table (legacy cart items without sizeId)
        variant = db
          .prepare(
            `
            SELECT p.name, v.price, v.discount, v.size
            FROM variants v
            JOIN products p ON p.id = v.product_id
            WHERE v.id = ?
          `
          )
          .get(item.id);

        if (!variant) {
          throw new Error(`Invalid product (id: ${item.id})`);
        }

        const basePrice = variant.price;
        const discount = variant.discount || 0;
        finalPrice =
          discount > 0
            ? Math.round(basePrice - (basePrice * discount) / 100)
            : basePrice;
        verifiedSize = variant.size;
        verifiedName = variant.name;
      }

      const itemTotal = finalPrice * item.quantity;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        name: verifiedName,
        size: verifiedSize,
        quantity: item.quantity,
        price: finalPrice,
        total: itemTotal,
      });
    }

    // =========================
    // 🎟️ VALIDATE COUPON ON SERVER (SECURITY)
    // =========================
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = db
        .prepare("SELECT * FROM coupons WHERE code = ?")
        .get(couponCode.toUpperCase());

      if (coupon && coupon.is_active === 1) {
        // Check expiry
        let isValid = true;
        if (coupon.expires_at) {
          const expiryDate = new Date(coupon.expires_at);
          if (new Date() > expiryDate) isValid = false;
        }

        // Check usage limit
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
          isValid = false;
        }

        // Check minimum order
        if (calculatedTotal < coupon.min_order_amount) {
          isValid = false;
        }

        if (isValid) {
          // Calculate discount
          if (coupon.discount_type === "percentage") {
            discountAmount = Math.round(
              (calculatedTotal * coupon.discount_value) / 100
            );
          } else {
            discountAmount = coupon.discount_value;
          }

          // Don't let discount exceed subtotal
          if (discountAmount > calculatedTotal) {
            discountAmount = calculatedTotal;
          }

          appliedCouponCode = coupon.code;

          // Increment usage count
          db.prepare(
            "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?"
          ).run(coupon.id);
        }
      }
    }

    // =========================
    // 🎁 VALIDATE EXTRA COUPON ON SERVER
    // =========================
    let extraDiscountAmount = 0;
    let appliedExtraCouponCode = null;

    // Both coupons apply on the same subtotal (calculatedTotal), not cascaded

    if (extraCouponCode && extraCouponCode !== couponCode?.toUpperCase()) {
      const extraCoupon = db
        .prepare("SELECT * FROM coupons WHERE code = ?")
        .get(extraCouponCode.toUpperCase());

      if (extraCoupon && extraCoupon.is_active === 1) {
        let isValid = true;

        // Check expiry
        if (extraCoupon.expires_at) {
          const expiryDate = new Date(extraCoupon.expires_at);
          if (new Date() > expiryDate) isValid = false;
        }

        // Check usage limit
        if (
          extraCoupon.max_uses !== null &&
          extraCoupon.used_count >= extraCoupon.max_uses
        ) {
          isValid = false;
        }

        // Check minimum order (against calculatedTotal, same as regular coupon)
        if (calculatedTotal < extraCoupon.min_order_amount) {
          isValid = false;
        }

        if (isValid) {
          // Calculate extra discount on calculatedTotal (same base as regular coupon)
          if (extraCoupon.discount_type === "percentage") {
            extraDiscountAmount = Math.round(
              (calculatedTotal * extraCoupon.discount_value) / 100
            );
          } else {
            extraDiscountAmount = extraCoupon.discount_value;
          }

          // Don't let extra discount exceed calculatedTotal
          if (extraDiscountAmount > calculatedTotal) {
            extraDiscountAmount = calculatedTotal;
          }

          appliedExtraCouponCode = extraCoupon.code;

          // Increment usage count
          db.prepare(
            "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?"
          ).run(extraCoupon.id);
        }
      }
    }

    // Calculate totals with both discounts applied
    const totalDiscountAmount = discountAmount + extraDiscountAmount;
    const subtotalAfterDiscount = calculatedTotal - totalDiscountAmount;

    // 💰 Calculate GST (5%) on discounted amount
    const gstRate = 0.05;
    const gstAmount = Math.round(subtotalAfterDiscount * gstRate * 100) / 100;
    const grandTotal =
      Math.round((subtotalAfterDiscount + gstAmount) * 100) / 100;

    // 📧 EMAIL HTML
    const itemsHtml = verifiedItems
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.size}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${item.total}</td>
        </tr>
      `
      )
      .join("");

    // ===============================
    // 🧾 SAVE ORDER IN DATABASE
    // ===============================
    const createdAt = new Date().toISOString();

    const orderResult = db
      .prepare(
        `
      INSERT INTO orders (
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        subtotal,
        tax,
        total,
        coupon_code,
        discount_amount,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        calculatedTotal,
        gstAmount,
        grandTotal,
        appliedCouponCode,
        discountAmount,
        createdAt
      );

    // SQLite automatically gives order ID
    const orderId = orderResult.lastInsertRowid;

    // ===============================
    // 📦 SAVE ORDER ITEMS
    // ===============================
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id,
        product_name,
        size,
        price,
        quantity
      ) VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of verifiedItems) {
      insertItem.run(orderId, item.name, item.size, item.price, item.quantity);
    }

    const mailHtml = `
      <h2>🛒 New Order Received</h2>

      <h3>Customer Details</h3>
      <p>
        <b>Name:</b> ${customer.name}<br/>
        <b>Email:</b> ${customer.email}<br/>
        <b>Phone:</b> ${customer.phone}<br/>
        <b>Address:</b> ${customer.address}
      </p>

      <h3>Order Items</h3>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Item</th>
          <th>Size</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
        ${itemsHtml}
      </table>

      <h3>Order Summary</h3>
      <p>
        <b>Subtotal:</b> ₹${calculatedTotal}<br/>
        ${
          discountAmount > 0
            ? `<b>Discount (${appliedCouponCode}):</b> -₹${discountAmount}<br/>`
            : ""
        }
        ${
          extraDiscountAmount > 0
            ? `<b>🎁 Extra Discount (${appliedExtraCouponCode}):</b> -₹${extraDiscountAmount}<br/>`
            : ""
        }
        <b>GST (5%):</b> ₹${gstAmount.toFixed(2)}<br/>
        <b>Shipping:</b> Free<br/>
        <hr/>
        <b style="font-size: 1.2em;">Grand Total: ₹${grandTotal.toFixed(2)}</b>
      </p>
    `;

    // 📤 SEND EMAIL
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Mukhana Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "🛍️ New Order Received",
      html: mailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order email error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
