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