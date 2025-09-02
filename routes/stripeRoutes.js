const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const Order = require("../models/Order");

dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// routes/stripeRoutes.js (replace the POST handler)
router.post("/create-checkout-session", async (req, res) => {
  const { amount, userId, items = [], customerName, deliveryAddress, isTakeaway } = req.body;
  console.log("🔔 create-checkout-session body:", { amount, userId, items, customerName, deliveryAddress, isTakeaway });

  // Validate items/amount
  if ((!Array.isArray(items) || items.length === 0) && !amount) {
    return res.status(400).json({ error: "No items or amount provided" });
  }

  try {
    // Build line_items safely. Expect item.price and item.quantity in RUPEES and units.
    const line_items = (Array.isArray(items) && items.length > 0)
      ? items.map(item => {
          const priceRupees = Number(item.price || 0);
          return {
            price_data: {                                  
              currency: "inr",
              product_data: { name: item.name || "SwadBite Item" },
              unit_amount: Math.round(priceRupees * 100), // RUPEES -> PAISE
            },
            quantity: Number(item.quantity) || 1,
          };
        })
      : [{
          price_data: {
            currency: "inr",
            product_data: { name: item.name || "SwadBite Order" },
            unit_amount: Math.round(Number(amount || 0) * 100), // RUPEES -> PAISE fallback
          },
          quantity: 1
        }];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://swad-bite.vercel.app/payment/success",
      cancel_url: "https://swad-bite.vercel.app/payment/fail",
    });

    console.log("✅ Stripe session created:", session.id);

    // Save order (catch DB errors but don't block returning the session)
    const newOrder = new Order({
      userId,
      customerName,
      deliveryAddress,
      isTakeaway,
      paymentMethod: "card",
      totalAmount: Number(amount) || // rupees
                  (line_items.reduce((s, li) => s + (li.price_data.unit_amount * li.quantity), 0) / 100),
      items,
      stripeSessionId: session.id,
      status: "pending",
    });

    try {
      await newOrder.save();
      console.log("✅ Order saved to DB");
    } catch (dbErr) {
      console.error("DB Save Error (non-fatal):", dbErr.message);
      // do not return 500 if DB save fails — still return session id
    }

    return res.json({ id: session.id });
  } catch (err) {
    // Log raw for debugging
    console.error("Stripe Error (create-checkout-session):", err);
    return res.status(500).json({ error: err.raw?.message || err.message || "Stripe error" });
  }
});


// ----------------- STRIPE WEBHOOK -----------------
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
  
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.sendStatus(400);
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Update order in DB
    Order.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: "paid" },
      { new: true }
    )
      .then((order) => console.log("✅ Order marked as paid:", order))
      .catch((err) => console.error("DB update error:", err));
  }

  res.json({ received: true });
});

module.exports = router;
