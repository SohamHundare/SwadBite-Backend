const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    deliveryAddress: { type: String },
    isTakeaway: { type: Boolean, required: true },
    paymentMethod: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    stripeSessionId: { type: String }, // new
    status: { type: String, default: "pending" }, //new
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
