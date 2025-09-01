// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import existing routes
const testimonialRoutes = require('./routes/testimonialRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const userRoutes = require('./routes/UserRouter'); 

const app = express();

// server.js — put this BEFORE app.use(express.json())
const stripeRaw = express.raw({ type: "application/json" });

app.post("/api/stripe/webhook", stripeRaw, (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // handle event types
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // Update order in DB (non-blocking)
      Order.findOneAndUpdate({ stripeSessionId: session.id }, { status: "paid" }, { new: true })
        .then(o => console.log("✅ Order marked paid via webhook:", o))
        .catch(e => console.error("Webhook DB update error:", e));
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Use existing routes
app.use("/api/stripe", stripeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use('/api/users', userRoutes);

// ======================
// 🚀 Complaint Schema + Route
// ======================
const complaintSchema = new mongoose.Schema({
  name: String,
  phone: String,
  place: String,
  foodType: String,
  messName: String,
  complaintType: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.model("Complaint", complaintSchema);

app.post("/api/complaints", async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.json({ success: true, message: "Complaint saved successfully!" });
  } catch (error) {
    console.error("Complaint save error:", error);
    res.status(500).json({ success: false, message: "Error saving complaint" });
  }
});

// ======================
// 🚀 Mess Schema + Routes
// ======================
const messSchema = new mongoose.Schema({
  name: String,
  location: String,
  rating: String,
  image: String,
  map: String,
  createdAt: { type: Date, default: Date.now },
});

const Mess = mongoose.model("Mess", messSchema);

// ➤ Get all messes
app.get("/api/messes", async (req, res) => {
  try {
    const messes = await Mess.find();
    res.json(messes);
  } catch (error) {
    console.error("Error fetching messes:", error);
    res.status(500).json({ success: false, message: "Error fetching messes" });
  }
});

// ➤ Add new mess
app.post("/api/messes", async (req, res) => {
  try {
    const mess = new Mess(req.body);
    await mess.save();
    res.status(201).json({ success: true, mess });
  } catch (error) {
    console.error("Error saving mess:", error);
    res.status(500).json({ success: false, message: "Error saving mess" });
  }
});

// ======================
// 🚀 Offer Schema + Routes
// ======================
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true }, // percentage
  image: { type: String }, // optional
  validTill: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Offer = mongoose.model("Offer", offerSchema);

// ➤ Get all offers
app.get("/api/offers", async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ success: false, message: "Error fetching offers" });
  }
});

// ➤ Add new offer
app.post("/api/offers", async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error("Error saving offer:", error);
    res.status(500).json({ success: false, message: "Error saving offer" });
  }
});

// ======================
// 🚀 MongoDB Connection
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
