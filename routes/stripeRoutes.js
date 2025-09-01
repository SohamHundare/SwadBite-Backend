const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
//new
const Order = require("../models/Order");

dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// // ----------------- CREATE CHECKOUT SESSION -----------------
// router.post("/create-checkout-session", async (req, res) => {
//   const { amount , userId , items } = req.body; //new ,first had only amount

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: "SwadBite Mess Fee",
//             },
//             unit_amount: Math.round(amount),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       //success_url: "https://swadbite-backend-2.onrender.com/payment/success",
//       //cancel_url: "https://swadbite-backend-2.onrender.com/payment/fail",

//       success_url: "https://swad-bite.vercel.app/payment/success",
//       cancel_url: "https://swad-bite.vercel.app/payment/fail",
//     });

//     // Save order in DB as pending //new
//     const newOrder = new Order({
//       userId,
//       items,
//       amount,
//       stripeSessionId: session.id,
//       status: "pending",
//     });

//     await newOrder.save();

//     res.json({ id: session.id });
//   } catch (error) {
//     console.error("Stripe Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/create-checkout-session", async (req, res) => {
  const { amount, userId, items, customerName, isTakeaway } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map(item => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: "payment",
      success_url: "https://swad-bite.vercel.app/payment/success",
      cancel_url: "https://swad-bite.vercel.app/payment/fail",
    });

    const newOrder = new Order({
      userId,
      customerName,
      isTakeaway,
      paymentMethod: "card",
      totalAmount: amount / 100,
      items,
      stripeSessionId: session.id,
      status: "pending",
    });

    await newOrder.save();
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
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
